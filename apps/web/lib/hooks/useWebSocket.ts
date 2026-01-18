"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WebSocketStatus = "idle" | "connecting" | "open" | "closed" | "error";

export interface WebSocketMessage<T> {
  event: string;
  data: T;
}

interface UseWebSocketOptions<T> {
  url?: string;
  onMessage?: (message: WebSocketMessage<T>) => void;
}

export function useWebSocket<T>(options: UseWebSocketOptions<T> = {}) {
  const { url = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws", onMessage } = options;
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>("idle");

  useEffect(() => {
    if (!url) {
      setStatus("error");
      return undefined;
    }

    setStatus("connecting");
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.addEventListener("open", () => setStatus("open"));
    socket.addEventListener("close", () => setStatus("closed"));
    socket.addEventListener("error", () => setStatus("error"));
    socket.addEventListener("message", (event) => {
      try {
        const parsed = JSON.parse(event.data as string) as WebSocketMessage<T>;
        onMessage?.(parsed);
      } catch {
        // Ignore malformed messages from the server.
      }
    });

    return () => {
      socket.close();
    };
  }, [onMessage, url]);

  const send = useCallback((event: string, data: unknown) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(JSON.stringify({ event, data }));
  }, []);

  return { status, send };
}
