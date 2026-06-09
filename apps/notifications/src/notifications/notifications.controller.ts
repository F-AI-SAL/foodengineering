import { BadRequestException, Body, Controller, Get, Headers, Logger, Post, Query, UseGuards, UnauthorizedException, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { timingSafeEqual } from "crypto";
import { NotificationsService } from "./notifications.service";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsQueue } from "./notifications.queue";
import { NotificationTestDto } from "./dto/notification-test.dto";
import { NotificationQueueDto } from "./dto/notification-queue.dto";

@Controller("notifications")
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsQueue: NotificationsQueue,
    private readonly config: ConfigService
  ) {}

  @Get("status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  async status(@Query("status") status?: string) {
    const [queued, failed, sent] = await Promise.all([
      this.prisma.notificationJob.count({ where: { status: "queued" } }),
      this.prisma.notificationJob.count({ where: { status: "failed" } }),
      this.prisma.notificationJob.count({ where: { status: "sent" } })
    ]);

    const statusFilter =
      status === "queued" || status === "failed" || status === "sent" ? status : undefined;

    const latest = await this.prisma.notificationJob.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 12
    });

    return {
      providers: {
        email: this.notificationsService["emailProvider"],
        whatsapp: this.notificationsService["whatsappProvider"]
      },
      counts: { queued, failed, sent },
      latest
    };
  }

  @Post("retry")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  async retryFailed() {
    await this.prisma.notificationJob.updateMany({
      where: { status: "failed" },
      data: { status: "queued", scheduledAt: new Date() }
    });
    return { message: "Failed jobs re-queued." };
  }

  @Post("queue")
  async enqueue(@Body() dto: NotificationQueueDto, @Headers("x-service-key") serviceKey?: string) {
    this.assertServiceKey(serviceKey);
    await this.notificationsQueue.enqueue(dto.channel, dto.payload);
    return { message: "Queued." };
  }

  private assertServiceKey(serviceKey?: string) {
    const requiredKey = this.config.get<string>("NOTIFICATIONS_SHARED_SECRET");
    const isProduction =
      (this.config.get<string>("NODE_ENV") ?? process.env.NODE_ENV) === "production";

    if (!requiredKey || !requiredKey.trim()) {
      // Fail closed in production; allow (with a warning) in non-production for local dev.
      if (isProduction) {
        throw new ServiceUnavailableException(
          "NOTIFICATIONS_SHARED_SECRET is not configured; refusing unauthenticated service requests."
        );
      }
      this.logger.warn(
        "NOTIFICATIONS_SHARED_SECRET is not set; allowing unauthenticated /notifications/queue in non-production only."
      );
      return;
    }

    const provided = Buffer.from(serviceKey ?? "");
    const expected = Buffer.from(requiredKey);
    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      throw new UnauthorizedException("Invalid service key.");
    }
  }

  @Post("test")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  async sendTest(@Body() dto: NotificationTestDto) {
    const recipient = dto.email ?? this.config.get<string>("NOTIFICATION_TEST_EMAIL") ?? undefined;

    if (!recipient) {
      throw new BadRequestException("NOTIFICATION_TEST_EMAIL is not set.");
    }

    await this.notificationsQueue.enqueue("email", {
      to: recipient,
      subject: "Food Engineering notification test",
      text: "This is a test notification from Food Engineering.",
      html: "<p>This is a test notification from <strong>Food Engineering</strong>.</p>"
    });

    return { message: "Test email queued.", to: recipient };
  }
}
