"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { WS_API_URL } from "@/lib/api";

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const MAX_NOTIFICATIONS = 20;
const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const RECONNECT_BACKOFF_MULTIPLIER = 2;
const PING_INTERVAL_MS = 30_000;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface AlertNotification {
  id: string;
  name: string;
  severity: "info" | "warning" | "critical";
  triggeredAt: string;
}

interface AlertTriggeredMessage {
  type: "alert_triggered";
  data: {
    id: string;
    name: string;
    severity: string;
    triggeredAt: string;
  };
}

interface PongMessage {
  type: "pong";
}

type WsMessage = AlertTriggeredMessage | PongMessage;

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useAlertStream() {
  const [alertNotifications, setAlertNotifications] = useState<
    AlertNotification[]
  >([]);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY_MS);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // -- Cleanup helpers --------------------------------------------------------

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  // -- Connection logic -------------------------------------------------------

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    // Clean up any prior socket
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
    }

    clearTimers();

    try {
      const ws = new WebSocket(WS_API_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;
        setIsConnected(true);

        // Subscribe to the alerts-stream channel
        ws.send(
          JSON.stringify({ type: "subscribe", channel: "alerts-stream" }),
        );

        // Start ping keep-alive
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as WsMessage;

          if (msg.type === "alert_triggered") {
            const { id, name, severity, triggeredAt } = msg.data;

            const notification: AlertNotification = {
              id,
              name,
              severity: (["info", "warning", "critical"].includes(severity)
                ? severity
                : "info") as AlertNotification["severity"],
              triggeredAt,
            };

            setAlertNotifications((prev) =>
              [notification, ...prev].slice(0, MAX_NOTIFICATIONS),
            );
          }
          // pong messages are silently consumed
        } catch {
          // Ignore non-JSON messages
        }
      };

      ws.onerror = () => {
        // The close handler will take care of reconnection
      };

      ws.onclose = () => {
        clearTimers();
        setIsConnected(false);

        if (!isMountedRef.current) return;

        // Schedule reconnect with exponential backoff
        const delay = reconnectDelayRef.current;
        reconnectTimerRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(
            delay * RECONNECT_BACKOFF_MULTIPLIER,
            MAX_RECONNECT_DELAY_MS,
          );
          connect();
        }, delay);
      };
    } catch {
      // If WebSocket constructor throws (e.g. invalid URL), schedule retry
      setIsConnected(false);
      if (isMountedRef.current) {
        const delay = reconnectDelayRef.current;
        reconnectTimerRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(
            delay * RECONNECT_BACKOFF_MULTIPLIER,
            MAX_RECONNECT_DELAY_MS,
          );
          connect();
        }, delay);
      }
    }
  }, [clearTimers]);

  // -- Lifecycle --------------------------------------------------------------

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      clearTimers();

      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onclose = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, clearTimers]);

  return { alertNotifications, isConnected };
}
