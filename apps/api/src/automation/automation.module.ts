import { Module } from "@nestjs/common";
import { AutomationService } from "./automation.service";
import { AutomationController } from "./automation.controller";
import { AutomationQueueService } from "./automation-queue.service";
import { AutomationExecutorService } from "./automation-executor.service";
import { AutomationSchedulerService } from "./automation-scheduler.service";
import { NotificationsClient } from "../common/notifications.client";

@Module({
  providers: [
    AutomationService,
    AutomationQueueService,
    AutomationExecutorService,
    AutomationSchedulerService,
    NotificationsClient
  ],
  controllers: [AutomationController]
})
export class AutomationModule {}
