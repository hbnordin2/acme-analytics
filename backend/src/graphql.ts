import { ApolloServer } from "@apollo/server";
import { pool } from "./db.js";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
const typeDefs = `#graphql
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
// Helper: convert snake_case rows to camelCase
// ---------------------------------------------------------------------------
function camelize(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
    // Convert Date objects to ISO strings so Apollo's String scalar returns
    // proper ISO-8601 dates instead of epoch milliseconds.
    out[camelKey] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
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
    users: async (_: unknown, args: { page?: number; limit?: number; search?: string; role?: string }) => {
      const page = Math.max(1, args.page ?? 1);
      const limit = Math.min(100, Math.max(1, args.limit ?? 20));
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: unknown[] = [];

      if (args.search) {
        params.push(`%${args.search}%`);
        conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
      }
      if (args.role) {
        params.push(args.role);
        conditions.push(`role = $${params.length}`);
      }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const countResult = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);
      const total = parseInt(countResult.rows[0].count, 10);

      const dataParams = [...params, limit, offset];
      const dataResult = await pool.query(
        `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      );

      return {
        data: dataResult.rows.map(camelize),
        total,
        page,
        limit,
      };
    },

    user: async (_: unknown, args: { id: string }) => {
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [args.id]);
      return result.rows.length ? camelize(result.rows[0]) : null;
    },

    projects: async () => {
      const result = await pool.query(`
        SELECT p.*, u.name AS owner_name
        FROM projects p LEFT JOIN users u ON u.id = p.owner_id
        ORDER BY p.created_at DESC
      `);
      return result.rows.map(camelize);
    },

    project: async (_: unknown, args: { id: string }) => {
      const result = await pool.query(
        `SELECT p.*, u.name AS owner_name FROM projects p LEFT JOIN users u ON u.id = p.owner_id WHERE p.id = $1`,
        [args.id],
      );
      return result.rows.length ? camelize(result.rows[0]) : null;
    },

    tasks: async (_: unknown, args: { projectId?: string; status?: string; priority?: string; page?: number; limit?: number }) => {
      const limit = Math.min(100, args.limit ?? 20);
      const offset = ((args.page ?? 1) - 1) * limit;
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (args.projectId) { params.push(args.projectId); conditions.push(`t.project_id = $${params.length}`); }
      if (args.status) { params.push(args.status); conditions.push(`t.status = $${params.length}`); }
      if (args.priority) { params.push(args.priority); conditions.push(`t.priority = $${params.length}`); }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const dataParams = [...params, limit, offset];
      const result = await pool.query(
        `SELECT t.*, u.name AS assignee_name FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id ${where} ORDER BY t.created_at DESC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      );
      return result.rows.map(camelize);
    },

    events: async (_: unknown, args: { page?: number; limit?: number; eventName?: string }) => {
      const page = Math.max(1, args.page ?? 1);
      const limit = Math.min(100, Math.max(1, args.limit ?? 20));
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: unknown[] = [];
      if (args.eventName) { params.push(args.eventName); conditions.push(`event_name = $${params.length}`); }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const countResult = await pool.query(`SELECT COUNT(*) FROM analytics_events ${where}`, params);
      const total = parseInt(countResult.rows[0].count, 10);

      const dataParams = [...params, limit, offset];
      const result = await pool.query(
        `SELECT * FROM analytics_events ${where} ORDER BY timestamp DESC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      );

      return { data: result.rows.map(camelize), total, page, limit };
    },

    analyticsSummary: async (_: unknown, args: { days?: number }) => {
      const days = args.days ?? 30;
      const daysStr = `${days} days`;
      const doubleDaysStr = `${days * 2} days`;
      const result = await pool.query(`
        WITH current_period AS (
          SELECT COUNT(*)::int AS total_page_views, COUNT(DISTINCT user_id)::int AS unique_visitors
          FROM analytics_events
          WHERE event_name = 'page_view' AND timestamp >= NOW() - $1::INTERVAL
        ),
        previous_period AS (
          SELECT COUNT(*)::int AS prev_pv, COUNT(DISTINCT user_id)::int AS prev_v
          FROM analytics_events
          WHERE event_name = 'page_view'
            AND timestamp >= NOW() - $2::INTERVAL
            AND timestamp < NOW() - $1::INTERVAL
        ),
        session_stats AS (
          SELECT COALESCE(AVG(duration_seconds), 0)::int AS avg_sd,
            COALESCE((COUNT(*) FILTER (WHERE is_bounce)::numeric / NULLIF(COUNT(*), 0) * 100), 0)::numeric(5,1) AS br
          FROM sessions WHERE started_at >= NOW() - $1::INTERVAL
        ),
        top_ref AS (
          SELECT referrer FROM sessions
          WHERE started_at >= NOW() - $1::INTERVAL AND referrer IS NOT NULL AND referrer != 'direct'
          GROUP BY referrer ORDER BY COUNT(*) DESC LIMIT 1
        )
        SELECT cp.total_page_views, cp.unique_visitors, ss.avg_sd AS avg_session_duration, ss.br AS bounce_rate,
          tr.referrer AS top_referrer,
          CASE WHEN pp.prev_pv > 0 THEN ROUND(((cp.total_page_views - pp.prev_pv)::numeric / pp.prev_pv) * 100, 1) ELSE 0 END AS page_views_trend,
          CASE WHEN pp.prev_v > 0 THEN ROUND(((cp.unique_visitors - pp.prev_v)::numeric / pp.prev_v) * 100, 1) ELSE 0 END AS visitors_trend
        FROM current_period cp, previous_period pp, session_stats ss, top_ref tr
      `, [daysStr, doubleDaysStr]);

      return camelize(result.rows[0]);
    },

    timeseries: async (_: unknown, args: { days?: number }) => {
      const days = args.days ?? 30;
      const daysStr = `${days} days`;
      const result = await pool.query(`
        WITH event_series AS (
          SELECT timestamp::date AS ts, COUNT(*) FILTER (WHERE event_name = 'page_view') AS pv, COUNT(DISTINCT user_id) AS vis
          FROM analytics_events WHERE timestamp >= NOW() - $1::INTERVAL GROUP BY ts
        ),
        session_series AS (
          SELECT started_at::date AS ts, COUNT(*) AS sess
          FROM sessions WHERE started_at >= NOW() - $1::INTERVAL GROUP BY ts
        ),
        dates AS (
          SELECT generate_series((NOW() - $1::INTERVAL)::date, CURRENT_DATE, '1 day'::interval)::date AS date
        )
        SELECT d.date::text AS timestamp, COALESCE(es.pv, 0)::int AS page_views, COALESCE(es.vis, 0)::int AS visitors, COALESCE(ss.sess, 0)::int AS sessions
        FROM dates d LEFT JOIN event_series es ON es.ts = d.date LEFT JOIN session_series ss ON ss.ts = d.date ORDER BY d.date
      `, [daysStr]);

      return result.rows.map(camelize);
    },

    topPages: async (_: unknown, args: { days?: number; limit?: number }) => {
      const days = args.days ?? 30;
      const daysStr = `${days} days`;
      const limit = args.limit ?? 10;
      const result = await pool.query(`
        SELECT page_path AS path, page_title AS title, SUM(views)::int AS views, SUM(unique_views)::int AS unique_views, ROUND(AVG(avg_duration_seconds))::int AS avg_duration
        FROM page_analytics WHERE date >= CURRENT_DATE - $1::INTERVAL
        GROUP BY page_path, page_title ORDER BY views DESC LIMIT $2
      `, [daysStr, limit]);
      return result.rows.map(camelize);
    },

    funnels: async () => {
      const funnels = await pool.query("SELECT * FROM funnels ORDER BY created_at DESC");
      const steps = await pool.query("SELECT * FROM funnel_steps ORDER BY funnel_id, step_order");

      return funnels.rows.map((f: Record<string, unknown>) => {
        const fSteps = steps.rows.filter((s: Record<string, unknown>) => s.funnel_id === f.id);
        const totalEntries = fSteps.length > 0 ? fSteps[0].count as number : 0;
        return {
          ...camelize(f),
          totalEntries,
          steps: fSteps.map((s: Record<string, unknown>, i: number) => ({
            name: s.name,
            eventName: s.event_name,
            count: s.count as number,
            percentage: totalEntries > 0 ? Math.round(((s.count as number) / totalEntries) * 100) : 0,
            dropOff: i > 0 ? Math.round((fSteps[i - 1].count as number - (s.count as number)) / (fSteps[i - 1].count as number) * 100) : 0,
          })),
        };
      });
    },

    funnel: async (_: unknown, args: { id: string }) => {
      const result = await pool.query("SELECT * FROM funnels WHERE id = $1", [args.id]);
      if (!result.rows.length) return null;
      const f = result.rows[0];
      const steps = await pool.query("SELECT * FROM funnel_steps WHERE funnel_id = $1 ORDER BY step_order", [args.id]);
      const totalEntries = steps.rows.length > 0 ? steps.rows[0].count : 0;
      return {
        ...camelize(f),
        totalEntries,
        steps: steps.rows.map((s: Record<string, unknown>, i: number) => ({
          name: s.name,
          eventName: s.event_name,
          count: s.count as number,
          percentage: totalEntries > 0 ? Math.round(((s.count as number) / totalEntries) * 100) : 0,
          dropOff: i > 0 ? Math.round((steps.rows[i - 1].count - (s.count as number)) / steps.rows[i - 1].count * 100) : 0,
        })),
      };
    },

    reports: async () => {
      const result = await pool.query(`
        SELECT r.*, u.name AS created_by_name FROM reports r
        LEFT JOIN users u ON u.id = r.created_by
        ORDER BY COALESCE(r.generated_at, r.created_at) DESC
      `);
      return result.rows.map(camelize);
    },

    alerts: async () => {
      const result = await pool.query(`
        SELECT ar.*, (SELECT COUNT(*) FROM alert_history ah WHERE ah.alert_rule_id = ar.id)::int AS trigger_count
        FROM alert_rules ar ORDER BY ar.created_at DESC
      `);
      return result.rows.map(camelize);
    },

    alert: async (_: unknown, args: { id: string }) => {
      const result = await pool.query(
        `SELECT ar.*, (SELECT COUNT(*) FROM alert_history ah WHERE ah.alert_rule_id = ar.id)::int AS trigger_count FROM alert_rules ar WHERE ar.id = $1`,
        [args.id],
      );
      return result.rows.length ? camelize(result.rows[0]) : null;
    },

    files: async (_: unknown, args: { parentId?: string; trashed?: boolean }) => {
      const trashed = args.trashed ?? false;
      const conditions = ["trashed = $1"];
      const params: unknown[] = [trashed];

      if (args.parentId) {
        params.push(args.parentId);
        conditions.push(`parent_id = $${params.length}`);
      } else if (!trashed) {
        conditions.push("parent_id IS NULL");
      }

      const result = await pool.query(
        `SELECT * FROM files WHERE ${conditions.join(" AND ")} ORDER BY is_folder DESC, name ASC`,
        params,
      );
      return result.rows.map(camelize);
    },

    workspace: async () => {
      const result = await pool.query("SELECT * FROM workspace_settings LIMIT 1");
      return result.rows.length ? camelize(result.rows[0]) : { name: "Acme Analytics", timezone: "UTC", dateFormat: "MMM d, yyyy" };
    },

    apiKeys: async () => {
      const result = await pool.query("SELECT id, name, key_prefix, last_used_at, created_at FROM api_keys ORDER BY created_at DESC");
      return result.rows.map(camelize);
    },
  },

  Mutation: {
    updateTaskStatus: async (_: unknown, args: { id: string; status: string }) => {
      const result = await pool.query(
        "UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [args.status, args.id],
      );
      return result.rows.length ? camelize(result.rows[0]) : null;
    },

    toggleAlert: async (_: unknown, args: { id: string; active: boolean }) => {
      const result = await pool.query(
        "UPDATE alert_rules SET active = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [args.active, args.id],
      );
      return result.rows.length ? camelize(result.rows[0]) : null;
    },

    deleteAlert: async (_: unknown, args: { id: string }) => {
      const result = await pool.query("DELETE FROM alert_rules WHERE id = $1 RETURNING id", [args.id]);
      return result.rows.length > 0;
    },

    updateWorkspace: async (_: unknown, args: { name?: string; timezone?: string; dateFormat?: string }) => {
      const setClauses: string[] = [];
      const params: unknown[] = [];

      if (args.name !== undefined) { params.push(args.name); setClauses.push(`name = $${params.length}`); }
      if (args.timezone !== undefined) { params.push(args.timezone); setClauses.push(`timezone = $${params.length}`); }
      if (args.dateFormat !== undefined) { params.push(args.dateFormat); setClauses.push(`date_format = $${params.length}`); }

      if (setClauses.length === 0) {
        const current = await pool.query("SELECT * FROM workspace_settings LIMIT 1");
        return camelize(current.rows[0]);
      }

      setClauses.push("updated_at = NOW()");
      const result = await pool.query(`UPDATE workspace_settings SET ${setClauses.join(", ")} RETURNING *`);
      return camelize(result.rows[0]);
    },
  },

  User: {
    events: async (parent: { id: string }, args: { limit?: number }) => {
      const limit = args.limit ?? 10;
      const result = await pool.query(
        "SELECT * FROM analytics_events WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2",
        [parent.id, limit],
      );
      return result.rows.map(camelize);
    },
    tasks: async (parent: { id: string }, args: { limit?: number }) => {
      const limit = args.limit ?? 10;
      const result = await pool.query(
        "SELECT t.*, u.name AS assignee_name FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id WHERE t.assignee_id = $1 ORDER BY t.created_at DESC LIMIT $2",
        [parent.id, limit],
      );
      return result.rows.map(camelize);
    },
    sessions: async (parent: { id: string }, args: { limit?: number }) => {
      const limit = args.limit ?? 10;
      const result = await pool.query(
        "SELECT * FROM sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT $2",
        [parent.id, limit],
      );
      return result.rows.map(camelize);
    },
  },

  Project: {
    tasks: async (parent: { id: string }, args: { status?: string; limit?: number }) => {
      const limit = args.limit ?? 20;
      const conditions = ["t.project_id = $1"];
      const params: unknown[] = [parent.id];
      if (args.status) { params.push(args.status); conditions.push(`t.status = $${params.length}`); }
      params.push(limit);
      const result = await pool.query(
        `SELECT t.*, u.name AS assignee_name FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id WHERE ${conditions.join(" AND ")} ORDER BY t.created_at DESC LIMIT $${params.length}`,
        params,
      );
      return result.rows.map(camelize);
    },
  },

  AlertRule: {
    history: async (parent: { id: string }, args: { limit?: number }) => {
      const limit = args.limit ?? 10;
      const result = await pool.query(
        "SELECT * FROM alert_history WHERE alert_rule_id = $1 ORDER BY triggered_at DESC LIMIT $2",
        [parent.id, limit],
      );
      return result.rows.map(camelize);
    },
  },

  FileItem: {
    children: async (parent: { id: string; isFolder: boolean }) => {
      if (!parent.isFolder) return null;
      const result = await pool.query(
        "SELECT * FROM files WHERE parent_id = $1 AND trashed = false ORDER BY is_folder DESC, name ASC",
        [parent.id],
      );
      return result.rows.map(camelize);
    },
  },
};

// ---------------------------------------------------------------------------
// Create Apollo Server
// ---------------------------------------------------------------------------
export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});
