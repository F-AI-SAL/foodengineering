import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import type { MenuItem } from "@prisma/client";

interface MenuUpdatePayload {
  type: "created" | "updated" | "image";
  item: MenuItem;
}

@WebSocketGateway({
  path: process.env.WS_PATH ?? "/ws",
  cors: { origin: "*" }
})
export class MenuGateway {
  @WebSocketServer()
  server!: Server;

  broadcastMenuUpdate(payload: MenuUpdatePayload) {
    if (!this.server) {
      return;
    }
    const message = JSON.stringify({ event: "menu.updated", data: payload });
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
