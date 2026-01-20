import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NotificationsService } from "./notifications.service";
import { NotificationsQueue } from "./notifications.queue";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [NotificationsService, NotificationsQueue],
  exports: [NotificationsService, NotificationsQueue]
})
export class NotificationsModule {}
