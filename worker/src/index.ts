import { Hono } from "hono";
import { cors } from "hono/cors";
import { rest } from "./rest.js";
import { handleGraphQL } from "./graphql.js";
import { WebSocketDO } from "./websocket.js";
import type { Env } from "./types.js";

// ---------------------------------------------------------------------------
// Main Hono app
// ---------------------------------------------------------------------------
const app = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// CORS middleware — allow all origins
// ---------------------------------------------------------------------------
app.use("*", cors({ origin: "*" }));

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get("/health", (c) => c.json({ status: "ok" }));

// ---------------------------------------------------------------------------
// REST routes (mounted from rest.ts)
// ---------------------------------------------------------------------------
app.route("/", rest);

// ---------------------------------------------------------------------------
// GraphQL endpoint
// ---------------------------------------------------------------------------
app.all("/graphql", async (c) => {
  return handleGraphQL(c.req.raw, c.env.DB);
});

// ---------------------------------------------------------------------------
// WebSocket upgrade via Durable Objects
// ---------------------------------------------------------------------------
app.get("/ws", async (c) => {
  const upgradeHeader = c.req.header("Upgrade");
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
    return c.text("Expected WebSocket upgrade", 426);
  }

  const id = c.env.WEBSOCKET.idFromName("global");
  const stub = c.env.WEBSOCKET.get(id);
  return stub.fetch(c.req.raw);
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export default app;
export { WebSocketDO };
