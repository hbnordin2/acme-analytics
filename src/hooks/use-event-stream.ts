"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { WS_API_URL } from "@/lib/api";

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 16_000;
const RECONNECT_BACKOFF_MULTIPLIER = 2;
const MAX_EVENTS = 50;
const PING_INTERVAL_MS = 30_000;

// -----------------------------------------------------------------------------
// Types – matches the shape broadcast by backend/src/websocket.ts on
// the "events-stream" channel.
// -----------------------------------------------------------------------------

export interface LiveEvent {
  id: string;
  eventName: string;
  pageUrl: string;
  timestamp: string;
  properties: {
    device?: string;
    country?: string;
    [key: string]: unknown;
  };
}

interface WsEventMessage {
  type: "event";
  data: LiveEvent;
}

interface WsPongMessage {
  type: "pong";
}

type WsIncomingMessage = WsEventMessage | WsPongMessage;

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useEventStream() {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY_MS);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // ---- Cleanup helpers ----------------------------------------------------

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

  // ---- Connection logic ---------------------------------------------------

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    // Tear down any prior socket
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

        // Subscribe to the events-stream channel
        ws.send(
          JSON.stringify({ type: "subscribe", channel: "events-stream" }),
        );

        // Keep-alive pings
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(
            event.data as string,
          ) as WsIncomingMessage;

          if (msg.type === "event" && msg.data) {
            setLiveEvents((prev) => {
              const next = [msg.data, ...prev];
              // Keep at most MAX_EVENTS entries
              return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
            });
          }
          // pong messages are silently consumed
        } catch {
          // Ignore non-JSON messages
        }
      };

      ws.onerror = () => {
        // onclose will handle reconnection
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

  // ---- Lifecycle ----------------------------------------------------------

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

  return { liveEvents, isConnected };
}
