import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type QueuePayload = {
  channel: "email" | "whatsapp";
  payload: Record<string, unknown>;
};

@Injectable()
export class NotificationsClient {
  private readonly logger = new Logger(NotificationsClient.name);
  private readonly baseUrl?: string;
  private readonly serviceKey?: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>("NOTIFICATIONS_URL");
    this.serviceKey = this.config.get<string>("NOTIFICATIONS_SHARED_SECRET");
  }

  async enqueue(channel: "email" | "whatsapp", payload: Record<string, unknown>) {
    if (!this.baseUrl) {
      this.logger.warn("NOTIFICATIONS_URL not set. Skipping notification enqueue.");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      await fetch(`${this.baseUrl}/notifications/queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.serviceKey ? { "x-service-key": this.serviceKey } : {})
        },
        body: JSON.stringify({ channel, payload } satisfies QueuePayload),
        signal: controller.signal
      });
    } catch (error) {
      this.logger.warn("Notification enqueue failed.", error as Error);
    } finally {
      clearTimeout(timeout);
    }
  }
}
