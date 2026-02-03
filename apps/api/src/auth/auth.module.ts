import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationsClient } from "../common/notifications.client";

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET") ?? "change-me",
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") ?? "1d" }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, NotificationsClient],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
