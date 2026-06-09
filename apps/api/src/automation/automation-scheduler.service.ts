import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { AutomationQueueService } from "./automation-queue.service";

const DEFAULT_INTERVAL_MINUTES = 1440; // daily

@Injectable()
export class AutomationSchedulerService {
  private readonly logger = new Logger(AutomationSchedulerService.name);

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

    const now = Date.now();

    for (const rule of rules) {
      const config = (rule.triggerConfigJson ?? {}) as Record<string, unknown>;
      const configured = Number(config.intervalMinutes);
      const intervalMinutes =
        Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_INTERVAL_MINUTES;

      // Throttle: skip rules that already ran within their interval. We key off
      // the most recent execution regardless of outcome so a misconfigured rule
      // cannot spam its action every 5 minutes.
      const last = await this.prisma.automationExecution.findFirst({
        where: { ruleId: rule.id },
        orderBy: { createdAt: "desc" }
      });
      if (last && now - new Date(last.createdAt).getTime() < intervalMinutes * 60_000) {
        continue;
      }

      await this.queue.enqueue(rule.id, {
        source: "cron",
        ruleId: rule.id,
        triggerConfig: rule.triggerConfigJson
      });
      this.logger.log(`Enqueued scheduled rule ${rule.id} (interval ${intervalMinutes}m)`);
    }
  }
}
