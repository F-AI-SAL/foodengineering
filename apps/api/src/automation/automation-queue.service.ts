import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AutomationExecutorService } from "./automation-executor.service";

interface QueueJob {
  id: string;
  ruleId: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class AutomationQueueService {
  private readonly logger = new Logger(AutomationQueueService.name);
  private readonly queue: QueueJob[] = [];
  private processing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly executor: AutomationExecutorService
  ) {}

  async enqueue(ruleId: string, payload: Record<string, unknown>) {
    const execution = await this.prisma.automationExecution.create({
      data: {
        ruleId,
        status: "queued",
        outputJson: payload as Prisma.InputJsonValue
      }
    });

    this.queue.push({ id: execution.id, ruleId, payload });
    void this.process();
    return execution;
  }

  private async process() {
    if (this.processing) {
      return;
    }

    this.processing = true;
    try {
      while (this.queue.length) {
        const job = this.queue.shift();
        if (!job) {
          continue;
        }
        await this.runJob(job);
      }
    } finally {
      this.processing = false;
    }
  }

  private async runJob(job: QueueJob) {
    try {
      await this.prisma.automationExecution.update({
        where: { id: job.id },
        data: { status: "running", ranAt: new Date() }
      });

      const rule = await this.prisma.automationRule.findUnique({ where: { id: job.ruleId } });
      if (!rule) {
        throw new Error(`Automation rule ${job.ruleId} not found.`);
      }

      const output = await this.executor.execute(rule);

      await this.prisma.automationExecution.update({
        where: { id: job.id },
        data: { status: "success", outputJson: output }
      });
    } catch (error) {
      const message = (error as Error)?.message ?? "Unknown error";
      this.logger.warn(`Automation execution ${job.id} failed: ${message}`);
      await this.prisma.automationExecution
        .update({
          where: { id: job.id },
          data: { status: "failed", errorMessage: message }
        })
        .catch((updateError) =>
          this.logger.error(
            `Failed to record execution failure for ${job.id}`,
            updateError as Error
          )
        );
    }
  }
}
