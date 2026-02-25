import type { Env } from "./types.js";

// ---------------------------------------------------------------------------
// Constants for fake data generation
// ---------------------------------------------------------------------------
const EVENT_NAMES = [
  "page_view", "page_view", "page_view", "click", "signup",
  "form_submit", "button_click", "search", "file_download", "error",
];
const PAGES = [
  "/dashboard", "/dashboard/events", "/dashboard/users", "/pricing",
  "/", "/docs", "/blog", "/dashboard/settings",
];
const ALERT_NAMES = ["Traffic Spike", "Error Rate Threshold", "Low Conversion Rate", "API Latency"];
const SEVERITIES = ["info", "warning", "critical"];
const DEVICES = ["desktop", "mobile", "tablet"];
const COUNTRIES = ["US", "UK", "DE", "FR", "CA"];

// ---------------------------------------------------------------------------
// Attachment shape for WebSocket tags (Hibernation API)
// ---------------------------------------------------------------------------
interface WSAttachment {
  channels: string[];
}

// ---------------------------------------------------------------------------
// Durable Object: WebSocketDO
// ---------------------------------------------------------------------------
export class WebSocketDO implements DurableObject {
  private baseVisitorCount = 24;
  private currentVisitorCount = 24;
  private alarmCounter = 0;

  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket using the Hibernation API
    this.state.acceptWebSocket(server);

    // Initialize attachment with empty channel list
    const attachment: WSAttachment = { channels: [] };
    server.serializeAttachment(attachment);

    // Ensure the alarm is set for broadcasting
    const currentAlarm = await this.state.storage.getAlarm();
    if (!currentAlarm) {
      await this.state.storage.setAlarm(Date.now() + 3000);
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const raw = typeof message === "string" ? message : new TextDecoder().decode(message);
      const msg = JSON.parse(raw);
      const attachment = (ws.deserializeAttachment() as WSAttachment) || { channels: [] };

      switch (msg.type) {
        case "subscribe":
          if (msg.channel && !attachment.channels.includes(msg.channel)) {
            attachment.channels.push(msg.channel);
            ws.serializeAttachment(attachment);

            // Immediately send current state for visitors channel
            if (msg.channel === "visitors") {
              ws.send(JSON.stringify({ type: "visitor_count", count: this.currentVisitorCount }));
            }
          }
          break;

        case "unsubscribe":
          if (msg.channel) {
            attachment.channels = attachment.channels.filter((ch: string) => ch !== msg.channel);
            ws.serializeAttachment(attachment);
          }
          break;

        case "ping":
          ws.send(JSON.stringify({ type: "pong" }));
          break;
      }
    } catch {
      // Ignore malformed messages
    }
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean): Promise<void> {
    ws.close();
  }

  async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    ws.close();
  }

  async alarm(): Promise<void> {
    this.alarmCounter++;

    // Fluctuate visitor count
    const drift = Math.floor(Math.random() * 7) - 3;
    this.currentVisitorCount = Math.max(5, this.currentVisitorCount + drift);
    if (this.currentVisitorCount > this.baseVisitorCount + 10) {
      this.currentVisitorCount -= 2;
    } else if (this.currentVisitorCount < this.baseVisitorCount - 10) {
      this.currentVisitorCount += 2;
    }

    const sockets = this.state.getWebSockets();

    // Broadcast visitor count to 'visitors' channel
    this.broadcast(sockets, "visitors", {
      type: "visitor_count",
      count: this.currentVisitorCount,
    });

    // Generate fake event for 'events-stream' channel
    const event = this.generateFakeEvent();
    this.broadcast(sockets, "events-stream", event);

    // Every ~10th alarm cycle (30s), maybe generate an alert
    if (this.alarmCounter % 10 === 0 && Math.random() < 0.3) {
      this.broadcast(sockets, "alerts-stream", {
        type: "alert_triggered",
        data: {
          id: crypto.randomUUID(),
          name: ALERT_NAMES[Math.floor(Math.random() * ALERT_NAMES.length)],
          severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
          triggeredAt: new Date().toISOString(),
        },
      });
    }

    // Schedule next alarm if there are still connected clients
    if (sockets.length > 0) {
      await this.state.storage.setAlarm(Date.now() + 3000);
    }
  }

  private broadcast(sockets: WebSocket[], channel: string, message: unknown): void {
    const data = JSON.stringify(message);
    for (const ws of sockets) {
      try {
        const attachment = (ws.deserializeAttachment() as WSAttachment) || { channels: [] };
        if (attachment.channels.includes(channel)) {
          ws.send(data);
        }
      } catch {
        // Socket may have been closed
      }
    }
  }

  private generateFakeEvent() {
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
          device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
          country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
        },
      },
    };
  }
}
