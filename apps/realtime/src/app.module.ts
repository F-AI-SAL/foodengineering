import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ChatModule } from "./chat/chat.module";
import { TrackingModule } from "./tracking/tracking.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ChatModule, TrackingModule],
  controllers: [HealthController]
})
export class AppModule {}
