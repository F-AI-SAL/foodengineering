"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderStatus } from "../types";
import { useWebSocket, type WebSocketMessage } from "./useWebSocket";

export interface TrackingUpdatePayload {
  orderId: string;
  lat?: number;
  lng?: number;
  status?: OrderStatus;
  riderId?: string;
}

export function useTrackingChannel(orderId: string) {
  const [latestUpdate, setLatestUpdate] = useState<TrackingUpdatePayload | null>(null);

  const handleMessage = useCallback(
    (message: WebSocketMessage<TrackingUpdatePayload>) => {
      if (message.event !== "tracking.update") {
        return;
      }

      if (message.data.orderId === orderId) {
        setLatestUpdate(message.data);
      }
    },
    [orderId]
  );

  const { status, send } = useWebSocket<TrackingUpdatePayload>({
    onMessage: handleMessage
  });

  useEffect(() => {
    if (!orderId || status !== "open") {
      return;
    }

    send("tracking.subscribe", { orderId });

    return () => {
      send("tracking.unsubscribe", { orderId });
    };
  }, [orderId, send, status]);

  return { status, latestUpdate };
}
