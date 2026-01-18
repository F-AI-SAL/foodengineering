import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

interface QueueJob {
  id: string;
  ruleId: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class AutomationQueueService {
  private readonly queue: QueueJob[] = [];
  private processing = false;

  constructor(private readonly prisma: PrismaService) {}

  async enqueue(ruleId: string, payload: Record<string, unknown>) {
    const execution = await this.prisma.automationExecution.create({
      data: {
        ruleId,
        status: "queued",
        outputJson: payload as Prisma.InputJsonValue
      }
    });

    this.queue.push({ id: execution.id, ruleId, payload });
    this.process();
    return execution;
  }

  private async process() {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length) {
      const job = this.queue.shift();
      if (!job) {
        continue;
      }

      await this.prisma.automationExecution.update({
        where: { id: job.id },
        data: { status: "running", ranAt: new Date() }
      });

      try {
        await this.prisma.automationExecution.update({
          where: { id: job.id },
          data: {
            status: "success",
            outputJson: job.payload as Prisma.InputJsonValue
          }
        });
      } catch (error) {
        await this.prisma.automationExecution.update({
          where: { id: job.id },
          data: { status: "failed", errorMessage: (error as Error).message }
        });
      }
    }

    this.processing = false;
  }
}
