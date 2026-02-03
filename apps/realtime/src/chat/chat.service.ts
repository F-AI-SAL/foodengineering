import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChatMessageDto } from "./dto/create-message.dto";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async addMessage(dto: CreateChatMessageDto) {
    return this.prisma.chatMessage.create({
      data: {
        threadId: dto.threadId,
        senderRole: dto.senderRole,
        senderName: dto.senderName,
        message: dto.message
      }
    });
  }
}
