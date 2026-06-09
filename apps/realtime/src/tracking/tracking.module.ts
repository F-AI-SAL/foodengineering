import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TrackingGateway } from "./tracking.gateway";
import { TrackingService } from "./tracking.service";
import { PrismaService } from "../prisma/prisma.service";
import { requireJwtSecret } from "../auth/require-jwt-secret";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: requireJwtSecret(config),
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") ?? "1d" }
      })
    })
  ],
  providers: [PrismaService, TrackingService, TrackingGateway]
})
export class TrackingModule {}
