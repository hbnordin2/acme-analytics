import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { Server } from "http";
import { pool } from "./db.js";

interface Client {
  ws: WebSocket;
  channels: Set<string>;
  lastPing: number;
}

const clients = new Map<WebSocket, Client>();

// Simulated live visitor count — fluctuates realistically
let baseVisitorCount = 0;
let currentVisitorCount = 0;

async function initVisitorCount() {
  try {
    const result = await pool.query(
      "SELECT COUNT(DISTINCT user_id)::int AS count FROM sessions WHERE started_at >= NOW() - INTERVAL '15 minutes'",
    );
    baseVisitorCount = Math.max(result.rows[0].count, 12);
    currentVisitorCount = baseVisitorCount;
  } catch {
    baseVisitorCount = 24;
    currentVisitorCount = 24;
  }
}

function fluctuateVisitorCount() {
  const drift = Math.floor(Math.random() * 7) - 3; // -3 to +3
  currentVisitorCount = Math.max(5, currentVisitorCount + drift);

  // Slowly pull back toward base
  if (currentVisitorCount > baseVisitorCount + 10) {
    currentVisitorCount -= 2;
  } else if (currentVisitorCount < baseVisitorCount - 10) {
    currentVisitorCount += 2;
  }

  return currentVisitorCount;
}

// Periodically generate fake events for the event stream
const EVENT_NAMES = [
  "page_view", "page_view", "page_view", "click", "signup",
  "form_submit", "button_click", "search", "file_download", "error",
];
const PAGES = [
  "/dashboard", "/dashboard/events", "/dashboard/users", "/pricing",
  "/", "/docs", "/blog", "/dashboard/settings",
];

function generateFakeEvent() {
  const n = Math.floor(Math.random() * EVENT_NAMES.length);
  const p = Math.floor(Math.random() * PAGES.length);
  return {
    type: "event",
    data: {
      id: crypto.randomUUID(),
      eventName: EVENT_NAMES[n],
      pageUrl: PAGES[p],
      timestamp: new Date().toISOString(),
      properties: {
        device: ["desktop", "mobile", "tablet"][Math.floor(Math.random() * 3)],
        country: ["US", "UK", "DE", "FR", "CA"][Math.floor(Math.random() * 5)],
      },
    },
  };
}

function broadcast(channel: string, message: unknown) {
  const data = JSON.stringify(message);
  for (const [ws, client] of clients) {
    if (client.channels.has(channel) && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  initVisitorCount();

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    const client: Client = { ws, channels: new Set(), lastPing: Date.now() };
    clients.set(ws, client);

    ws.on("message", (raw: Buffer | string) => {
      try {
        const msg = JSON.parse(typeof raw === "string" ? raw : raw.toString());

        switch (msg.type) {
          case "subscribe":
            if (msg.channel) {
              client.channels.add(msg.channel);

              // Immediately send current state for visitors channel
              if (msg.channel === "visitors") {
                ws.send(JSON.stringify({ type: "visitor_count", count: currentVisitorCount }));
              }
            }
            break;

          case "unsubscribe":
            if (msg.channel) {
              client.channels.delete(msg.channel);
            }
            break;

          case "ping":
            client.lastPing = Date.now();
            ws.send(JSON.stringify({ type: "pong" }));
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });

    ws.on("error", () => {
      clients.delete(ws);
    });
  });

  // Broadcast visitor count every 3 seconds
  setInterval(() => {
    const count = fluctuateVisitorCount();
    broadcast("visitors", { type: "visitor_count", count });
  }, 3000);

  // Broadcast fake events every 2-5 seconds
  setInterval(() => {
    const event = generateFakeEvent();
    broadcast("events-stream", event);
  }, 2000 + Math.random() * 3000);

  // Occasionally broadcast alert triggers (every 30-60s)
  setInterval(() => {
    if (Math.random() < 0.3) {
      broadcast("alerts-stream", {
        type: "alert_triggered",
        data: {
          id: crypto.randomUUID(),
          name: ["Traffic Spike", "Error Rate Threshold", "Low Conversion Rate", "API Latency"][Math.floor(Math.random() * 4)],
          severity: ["info", "warning", "critical"][Math.floor(Math.random() * 3)],
          triggeredAt: new Date().toISOString(),
        },
      });
    }
  }, 30000);

  // Clean up stale connections every 60 seconds
  setInterval(() => {
    const staleThreshold = Date.now() - 120000; // 2 minutes without ping
    for (const [ws, client] of clients) {
      if (client.lastPing < staleThreshold) {
        ws.terminate();
        clients.delete(ws);
      }
    }
  }, 60000);

  console.log("WebSocket server ready");
  return wss;
}
