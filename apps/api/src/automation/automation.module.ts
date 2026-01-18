import { Module } from "@nestjs/common";
import { AutomationService } from "./automation.service";
import { AutomationController } from "./automation.controller";
import { AutomationQueueService } from "./automation-queue.service";
import { AutomationSchedulerService } from "./automation-scheduler.service";

@Module({
  providers: [AutomationService, AutomationQueueService, AutomationSchedulerService],
  controllers: [AutomationController]
})
export class AutomationModule {}
