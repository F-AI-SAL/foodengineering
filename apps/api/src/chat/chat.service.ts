import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChatThreadDto } from "./dto/create-thread.dto";
import { CreateChatMessageDto } from "./dto/create-message.dto";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async findThreads() {
    return this.prisma.chatThread.findMany({
      include: { messages: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async createThread(dto: CreateChatThreadDto) {
    return this.prisma.chatThread.create({
      data: {
        orderId: dto.orderId,
        status: dto.status
      }
    });
  }

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

  async findMessages(threadId: string) {
    return this.prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" }
    });
  }
}
