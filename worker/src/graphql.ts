import { createSchema, createYoga } from "graphql-yoga";
import type { Env } from "./types.js";

// ---------------------------------------------------------------------------
// Helper: convert snake_case rows to camelCase
// ---------------------------------------------------------------------------
function camelize(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z0-9])/g, (_, ch) => ch.toUpperCase());
    out[camelKey] = value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
    name: String!
    avatarUrl: String
    role: String!
    plan: String!
    createdAt: String!
    lastSeen: String
    events(limit: Int): [AnalyticsEvent!]!
    tasks(limit: Int): [Task!]!
    sessions(limit: Int): [Session!]!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    status: String!
    ownerId: ID
    ownerName: String
    createdAt: String!
    updatedAt: String!
    tasks(status: String, limit: Int): [Task!]!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    priority: String!
    projectId: ID
    assigneeId: ID
    assigneeName: String
    labels: [String!]!
    dueDate: String
    createdAt: String!
    updatedAt: String!
  }

  type AnalyticsEvent {
    id: ID!
    eventName: String!
    userId: ID
    sessionId: ID
    pageUrl: String
    properties: JSON
    timestamp: String!
  }

  type Session {
    id: ID!
    userId: ID
    startedAt: String!
    endedAt: String
    durationSeconds: Int
    pagesViewed: Int!
    entryPage: String!
    exitPage: String
    referrer: String
    device: String
    browser: String
    os: String
    country: String
    city: String
    isBounce: Boolean!
  }

  type Funnel {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    totalEntries: Int!
    steps: [FunnelStep!]!
  }

  type FunnelStep {
    name: String!
    eventName: String!
    count: Int!
    percentage: Float!
    dropOff: Float!
  }

  type Report {
    id: ID!
    title: String!
    description: String
    format: String!
    status: String!
    sizeBytes: Int
    reportType: String!
    createdByName: String
    generatedAt: String
    schedule: String
    createdAt: String!
  }

  type AlertRule {
    id: ID!
    name: String!
    description: String
    conditionMetric: String!
    conditionOperator: String!
    conditionThreshold: Float!
    conditionWindow: String!
    severity: String!
    active: Boolean!
    lastTriggeredAt: String
    triggerCount: Int!
    createdAt: String!
    history(limit: Int): [AlertHistoryEntry!]!
  }

  type AlertHistoryEntry {
    id: ID!
    triggeredAt: String!
    resolvedAt: String
    metricValue: Float!
    thresholdValue: Float!
    status: String!
  }

  type FileItem {
    id: ID!
    name: String!
    mimeType: String
    sizeBytes: String
    isFolder: Boolean!
    parentId: ID
    createdBy: String
    trashed: Boolean!
    createdAt: String!
    updatedAt: String!
    children: [FileItem!]
  }

  type AnalyticsSummary {
    totalPageViews: Int!
    uniqueVisitors: Int!
    avgSessionDuration: Int!
    bounceRate: Float!
    topReferrer: String
    pageViewsTrend: Float!
    visitorsTrend: Float!
  }

  type TimeseriesPoint {
    timestamp: String!
    pageViews: Int!
    visitors: Int!
    sessions: Int!
  }

  type TopPage {
    path: String!
    title: String!
    views: Int!
    uniqueViews: Int!
    avgDuration: Int!
  }

  type PaginatedUsers {
    data: [User!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type PaginatedEvents {
    data: [AnalyticsEvent!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type WorkspaceSettings {
    name: String!
    timezone: String!
    dateFormat: String!
  }

  type ApiKey {
    id: ID!
    name: String!
    keyPrefix: String!
    lastUsedAt: String
    createdAt: String!
  }

  scalar JSON

  type Query {
    users(page: Int, limit: Int, search: String, role: String): PaginatedUsers!
    user(id: ID!): User
    projects: [Project!]!
    project(id: ID!): Project
    tasks(projectId: ID, status: String, priority: String, page: Int, limit: Int): [Task!]!
    events(page: Int, limit: Int, eventName: String): PaginatedEvents!
    analyticsSummary(days: Int): AnalyticsSummary!
    timeseries(days: Int, interval: String): [TimeseriesPoint!]!
    topPages(days: Int, limit: Int): [TopPage!]!
    funnels: [Funnel!]!
    funnel(id: ID!): Funnel
    reports: [Report!]!
    alerts: [AlertRule!]!
    alert(id: ID!): AlertRule
    files(parentId: ID, trashed: Boolean): [FileItem!]!
    workspace: WorkspaceSettings!
    apiKeys: [ApiKey!]!
  }

  type Mutation {
    updateTaskStatus(id: ID!, status: String!): Task
    toggleAlert(id: ID!, active: Boolean!): AlertRule
    deleteAlert(id: ID!): Boolean
    updateWorkspace(name: String, timezone: String, dateFormat: String): WorkspaceSettings
  }

  type Subscription {
    liveVisitorCount: Int!
    eventStream: AnalyticsEvent!
    alertTriggered: AlertRule!
  }
`;

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------
interface GraphQLContext {
  db: D1Database;
}

// ---------------------------------------------------------------------------
// Resolvers
// ---------------------------------------------------------------------------
const resolvers = {
  JSON: {
    __serialize: (value: unknown) => value,
    __parseValue: (value: unknown) => value,
  },

  Query: {
    users: async (_: unknown, args: { page?: number; limit?: number; search?: string; role?: string }, ctx: GraphQLContext) => {
      const page = Math.max(1, args.page ?? 1);
      const limit = Math.min(100, Math.max(1, args.limit ?? 20));
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: unknown[] = [];

      if (args.search) {
        params.push(`%${args.search}%`);
        conditions.push(`(name LIKE ? OR email LIKE ?)`);
        params.push(`%${args.search}%`);
      }
      if (args.role) {
        params.push(args.role);
        conditions.push(`role = ?`);
      }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const countResult = await ctx.db.prepare(`SELECT COUNT(*) AS count FROM users ${where}`)
        .bind(...params)
        .first<{ count: number }>();
      const total = countResult?.count ?? 0;

      const dataResult = await ctx.db.prepare(
        `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
        .bind(...params, limit, offset)
        .all();

      return {
        data: dataResult.results.map(camelize),
        total,
        page,
        limit,
      };
    },

    user: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare("SELECT * FROM users WHERE id = ?")
        .bind(args.id)
        .first();
      return result ? camelize(result as Record<string, unknown>) : null;
    },

    projects: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare(`
        SELECT p.*, u.name AS owner_name
        FROM projects p LEFT JOIN users u ON u.id = p.owner_id
        ORDER BY p.created_at DESC
      `).all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },

    project: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare(
        `SELECT p.*, u.name AS owner_name FROM projects p LEFT JOIN users u ON u.id = p.owner_id WHERE p.id = ?`,
      )
        .bind(args.id)
        .first();
      return result ? camelize(result as Record<string, unknown>) : null;
    },

    tasks: async (_: unknown, args: { projectId?: string; status?: string; priority?: string; page?: number; limit?: number }, ctx: GraphQLContext) => {
      const limit = Math.min(100, args.limit ?? 20);
      const offset = ((args.page ?? 1) - 1) * limit;
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (args.projectId) { params.push(args.projectId); conditions.push(`t.project_id = ?`); }
      if (args.status) { params.push(args.status); conditions.push(`t.status = ?`); }
      if (args.priority) { params.push(args.priority); conditions.push(`t.priority = ?`); }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const result = await ctx.db.prepare(
        `SELECT t.*, u.name AS assignee_name FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id ${where} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      )
        .bind(...params, limit, offset)
        .all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },

    events: async (_: unknown, args: { page?: number; limit?: number; eventName?: string }, ctx: GraphQLContext) => {
      const page = Math.max(1, args.page ?? 1);
      const limit = Math.min(100, Math.max(1, args.limit ?? 20));
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: unknown[] = [];
      if (args.eventName) { params.push(args.eventName); conditions.push(`event_name = ?`); }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const countResult = await ctx.db.prepare(`SELECT COUNT(*) AS count FROM analytics_events ${where}`)
        .bind(...params)
        .first<{ count: number }>();
      const total = countResult?.count ?? 0;

      const result = await ctx.db.prepare(
        `SELECT * FROM analytics_events ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      )
        .bind(...params, limit, offset)
        .all();

      return { data: result.results.map((r) => camelize(r as Record<string, unknown>)), total, page, limit };
    },

    analyticsSummary: async (_: unknown, args: { days?: number }, ctx: GraphQLContext) => {
      try {
      const days = args.days ?? 30;
      const result = await ctx.db.prepare(`
        WITH current_period AS (
          SELECT COUNT(*) AS total_page_views, COUNT(DISTINCT user_id) AS unique_visitors
          FROM analytics_events
          WHERE event_name = 'page_view' AND timestamp >= datetime('now', ?)
        ),
        previous_period AS (
          SELECT COUNT(*) AS prev_pv, COUNT(DISTINCT user_id) AS prev_v
          FROM analytics_events
          WHERE event_name = 'page_view'
            AND timestamp >= datetime('now', ?)
            AND timestamp < datetime('now', ?)
        ),
        session_stats AS (
          SELECT COALESCE(CAST(AVG(duration_seconds) AS INTEGER), 0) AS avg_sd,
            CASE WHEN COUNT(*) > 0
              THEN ROUND(CAST(SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100, 1)
              ELSE 0
            END AS br
          FROM sessions WHERE started_at >= datetime('now', ?)
        ),
        top_ref AS (
          SELECT referrer FROM sessions
          WHERE started_at >= datetime('now', ?) AND referrer IS NOT NULL AND referrer != 'direct'
          GROUP BY referrer ORDER BY COUNT(*) DESC LIMIT 1
        )
        SELECT cp.total_page_views AS totalPageViews, cp.unique_visitors AS uniqueVisitors,
          ss.avg_sd AS avgSessionDuration, ss.br AS bounceRate,
          tr.referrer AS topReferrer,
          CASE WHEN pp.prev_pv > 0 THEN ROUND(CAST(cp.total_page_views - pp.prev_pv AS REAL) / pp.prev_pv * 100, 1) ELSE 0 END AS pageViewsTrend,
          CASE WHEN pp.prev_v > 0 THEN ROUND(CAST(cp.unique_visitors - pp.prev_v AS REAL) / pp.prev_v * 100, 1) ELSE 0 END AS visitorsTrend
        FROM current_period cp, previous_period pp, session_stats ss, top_ref tr
      `)
        .bind(
          `-${days} days`,
          `-${days * 2} days`,
          `-${days} days`,
          `-${days} days`,
          `-${days} days`,
        )
        .first();

      console.log("analyticsSummary result:", JSON.stringify(result));
      return result ?? {
        totalPageViews: 0,
        uniqueVisitors: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        topReferrer: null,
        pageViewsTrend: 0,
        visitorsTrend: 0,
      };
      } catch (err) {
        console.error("analyticsSummary error:", err);
        throw err;
      }
    },

    timeseries: async (_: unknown, args: { days?: number; interval?: string }, ctx: GraphQLContext) => {
      const days = args.days ?? 30;
      const result = await ctx.db.prepare(`
        WITH RECURSIVE date_range(date) AS (
          SELECT date(datetime('now', ?))
          UNION ALL
          SELECT date(date, '+1 day')
          FROM date_range
          WHERE date < date('now')
        ),
        event_series AS (
          SELECT date(timestamp) AS ts,
            SUM(CASE WHEN event_name = 'page_view' THEN 1 ELSE 0 END) AS pv,
            COUNT(DISTINCT user_id) AS vis
          FROM analytics_events WHERE timestamp >= datetime('now', ?) GROUP BY ts
        ),
        session_series AS (
          SELECT date(started_at) AS ts, COUNT(*) AS sess
          FROM sessions WHERE started_at >= datetime('now', ?) GROUP BY ts
        )
        SELECT d.date AS timestamp,
          COALESCE(es.pv, 0) AS pageViews,
          COALESCE(es.vis, 0) AS visitors,
          COALESCE(ss.sess, 0) AS sessions
        FROM date_range d
        LEFT JOIN event_series es ON es.ts = d.date
        LEFT JOIN session_series ss ON ss.ts = d.date
        ORDER BY d.date
      `)
        .bind(`-${days} days`, `-${days} days`, `-${days} days`)
        .all();

      return result.results;
    },

    topPages: async (_: unknown, args: { days?: number; limit?: number }, ctx: GraphQLContext) => {
      const days = args.days ?? 30;
      const limit = args.limit ?? 10;
      const result = await ctx.db.prepare(`
        SELECT page_path AS path, page_title AS title,
          CAST(SUM(views) AS INTEGER) AS views,
          CAST(SUM(unique_views) AS INTEGER) AS uniqueViews,
          CAST(ROUND(AVG(avg_duration_seconds)) AS INTEGER) AS avgDuration
        FROM page_analytics WHERE date >= date('now', ?)
        GROUP BY page_path, page_title ORDER BY views DESC LIMIT ?
      `)
        .bind(`-${days} days`, limit)
        .all();
      return result.results;
    },

    funnels: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const funnels = await ctx.db.prepare("SELECT * FROM funnels ORDER BY created_at DESC").all();
      const steps = await ctx.db.prepare("SELECT * FROM funnel_steps ORDER BY funnel_id, step_order").all();

      return funnels.results.map((f) => {
        const row = f as Record<string, unknown>;
        const fSteps = steps.results.filter((s) => (s as Record<string, unknown>).funnel_id === row.id);
        const totalEntries = fSteps.length > 0 ? (fSteps[0] as Record<string, unknown>).count as number : 0;
        return {
          ...camelize(row),
          totalEntries,
          steps: fSteps.map((s, i) => {
            const step = s as Record<string, unknown>;
            return {
              name: step.name,
              eventName: step.event_name,
              count: step.count as number,
              percentage: totalEntries > 0 ? Math.round(((step.count as number) / totalEntries) * 100) : 0,
              dropOff: i > 0 ? Math.round(((fSteps[i - 1] as Record<string, unknown>).count as number - (step.count as number)) / ((fSteps[i - 1] as Record<string, unknown>).count as number) * 100) : 0,
            };
          }),
        };
      });
    },

    funnel: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare("SELECT * FROM funnels WHERE id = ?")
        .bind(args.id)
        .first();
      if (!result) return null;
      const f = result as Record<string, unknown>;
      const steps = await ctx.db.prepare("SELECT * FROM funnel_steps WHERE funnel_id = ? ORDER BY step_order")
        .bind(args.id)
        .all();
      const totalEntries = steps.results.length > 0 ? (steps.results[0] as Record<string, unknown>).count as number : 0;
      return {
        ...camelize(f),
        totalEntries,
        steps: steps.results.map((s, i) => {
          const step = s as Record<string, unknown>;
          return {
            name: step.name,
            eventName: step.event_name,
            count: step.count as number,
            percentage: totalEntries > 0 ? Math.round(((step.count as number) / totalEntries) * 100) : 0,
            dropOff: i > 0 ? Math.round(((steps.results[i - 1] as Record<string, unknown>).count as number - (step.count as number)) / ((steps.results[i - 1] as Record<string, unknown>).count as number) * 100) : 0,
          };
        }),
      };
    },

    reports: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare(`
        SELECT r.*, u.name AS created_by_name FROM reports r
        LEFT JOIN users u ON u.id = r.created_by
        ORDER BY COALESCE(r.generated_at, r.created_at) DESC
      `).all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },

    alerts: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare(`
        SELECT ar.*, CAST((SELECT COUNT(*) FROM alert_history ah WHERE ah.alert_rule_id = ar.id) AS INTEGER) AS trigger_count
        FROM alert_rules ar ORDER BY ar.created_at DESC
      `).all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },

    alert: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare(
        `SELECT ar.*, CAST((SELECT COUNT(*) FROM alert_history ah WHERE ah.alert_rule_id = ar.id) AS INTEGER) AS trigger_count FROM alert_rules ar WHERE ar.id = ?`,
      )
        .bind(args.id)
        .first();
      return result ? camelize(result as Record<string, unknown>) : null;
    },

    files: async (_: unknown, args: { parentId?: string; trashed?: boolean }, ctx: GraphQLContext) => {
      const trashed = args.trashed ?? false;
      const conditions = ["trashed = ?"];
      const params: unknown[] = [trashed ? 1 : 0];

      if (args.parentId) {
        params.push(args.parentId);
        conditions.push(`parent_id = ?`);
      } else if (!trashed) {
        conditions.push("parent_id IS NULL");
      }

      const result = await ctx.db.prepare(
        `SELECT * FROM files WHERE ${conditions.join(" AND ")} ORDER BY is_folder DESC, name ASC`,
      )
        .bind(...params)
        .all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },

    workspace: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare("SELECT * FROM workspace_settings LIMIT 1").first();
      return result ? camelize(result as Record<string, unknown>) : { name: "Acme Analytics", timezone: "UTC", dateFormat: "MMM d, yyyy" };
    },

    apiKeys: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare("SELECT id, name, key_prefix, last_used_at, created_at FROM api_keys ORDER BY created_at DESC").all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },
  },

  Mutation: {
    updateTaskStatus: async (_: unknown, args: { id: string; status: string }, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare(
        "UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ? RETURNING *",
      )
        .bind(args.status, args.id)
        .first();
      return result ? camelize(result as Record<string, unknown>) : null;
    },

    toggleAlert: async (_: unknown, args: { id: string; active: boolean }, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare(
        "UPDATE alert_rules SET active = ?, updated_at = datetime('now') WHERE id = ? RETURNING *",
      )
        .bind(args.active ? 1 : 0, args.id)
        .first();
      return result ? camelize(result as Record<string, unknown>) : null;
    },

    deleteAlert: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const result = await ctx.db.prepare("DELETE FROM alert_rules WHERE id = ? RETURNING id")
        .bind(args.id)
        .first();
      return !!result;
    },

    updateWorkspace: async (_: unknown, args: { name?: string; timezone?: string; dateFormat?: string }, ctx: GraphQLContext) => {
      const setClauses: string[] = [];
      const params: unknown[] = [];

      if (args.name !== undefined) { params.push(args.name); setClauses.push(`name = ?`); }
      if (args.timezone !== undefined) { params.push(args.timezone); setClauses.push(`timezone = ?`); }
      if (args.dateFormat !== undefined) { params.push(args.dateFormat); setClauses.push(`date_format = ?`); }

      if (setClauses.length === 0) {
        const current = await ctx.db.prepare("SELECT * FROM workspace_settings LIMIT 1").first();
        return current ? camelize(current as Record<string, unknown>) : null;
      }

      setClauses.push("updated_at = datetime('now')");
      const result = await ctx.db.prepare(`UPDATE workspace_settings SET ${setClauses.join(", ")} RETURNING *`)
        .bind(...params)
        .first();
      return result ? camelize(result as Record<string, unknown>) : null;
    },
  },

  User: {
    events: async (parent: { id: string }, args: { limit?: number }, ctx: GraphQLContext) => {
      const limit = args.limit ?? 10;
      const result = await ctx.db.prepare(
        "SELECT * FROM analytics_events WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?",
      )
        .bind(parent.id, limit)
        .all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },
    tasks: async (parent: { id: string }, args: { limit?: number }, ctx: GraphQLContext) => {
      const limit = args.limit ?? 10;
      const result = await ctx.db.prepare(
        "SELECT t.*, u.name AS assignee_name FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id WHERE t.assignee_id = ? ORDER BY t.created_at DESC LIMIT ?",
      )
        .bind(parent.id, limit)
        .all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },
    sessions: async (parent: { id: string }, args: { limit?: number }, ctx: GraphQLContext) => {
      const limit = args.limit ?? 10;
      const result = await ctx.db.prepare(
        "SELECT * FROM sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?",
      )
        .bind(parent.id, limit)
        .all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },
  },

  Project: {
    tasks: async (parent: { id: string }, args: { status?: string; limit?: number }, ctx: GraphQLContext) => {
      const limit = args.limit ?? 20;
      const conditions = ["t.project_id = ?"];
      const params: unknown[] = [parent.id];
      if (args.status) { params.push(args.status); conditions.push(`t.status = ?`); }
      params.push(limit);
      const result = await ctx.db.prepare(
        `SELECT t.*, u.name AS assignee_name FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id WHERE ${conditions.join(" AND ")} ORDER BY t.created_at DESC LIMIT ?`,
      )
        .bind(...params)
        .all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },
  },

  AlertRule: {
    history: async (parent: { id: string }, args: { limit?: number }, ctx: GraphQLContext) => {
      const limit = args.limit ?? 10;
      const result = await ctx.db.prepare(
        "SELECT * FROM alert_history WHERE alert_rule_id = ? ORDER BY triggered_at DESC LIMIT ?",
      )
        .bind(parent.id, limit)
        .all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },
  },

  FileItem: {
    children: async (parent: { id: string; isFolder: boolean | number }, ctx: GraphQLContext) => {
      if (!parent.isFolder) return null;
      const result = await ctx.db.prepare(
        "SELECT * FROM files WHERE parent_id = ? AND trashed = 0 ORDER BY is_folder DESC, name ASC",
      )
        .bind(parent.id)
        .all();
      return result.results.map((r) => camelize(r as Record<string, unknown>));
    },
  },
};

// ---------------------------------------------------------------------------
// Create Yoga instance
// ---------------------------------------------------------------------------
const schema = createSchema({
  typeDefs,
  resolvers,
});

export function createGraphQLHandler() {
  const yoga = createYoga<GraphQLContext>({
    schema,
    graphqlEndpoint: "/graphql",
    landingPage: false,
  });

  return yoga;
}

export function handleGraphQL(request: Request, db: D1Database): Promise<Response> {
  const yoga = createYoga<GraphQLContext>({
    schema,
    graphqlEndpoint: "/graphql",
  });

  return yoga.fetch(request, { db });
}
