import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { AutomationQueueService } from "./automation-queue.service";

@Injectable()
export class AutomationSchedulerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: AutomationQueueService
  ) {}

  @Cron("*/5 * * * *")
  async enqueueScheduledRules() {
    const rules = await this.prisma.automationRule.findMany({
      where: {
        isActive: true,
        triggerType: "schedule"
      }
    });

    await Promise.all(
      rules.map((rule) =>
        this.queue.enqueue(rule.id, {
          source: "cron",
          ruleId: rule.id,
          triggerConfig: rule.triggerConfigJson
        })
      )
    );
  }
}
