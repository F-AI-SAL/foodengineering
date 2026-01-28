import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { NotificationsService } from "./notifications.service";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 5 * 60 * 1000;

@Injectable()
export class NotificationsQueue implements OnModuleInit {
  private readonly logger = new Logger(NotificationsQueue.name);
  private processing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  onModuleInit() {
    this.scheduleNext();
  }

  async enqueue(channel: "email" | "whatsapp", payload: Record<string, unknown>) {
    await this.prisma.notificationJob.create({
      data: {
        channel,
        payloadJson: payload as Prisma.InputJsonValue,
        status: "queued",
        attempts: 0
      }
    });
  }

  private scheduleNext() {
    if (this.processing) {
      return;
    }
    this.processing = true;
    setTimeout(() => {
      void this.processQueue().finally(() => {
        this.processing = false;
        this.scheduleNext();
      });
    }, 10000);
  }

  private async processQueue() {
    const job = await this.prisma.notificationJob.findFirst({
      where: { status: "queued", scheduledAt: { lte: new Date() } },
      orderBy: { createdAt: "asc" }
    });

    if (!job) {
      return;
    }

    try {
      await this.prisma.notificationJob.update({
        where: { id: job.id },
        data: { status: "processing" }
      });

      if (job.channel === "email") {
        await this.notificationsService.sendEmail(job.payloadJson as any);
      } else {
        await this.notificationsService.sendWhatsApp(job.payloadJson as any);
      }

      await this.prisma.notificationJob.update({
        where: { id: job.id },
        data: { status: "sent", sentAt: new Date() }
      });
    } catch (error) {
      const attempts = job.attempts + 1;
      const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempts - 1), 12 * 60 * 60 * 1000);
      const nextRun = new Date(Date.now() + delay);

      await this.prisma.notificationJob.update({
        where: { id: job.id },
        data: {
          status: attempts >= MAX_RETRIES ? "failed" : "queued",
          attempts,
          scheduledAt: attempts >= MAX_RETRIES ? job.scheduledAt : nextRun,
          lastError: (error as Error)?.message ?? "Unknown error"
        }
      });

      this.logger.warn(`Notification job ${job.id} failed. Retry in ${delay / 60000} min.`);
    }
  }
}
