import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET") ?? "change-me",
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") ?? "1d" }
      })
    })
  ],
  providers: [PrismaService, ChatService, ChatGateway]
})
export class ChatModule {}
