import { createServer } from "http";
import { serve } from "@hono/node-server";
import { app } from "./rest.js";
import { apolloServer } from "./graphql.js";
import { setupWebSocket } from "./websocket.js";

const REST_PORT = parseInt(process.env.REST_PORT || process.env.PORT || "4010", 10);
const GRAPHQL_PORT = parseInt(process.env.GRAPHQL_PORT || "4011", 10);
const WS_PORT = parseInt(process.env.WS_PORT || "4012", 10);

// ---------------------------------------------------------------------------
// 1. REST API (Hono)
// ---------------------------------------------------------------------------
serve({ fetch: app.fetch, port: REST_PORT }, () => {
  console.log(`REST API listening on http://0.0.0.0:${REST_PORT}`);
});

// ---------------------------------------------------------------------------
// 2. GraphQL API (Apollo)
// ---------------------------------------------------------------------------
async function startGraphQL() {
  await apolloServer.start();

  const { Hono } = await import("hono");
  const { cors } = await import("hono/cors");

  const gqlApp = new Hono();
  gqlApp.use("*", cors({ origin: "*" }));

  gqlApp.get("/health", (c) => c.json({ status: "ok" }));

  // Apollo handler
  gqlApp.all("/graphql", async (c) => {
    try {
      const request = c.req.raw;
      const body = request.method === "POST" ? await c.req.json() : undefined;
      const query = c.req.query("query");
      const variables = c.req.query("variables");

      const gqlRequest = body || {
        query,
        variables: variables ? JSON.parse(variables) : undefined,
      };

      const result = await apolloServer.executeOperation({
        query: gqlRequest.query,
        variables: gqlRequest.variables,
        operationName: gqlRequest.operationName,
      });

      if (result.body.kind === "single") {
        return c.json(result.body.singleResult);
      }

      return c.json({ error: "Unexpected response" }, 500);
    } catch (err) {
      console.error("GraphQL handler error:", err);
      return c.json({ error: String(err) }, 500);
    }
  });

  serve({ fetch: gqlApp.fetch, port: GRAPHQL_PORT }, () => {
    console.log(`GraphQL API listening on http://0.0.0.0:${GRAPHQL_PORT}/graphql`);
  });
}

startGraphQL().catch(console.error);

// ---------------------------------------------------------------------------
// 3. WebSocket API
// ---------------------------------------------------------------------------
const wsServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok" }));
});

setupWebSocket(wsServer);

wsServer.listen(WS_PORT, "0.0.0.0", () => {
  console.log(`WebSocket API listening on ws://0.0.0.0:${WS_PORT}`);
});
