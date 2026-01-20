import { Module } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { AuditController } from "./audit.controller";
import { HealthController } from "./health.controller";

@Module({
  providers: [AuditService],
  controllers: [AuditController, HealthController]
})
export class CommonModule {}
