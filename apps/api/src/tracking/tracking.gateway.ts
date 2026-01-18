import { UsePipes, ValidationPipe } from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody
} from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { TrackingService } from "./tracking.service";
import { TrackingSubscribeDto, TrackingUpdateDto } from "./dto/tracking.dto";

@WebSocketGateway({
  path: process.env.WS_PATH ?? "/ws",
  cors: { origin: "*" }
})
export class TrackingGateway {
  constructor(private readonly trackingService: TrackingService) {}

  @WebSocketServer()
  server!: Server;

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
