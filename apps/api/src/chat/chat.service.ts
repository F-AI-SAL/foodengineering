import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChatThreadDto } from "./dto/create-thread.dto";
import { CreateChatMessageDto } from "./dto/create-message.dto";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async findThreads(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.chatThread.findMany({
        include: { messages: true },
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      this.prisma.chatThread.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
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

  async findMessages(threadId: string, query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { threadId },
        orderBy: { createdAt: "asc" },
        skip,
        take
      }),
      this.prisma.chatMessage.count({ where: { threadId } })
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }
}
