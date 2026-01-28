import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NotificationsModule } from "./notifications/notifications.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), NotificationsModule],
  controllers: [HealthController]
})
export class AppModule {}
