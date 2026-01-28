import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NotificationsService } from "./notifications.service";
import { NotificationsQueue } from "./notifications.queue";
import { NotificationsController } from "./notifications.controller";
import { PrismaService } from "../prisma/prisma.service";
import { JwtStrategy } from "../auth/jwt.strategy";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../roles/roles.guard";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [NotificationsController],
  providers: [
    PrismaService,
    NotificationsService,
    NotificationsQueue,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard
  ]
})
export class NotificationsModule {}
