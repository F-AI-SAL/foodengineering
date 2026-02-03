import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { TrackingUpdateDto } from "./dto/tracking.dto";
import { WebSocket } from "ws";

@Injectable()
export class TrackingService {
  private readonly subscriptions = new Map<string, Set<WebSocket>>();

  constructor(private readonly prisma: PrismaService) {}

  subscribe(orderId: string, client: WebSocket) {
    const list = this.subscriptions.get(orderId) ?? new Set<WebSocket>();
    list.add(client);
    this.subscriptions.set(orderId, list);
  }

  unsubscribe(orderId: string, client: WebSocket) {
    const list = this.subscriptions.get(orderId);
    if (!list) {
      return;
    }
    list.delete(client);
    if (!list.size) {
      this.subscriptions.delete(orderId);
    }
  }

  removeClient(client: WebSocket) {
    this.subscriptions.forEach((clients, orderId) => {
      if (clients.delete(client) && clients.size === 0) {
        this.subscriptions.delete(orderId);
      }
    });
  }

  async recordUpdate(payload: TrackingUpdateDto) {
    return this.prisma.trackingUpdate.create({
      data: {
        orderId: payload.orderId,
        riderId: payload.riderId,
        status: payload.status,
        lat: payload.lat,
        lng: payload.lng
      }
    });
  }

  broadcastUpdate(orderId: string, update: unknown) {
    const clients = this.subscriptions.get(orderId);
    if (!clients) {
      return;
    }

    const payload = JSON.stringify({ event: "tracking.update", data: update });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
}
