import { Injectable } from "@nestjs/common";
import { WebSocket } from "ws";
import { PrismaService } from "../prisma/prisma.service";
import { TrackingUpdateDto } from "./dto/tracking.dto";

@Injectable()
export class TrackingService {
  private readonly subscribers = new Map<string, Set<WebSocket>>();
  private readonly latestUpdates = new Map<string, TrackingUpdateDto>();

  constructor(private readonly prisma: PrismaService) {}

  subscribe(orderId: string, client: WebSocket) {
    if (!this.subscribers.has(orderId)) {
      this.subscribers.set(orderId, new Set());
    }

    this.subscribers.get(orderId)?.add(client);

    const latest = this.latestUpdates.get(orderId);
    if (latest) {
      this.send(client, { event: "tracking.update", data: latest });
    }
  }

  unsubscribe(orderId: string, client: WebSocket) {
    const clients = this.subscribers.get(orderId);
    if (!clients) {
      return;
    }

    clients.delete(client);
    if (clients.size === 0) {
      this.subscribers.delete(orderId);
    }
  }

  removeClient(client: WebSocket) {
    this.subscribers.forEach((clients, orderId) => {
      if (clients.has(client)) {
        clients.delete(client);
      }

      if (clients.size === 0) {
        this.subscribers.delete(orderId);
      }
    });
  }

  async recordUpdate(update: TrackingUpdateDto) {
    this.latestUpdates.set(update.orderId, update);

    await this.prisma.trackingUpdate.create({
      data: {
        orderId: update.orderId,
        riderId: update.riderId ?? null,
        status: update.status,
        lat: update.lat,
        lng: update.lng
      }
    });

    return update;
  }

  broadcastUpdate(orderId: string, update: TrackingUpdateDto) {
    const clients = this.subscribers.get(orderId);
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

  private send(client: WebSocket, event: unknown) {
    if (client.readyState !== WebSocket.OPEN) {
      return;
    }

    client.send(JSON.stringify(event));
  }
}
