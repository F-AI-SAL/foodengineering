import { UsePipes, ValidationPipe } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { JwtService } from "@nestjs/jwt";
import type { IncomingMessage } from "http";
import { ChatService } from "./chat.service";
import { CreateChatMessageDto } from "./dto/create-message.dto";
import { extractWsToken, verifyWsToken } from "../auth/ws-auth.util";

@WebSocketGateway({
  path: process.env.WS_PATH ?? "/ws",
  cors: { origin: "*" }
})
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService
  ) {}

  @WebSocketServer()
  server!: Server;

  async handleConnection(client: WebSocket, request: IncomingMessage) {
    const token = extractWsToken(request);
    const payload = await verifyWsToken(this.jwtService, token);
    if (!payload) {
      client.close(1008, "Unauthorized");
    }
  }

  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  )
  @SubscribeMessage("chat.message")
  async handleMessage(@MessageBody() payload: CreateChatMessageDto) {
    const message = await this.chatService.addMessage(payload);
    const event = {
      event: "chat.message",
      data: message
    };

    this.broadcast(event);
    return message;
  }

  private broadcast(event: unknown) {
    const payload = JSON.stringify(event);
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
}
