import { Hono } from "hono";
import type { Env } from "./types.js";

const rest = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function paginationParams(c: { req: { query: (k: string) => string | undefined } }) {
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "20", 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
rest.get("/api/users", async (c) => {
  try {
    const { page, limit, offset } = paginationParams(c);
    const search = c.req.query("search");
    const role = c.req.query("role");

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name LIKE ? OR email LIKE ?)`);
      params.push(`%${search}%`);
    }
    if (role) {
      params.push(role);
      conditions.push(`role = ?`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) AS count FROM users ${where}`,
    )
      .bind(...params)
      .first<{ count: number }>();
    const total = countResult?.count ?? 0;

    const dataResult = await c.env.DB.prepare(
      `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(...params, limit, offset)
      .all();

    return c.json({ data: dataResult.results, total, page, limit });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

rest.get("/api/users/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const result = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
      .bind(id)
      .first();

    if (!result) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(result);
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
rest.get("/api/projects", async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT p.*, u.name AS owner_name
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_id
      ORDER BY p.created_at DESC
    `).all();
    return c.json({ data: result.results });
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
rest.get("/api/tasks", async (c) => {
  try {
    const { page, limit, offset } = paginationParams(c);
    const projectId = c.req.query("project_id");
    const status = c.req.query("status");
    const priority = c.req.query("priority");
    const assigneeId = c.req.query("assignee_id");

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (projectId) { params.push(projectId); conditions.push(`t.project_id = ?`); }
    if (status) { params.push(status); conditions.push(`t.status = ?`); }
    if (priority) { params.push(priority); conditions.push(`t.priority = ?`); }
    if (assigneeId) { params.push(assigneeId); conditions.push(`t.assignee_id = ?`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) AS count FROM tasks t ${where}`,
    )
      .bind(...params)
      .first<{ count: number }>();
    const total = countResult?.count ?? 0;

    const dataResult = await c.env.DB.prepare(
      `SELECT t.*, u.name AS assignee_name
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
    )
      .bind(...params, limit, offset)
      .all();

    return c.json({ data: dataResult.results, total, page, limit });
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

rest.patch("/api/tasks/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const allowed = ["status", "assignee_id", "title", "description", "priority", "due_date"];
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const field of allowed) {
      if (body[field] !== undefined) {
        params.push(body[field]);
        setClauses.push(`${field} = ?`);
      }
    }

    if (setClauses.length === 0) {
      return c.json({ error: "No valid fields to update" }, 400);
    }

    setClauses.push("updated_at = datetime('now')");
    params.push(id);
    const result = await c.env.DB.prepare(
      `UPDATE tasks SET ${setClauses.join(", ")} WHERE id = ? RETURNING *`,
    )
      .bind(...params)
      .first();

    if (!result) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json(result);
  } catch (err) {
    console.error("PATCH /api/tasks/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Analytics — Events
// ---------------------------------------------------------------------------
rest.get("/api/analytics/events", async (c) => {
  try {
    const { page, limit, offset } = paginationParams(c);
    const eventName = c.req.query("event_name");
    const userId = c.req.query("user_id");

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (eventName) { params.push(eventName); conditions.push(`event_name = ?`); }
    if (userId) { params.push(userId); conditions.push(`user_id = ?`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) AS count FROM analytics_events ${where}`,
    )
      .bind(...params)
      .first<{ count: number }>();
    const total = countResult?.count ?? 0;

    const dataResult = await c.env.DB.prepare(
      `SELECT * FROM analytics_events ${where}
       ORDER BY timestamp DESC
       LIMIT ? OFFSET ?`,
    )
      .bind(...params, limit, offset)
      .all();

    return c.json({ data: dataResult.results, total, page, limit });
  } catch (err) {
    console.error("GET /api/analytics/events error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Analytics — Summary (enriched with session data)
// ---------------------------------------------------------------------------
rest.get("/api/analytics/summary", async (c) => {
  try {
    const days = parseInt(c.req.query("days") || "30", 10);

    const result = await c.env.DB.prepare(`
      WITH current_period AS (
        SELECT
          COUNT(*) AS total_page_views,
          COUNT(DISTINCT e.user_id) AS unique_visitors
        FROM analytics_events e
        WHERE e.event_name = 'page_view'
          AND e.timestamp >= datetime('now', ?)
      ),
      previous_period AS (
        SELECT
          COUNT(*) AS prev_page_views,
          COUNT(DISTINCT e.user_id) AS prev_visitors
        FROM analytics_events e
        WHERE e.event_name = 'page_view'
          AND e.timestamp >= datetime('now', ?)
          AND e.timestamp < datetime('now', ?)
      ),
      session_stats AS (
        SELECT
          COALESCE(CAST(AVG(duration_seconds) AS INTEGER), 0) AS avg_session_duration,
          COALESCE(
            ROUND(CAST(SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END) AS REAL) / MAX(NULLIF(COUNT(*), 0)) * 100, 1),
            0
          ) AS bounce_rate
        FROM sessions
        WHERE started_at >= datetime('now', ?)
      ),
      top_ref AS (
        SELECT referrer
        FROM sessions
        WHERE started_at >= datetime('now', ?)
          AND referrer IS NOT NULL
          AND referrer != 'direct'
        GROUP BY referrer
        ORDER BY COUNT(*) DESC
        LIMIT 1
      )
      SELECT
        cp.total_page_views,
        cp.unique_visitors,
        ss.avg_session_duration,
        ss.bounce_rate,
        tr.referrer AS top_referrer,
        CASE
          WHEN pp.prev_page_views > 0 THEN
            ROUND(CAST(cp.total_page_views - pp.prev_page_views AS REAL) / pp.prev_page_views * 100, 1)
          ELSE 0
        END AS page_views_trend,
        CASE
          WHEN pp.prev_visitors > 0 THEN
            ROUND(CAST(cp.unique_visitors - pp.prev_visitors AS REAL) / pp.prev_visitors * 100, 1)
          ELSE 0
        END AS visitors_trend
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

    return c.json(result);
  } catch (err) {
    console.error("GET /api/analytics/summary error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Analytics — Timeseries (enriched with sessions)
// ---------------------------------------------------------------------------
rest.get("/api/analytics/timeseries", async (c) => {
  try {
    const days = parseInt(c.req.query("days") || "30", 10);
    const interval = c.req.query("interval") || "day";

    let truncExpr: string;
    let sessionTruncExpr: string;
    switch (interval) {
      case "hour":
        truncExpr = "strftime('%Y-%m-%d %H:00:00', timestamp)";
        sessionTruncExpr = "strftime('%Y-%m-%d %H:00:00', started_at)";
        break;
      case "week":
        truncExpr = "date(timestamp, 'weekday 0', '-6 days')";
        sessionTruncExpr = "date(started_at, 'weekday 0', '-6 days')";
        break;
      case "month":
        truncExpr = "strftime('%Y-%m-01', timestamp)";
        sessionTruncExpr = "strftime('%Y-%m-01', started_at)";
        break;
      default:
        truncExpr = "date(timestamp)";
        sessionTruncExpr = "date(started_at)";
    }

    const result = await c.env.DB.prepare(`
      WITH RECURSIVE date_range(date) AS (
        SELECT date(datetime('now', ?))
        UNION ALL
        SELECT date(date, '+1 day')
        FROM date_range
        WHERE date < date('now')
      ),
      event_series AS (
        SELECT
          ${truncExpr} AS ts,
          SUM(CASE WHEN event_name = 'page_view' THEN 1 ELSE 0 END) AS page_views,
          COUNT(DISTINCT user_id) AS visitors
        FROM analytics_events
        WHERE timestamp >= datetime('now', ?)
        GROUP BY ts
      ),
      session_series AS (
        SELECT
          ${sessionTruncExpr} AS ts,
          COUNT(*) AS sessions
        FROM sessions
        WHERE started_at >= datetime('now', ?)
        GROUP BY ts
      )
      SELECT
        d.date AS timestamp,
        COALESCE(es.page_views, 0) AS page_views,
        COALESCE(es.visitors, 0) AS visitors,
        COALESCE(ss.sessions, 0) AS sessions
      FROM date_range d
      LEFT JOIN event_series es ON es.ts = d.date
      LEFT JOIN session_series ss ON ss.ts = d.date
      ORDER BY d.date
    `)
      .bind(`-${days} days`, `-${days} days`, `-${days} days`)
      .all();

    return c.json({ data: result.results });
  } catch (err) {
    console.error("GET /api/analytics/timeseries error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Analytics — Top Pages (from page_analytics table)
// ---------------------------------------------------------------------------
rest.get("/api/analytics/top-pages", async (c) => {
  try {
    const days = parseInt(c.req.query("days") || "30", 10);
    const limitParam = Math.min(50, parseInt(c.req.query("limit") || "10", 10));

    const result = await c.env.DB.prepare(`
      SELECT
        page_path AS path,
        page_title AS title,
        CAST(SUM(views) AS INTEGER) AS views,
        CAST(SUM(unique_views) AS INTEGER) AS unique_views,
        CAST(ROUND(AVG(avg_duration_seconds)) AS INTEGER) AS avg_duration
      FROM page_analytics
      WHERE date >= date('now', ?)
      GROUP BY page_path, page_title
      ORDER BY views DESC
      LIMIT ?
    `)
      .bind(`-${days} days`, limitParam)
      .all();

    return c.json({ data: result.results });
  } catch (err) {
    console.error("GET /api/analytics/top-pages error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Funnels
// ---------------------------------------------------------------------------
rest.get("/api/funnels", async (c) => {
  try {
    const funnels = await c.env.DB.prepare(`
      SELECT f.*, u.name AS created_by_name
      FROM funnels f
      LEFT JOIN users u ON u.id = f.created_by
      ORDER BY f.created_at DESC
    `).all();

    const steps = await c.env.DB.prepare(`
      SELECT * FROM funnel_steps ORDER BY funnel_id, step_order
    `).all();

    const funnelData = funnels.results.map((f: Record<string, unknown>) => {
      const funnelSteps = steps.results.filter(
        (s: Record<string, unknown>) => s.funnel_id === f.id,
      );
      const totalEntries = funnelSteps.length > 0 ? (funnelSteps[0] as Record<string, unknown>).count as number : 0;

      return {
        ...f,
        total_entries: totalEntries,
        steps: funnelSteps.map((s: Record<string, unknown>, i: number) => ({
          name: s.name,
          event_name: s.event_name,
          count: s.count,
          percentage: totalEntries > 0
            ? Math.round(((s.count as number) / totalEntries) * 100)
            : 0,
          drop_off: i > 0
            ? Math.round(((funnelSteps[i - 1] as Record<string, unknown>).count as number - (s.count as number)) / ((funnelSteps[i - 1] as Record<string, unknown>).count as number) * 100)
            : 0,
        })),
      };
    });

    return c.json({ data: funnelData });
  } catch (err) {
    console.error("GET /api/funnels error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

rest.get("/api/funnels/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const funnel = await c.env.DB.prepare(
      `SELECT f.*, u.name AS created_by_name FROM funnels f LEFT JOIN users u ON u.id = f.created_by WHERE f.id = ?`,
    )
      .bind(id)
      .first();

    if (!funnel) {
      return c.json({ error: "Funnel not found" }, 404);
    }

    const steps = await c.env.DB.prepare(
      `SELECT * FROM funnel_steps WHERE funnel_id = ? ORDER BY step_order`,
    )
      .bind(id)
      .all();

    const totalEntries = steps.results.length > 0 ? (steps.results[0] as Record<string, unknown>).count as number : 0;

    return c.json({
      ...funnel,
      total_entries: totalEntries,
      steps: steps.results.map((s: Record<string, unknown>, i: number) => ({
        name: s.name,
        event_name: s.event_name,
        count: s.count,
        percentage: totalEntries > 0 ? Math.round(((s.count as number) / totalEntries) * 100) : 0,
        drop_off: i > 0
          ? Math.round(((steps.results[i - 1] as Record<string, unknown>).count as number - (s.count as number)) / ((steps.results[i - 1] as Record<string, unknown>).count as number) * 100)
          : 0,
      })),
    });
  } catch (err) {
    console.error("GET /api/funnels/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
rest.get("/api/reports", async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT r.*, u.name AS created_by_name
      FROM reports r
      LEFT JOIN users u ON u.id = r.created_by
      ORDER BY COALESCE(r.generated_at, r.created_at) DESC
    `).all();
    return c.json({ data: result.results });
  } catch (err) {
    console.error("GET /api/reports error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

rest.get("/api/reports/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const result = await c.env.DB.prepare(
      `SELECT r.*, u.name AS created_by_name FROM reports r LEFT JOIN users u ON u.id = r.created_by WHERE r.id = ?`,
    )
      .bind(id)
      .first();

    if (!result) {
      return c.json({ error: "Report not found" }, 404);
    }
    return c.json(result);
  } catch (err) {
    console.error("GET /api/reports/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Alert Rules
// ---------------------------------------------------------------------------
rest.get("/api/alerts", async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT ar.*,
        u.name AS created_by_name,
        CAST((SELECT COUNT(*) FROM alert_history ah WHERE ah.alert_rule_id = ar.id) AS INTEGER) AS trigger_count
      FROM alert_rules ar
      LEFT JOIN users u ON u.id = ar.created_by
      ORDER BY ar.created_at DESC
    `).all();
    return c.json({ data: result.results });
  } catch (err) {
    console.error("GET /api/alerts error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

rest.get("/api/alerts/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const rule = await c.env.DB.prepare(
      `SELECT ar.*, u.name AS created_by_name FROM alert_rules ar LEFT JOIN users u ON u.id = ar.created_by WHERE ar.id = ?`,
    )
      .bind(id)
      .first();

    if (!rule) {
      return c.json({ error: "Alert not found" }, 404);
    }

    const history = await c.env.DB.prepare(
      `SELECT * FROM alert_history WHERE alert_rule_id = ? ORDER BY triggered_at DESC LIMIT 20`,
    )
      .bind(id)
      .all();

    return c.json({ ...rule, history: history.results });
  } catch (err) {
    console.error("GET /api/alerts/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

rest.patch("/api/alerts/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const allowed = ["name", "description", "active", "severity", "notify_email", "notify_slack"];
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const field of allowed) {
      if (body[field] !== undefined) {
        params.push(body[field]);
        setClauses.push(`${field} = ?`);
      }
    }

    if (setClauses.length === 0) {
      return c.json({ error: "No valid fields to update" }, 400);
    }

    setClauses.push("updated_at = datetime('now')");
    params.push(id);
    const result = await c.env.DB.prepare(
      `UPDATE alert_rules SET ${setClauses.join(", ")} WHERE id = ? RETURNING *`,
    )
      .bind(...params)
      .first();

    if (!result) {
      return c.json({ error: "Alert not found" }, 404);
    }

    return c.json(result);
  } catch (err) {
    console.error("PATCH /api/alerts/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

rest.delete("/api/alerts/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const result = await c.env.DB.prepare("DELETE FROM alert_rules WHERE id = ? RETURNING id")
      .bind(id)
      .first();

    if (!result) {
      return c.json({ error: "Alert not found" }, 404);
    }
    return c.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/alerts/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------
rest.get("/api/files", async (c) => {
  try {
    const parentId = c.req.query("parent_id") || null;
    const trashed = c.req.query("trashed") === "true";

    const conditions = ["trashed = ?"];
    const params: unknown[] = [trashed ? 1 : 0];

    if (parentId) {
      params.push(parentId);
      conditions.push(`parent_id = ?`);
    } else if (!trashed) {
      conditions.push("parent_id IS NULL");
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const result = await c.env.DB.prepare(
      `SELECT * FROM files ${where} ORDER BY is_folder DESC, name ASC`,
    )
      .bind(...params)
      .all();

    return c.json({ data: result.results });
  } catch (err) {
    console.error("GET /api/files error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Workspace Settings
// ---------------------------------------------------------------------------
rest.get("/api/workspace", async (c) => {
  try {
    const settings = await c.env.DB.prepare("SELECT * FROM workspace_settings LIMIT 1").first();
    const billing = await c.env.DB.prepare("SELECT * FROM billing LIMIT 1").first();

    return c.json({
      workspace: settings || {},
      billing: billing || {},
    });
  } catch (err) {
    console.error("GET /api/workspace error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

rest.patch("/api/workspace", async (c) => {
  try {
    const body = await c.req.json();
    const allowed = ["name", "timezone", "date_format"];
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const field of allowed) {
      if (body[field] !== undefined) {
        params.push(body[field]);
        setClauses.push(`${field} = ?`);
      }
    }

    if (setClauses.length === 0) {
      return c.json({ error: "No valid fields to update" }, 400);
    }

    setClauses.push("updated_at = datetime('now')");
    const result = await c.env.DB.prepare(
      `UPDATE workspace_settings SET ${setClauses.join(", ")} RETURNING *`,
    )
      .bind(...params)
      .first();

    return c.json(result);
  } catch (err) {
    console.error("PATCH /api/workspace error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Notification Preferences
// ---------------------------------------------------------------------------
rest.get("/api/notifications/preferences", async (c) => {
  try {
    const userId = c.req.query("user_id") || "a0000000-0000-0000-0000-000000000001";
    const result = await c.env.DB.prepare(
      "SELECT * FROM notification_preferences WHERE user_id = ?",
    )
      .bind(userId)
      .first();

    if (!result) {
      return c.json({
        user_id: userId,
        email_enabled: true,
        slack_enabled: false,
        weekly_digest: true,
        alert_notifications: true,
        marketing: false,
      });
    }

    return c.json(result);
  } catch (err) {
    console.error("GET /api/notifications/preferences error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

rest.patch("/api/notifications/preferences", async (c) => {
  try {
    const body = await c.req.json();
    const userId = body.user_id || "a0000000-0000-0000-0000-000000000001";

    const result = await c.env.DB.prepare(
      `INSERT INTO notification_preferences (user_id, email_enabled, slack_enabled, weekly_digest, alert_notifications, marketing)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id) DO UPDATE SET
         email_enabled = excluded.email_enabled,
         slack_enabled = excluded.slack_enabled,
         weekly_digest = excluded.weekly_digest,
         alert_notifications = excluded.alert_notifications,
         marketing = excluded.marketing,
         updated_at = datetime('now')
       RETURNING *`,
    )
      .bind(
        userId,
        body.email_enabled ?? true ? 1 : 0,
        body.slack_enabled ?? false ? 1 : 0,
        body.weekly_digest ?? true ? 1 : 0,
        body.alert_notifications ?? true ? 1 : 0,
        body.marketing ?? false ? 1 : 0,
      )
      .first();

    return c.json(result);
  } catch (err) {
    console.error("PATCH /api/notifications/preferences error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// API Keys
// ---------------------------------------------------------------------------
rest.get("/api/api-keys", async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT id, name, key_prefix, created_by, last_used_at, expires_at, created_at
      FROM api_keys
      ORDER BY created_at DESC
    `).all();
    return c.json({ data: result.results });
  } catch (err) {
    console.error("GET /api/api-keys error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

rest.delete("/api/api-keys/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const result = await c.env.DB.prepare("DELETE FROM api_keys WHERE id = ? RETURNING id")
      .bind(id)
      .first();

    if (!result) {
      return c.json({ error: "API key not found" }, 404);
    }
    return c.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/api-keys/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Sessions (for internal use / debugging)
// ---------------------------------------------------------------------------
rest.get("/api/sessions", async (c) => {
  try {
    const { page, limit, offset } = paginationParams(c);
    const userId = c.req.query("user_id");

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (userId) { params.push(userId); conditions.push(`user_id = ?`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) AS count FROM sessions ${where}`,
    )
      .bind(...params)
      .first<{ count: number }>();
    const total = countResult?.count ?? 0;

    const dataResult = await c.env.DB.prepare(
      `SELECT * FROM sessions ${where}
       ORDER BY started_at DESC
       LIMIT ? OFFSET ?`,
    )
      .bind(...params, limit, offset)
      .all();

    return c.json({ data: dataResult.results, total, page, limit });
  } catch (err) {
    console.error("GET /api/sessions error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { rest };
