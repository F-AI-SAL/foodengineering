import { UsePipes, ValidationPipe } from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { JwtService } from "@nestjs/jwt";
import type { IncomingMessage } from "http";
import { TrackingService } from "./tracking.service";
import { TrackingSubscribeDto, TrackingUpdateDto } from "./dto/tracking.dto";
import { extractWsToken, verifyWsToken } from "../auth/ws-auth.util";

@WebSocketGateway({
  path: process.env.WS_PATH ?? "/ws",
  cors: { origin: "*" }
})
export class TrackingGateway {
  constructor(
    private readonly trackingService: TrackingService,
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

  handleDisconnect(client: WebSocket) {
    this.trackingService.removeClient(client);
  }

  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  )
  @SubscribeMessage("tracking.subscribe")
  handleSubscribe(
    @MessageBody() payload: TrackingSubscribeDto,
    @ConnectedSocket() client: WebSocket
  ) {
    this.trackingService.subscribe(payload.orderId, client);
    return { event: "tracking.subscribed", data: payload };
  }

  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  )
  @SubscribeMessage("tracking.unsubscribe")
  handleUnsubscribe(
    @MessageBody() payload: TrackingSubscribeDto,
    @ConnectedSocket() client: WebSocket
  ) {
    this.trackingService.unsubscribe(payload.orderId, client);
    return { event: "tracking.unsubscribed", data: payload };
  }

  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  )
  @SubscribeMessage("tracking.update")
  async handleUpdate(@MessageBody() payload: TrackingUpdateDto) {
    const update = await this.trackingService.recordUpdate(payload);
    this.trackingService.broadcastUpdate(payload.orderId, update);
    return { event: "tracking.update", data: update };
  }
}
