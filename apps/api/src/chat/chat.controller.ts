import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateChatThreadDto } from "./dto/create-thread.dto";
import { CreateChatMessageDto } from "./dto/create-message.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("chat")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("threads")
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.MANAGER, UserRole.OWNER)
  findThreads() {
    return this.chatService.findThreads();
  }

  @Post("threads")
  @Roles(UserRole.CUSTOMER, UserRole.SUPPORT, UserRole.ADMIN, UserRole.OWNER)
  createThread(@Body() dto: CreateChatThreadDto) {
    return this.chatService.createThread(dto);
  }

  @Get("threads/:threadId/messages")
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.MANAGER, UserRole.OWNER, UserRole.CUSTOMER)
  findMessages(@Param("threadId") threadId: string) {
    return this.chatService.findMessages(threadId);
  }

  @Post("messages")
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.MANAGER, UserRole.OWNER, UserRole.CUSTOMER)
  addMessage(@Body() dto: CreateChatMessageDto) {
    return this.chatService.addMessage(dto);
  }
}
