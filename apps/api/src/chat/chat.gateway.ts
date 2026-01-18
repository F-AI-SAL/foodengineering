import { UsePipes, ValidationPipe } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { ChatService } from "./chat.service";
import { CreateChatMessageDto } from "./dto/create-message.dto";

@WebSocketGateway({
  path: process.env.WS_PATH ?? "/ws",
  cors: { origin: "*" }
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server!: Server;

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
