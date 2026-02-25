"use client";

import { useEffect, useRef, useCallback } from "react";
import { WS_API_URL } from "@/lib/api";
import { useAppStore } from "@/store";

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const RECONNECT_BACKOFF_MULTIPLIER = 2;
const PING_INTERVAL_MS = 30_000;

// -----------------------------------------------------------------------------
// Types for WebSocket messages
// -----------------------------------------------------------------------------

interface WsSubscribeMessage {
  type: "subscribe";
  channel: string;
}

interface WsVisitorsPayload {
  type: "visitors" | "visitor_count";
  count: number;
}

interface WsPongMessage {
  type: "pong";
}

type WsIncomingMessage = WsVisitorsPayload | WsPongMessage;

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY_MS);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const setLiveVisitorCount = useAppStore((s) => s.setLiveVisitorCount);

  // ---- Cleanup helpers -----------------------------------------------------

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

  // ---- Connection logic ----------------------------------------------------

  const connect = useCallback(() => {
    // Guard against connecting after unmount
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
        // Reset reconnect backoff on successful connection
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;

        // Subscribe to the visitors channel
        const msg: WsSubscribeMessage = {
          type: "subscribe",
          channel: "visitors",
        };
        ws.send(JSON.stringify(msg));

        // Start ping keep-alive
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as WsIncomingMessage;

          if (data.type === "visitors" || data.type === "visitor_count") {
            setLiveVisitorCount((data as { count: number }).count);
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
  }, [clearTimers, setLiveVisitorCount]);

  // ---- Lifecycle -----------------------------------------------------------

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
}
