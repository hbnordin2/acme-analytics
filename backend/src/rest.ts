import { Hono } from "hono";
import { cors } from "hono/cors";
import { pool } from "./db.js";

const app = new Hono();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use("*", cors({ origin: "*" }));

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
// Health
// ---------------------------------------------------------------------------
app.get("/health", (c) => c.json({ status: "ok" }));

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
app.get("/api/users", async (c) => {
  try {
    const { page, limit, offset } = paginationParams(c);
    const search = c.req.query("search");
    const role = c.req.query("role");

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }
    if (role) {
      params.push(role);
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

    return c.json({ data: dataResult.rows, total, page, limit });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/users/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
app.get("/api/projects", async (c) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name AS owner_name
      FROM projects p
      LEFT JOIN users u ON u.id = p.owner_id
      ORDER BY p.created_at DESC
    `);
    return c.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
app.get("/api/tasks", async (c) => {
  try {
    const { page, limit, offset } = paginationParams(c);
    const projectId = c.req.query("project_id");
    const status = c.req.query("status");
    const priority = c.req.query("priority");
    const assigneeId = c.req.query("assignee_id");

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (projectId) { params.push(projectId); conditions.push(`t.project_id = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`t.status = $${params.length}`); }
    if (priority) { params.push(priority); conditions.push(`t.priority = $${params.length}`); }
    if (assigneeId) { params.push(assigneeId); conditions.push(`t.assignee_id = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(`SELECT COUNT(*) FROM tasks t ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataParams = [...params, limit, offset];
    const dataResult = await pool.query(
      `SELECT t.*, u.name AS assignee_name
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return c.json({ data: dataResult.rows, total, page, limit });
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.patch("/api/tasks/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const allowed = ["status", "assignee_id", "title", "description", "priority", "due_date"];
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const field of allowed) {
      if (body[field] !== undefined) {
        params.push(body[field]);
        setClauses.push(`${field} = $${params.length}`);
      }
    }

    if (setClauses.length === 0) {
      return c.json({ error: "No valid fields to update" }, 400);
    }

    setClauses.push("updated_at = NOW()");
    params.push(id);
    const result = await pool.query(
      `UPDATE tasks SET ${setClauses.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params,
    );

    if (result.rows.length === 0) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json(result.rows[0]);
  } catch (err) {
    console.error("PATCH /api/tasks/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Analytics — Events
// ---------------------------------------------------------------------------
app.get("/api/analytics/events", async (c) => {
  try {
    const { page, limit, offset } = paginationParams(c);
    const eventName = c.req.query("event_name");
    const userId = c.req.query("user_id");

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (eventName) { params.push(eventName); conditions.push(`event_name = $${params.length}`); }
    if (userId) { params.push(userId); conditions.push(`user_id = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(`SELECT COUNT(*) FROM analytics_events ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataParams = [...params, limit, offset];
    const dataResult = await pool.query(
      `SELECT * FROM analytics_events ${where}
       ORDER BY timestamp DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return c.json({ data: dataResult.rows, total, page, limit });
  } catch (err) {
    console.error("GET /api/analytics/events error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Analytics — Summary (enriched with session data)
// ---------------------------------------------------------------------------
app.get("/api/analytics/summary", async (c) => {
  try {
    const days = parseInt(c.req.query("days") || "30", 10);
    const daysStr = `${days} days`;
    const doubleDaysStr = `${days * 2} days`;

    const result = await pool.query(`
      WITH current_period AS (
        SELECT
          COUNT(*)::int AS total_page_views,
          COUNT(DISTINCT e.user_id)::int AS unique_visitors
        FROM analytics_events e
        WHERE e.event_name = 'page_view'
          AND e.timestamp >= NOW() - $1::INTERVAL
      ),
      previous_period AS (
        SELECT
          COUNT(*)::int AS prev_page_views,
          COUNT(DISTINCT e.user_id)::int AS prev_visitors
        FROM analytics_events e
        WHERE e.event_name = 'page_view'
          AND e.timestamp >= NOW() - $2::INTERVAL
          AND e.timestamp < NOW() - $1::INTERVAL
      ),
      session_stats AS (
        SELECT
          COALESCE(AVG(duration_seconds), 0)::int AS avg_session_duration,
          COALESCE(
            (COUNT(*) FILTER (WHERE is_bounce)::numeric / NULLIF(COUNT(*), 0) * 100),
            0
          )::numeric(5,1) AS bounce_rate
        FROM sessions
        WHERE started_at >= NOW() - $1::INTERVAL
      ),
      top_ref AS (
        SELECT referrer
        FROM sessions
        WHERE started_at >= NOW() - $1::INTERVAL
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
            ROUND(((cp.total_page_views - pp.prev_page_views)::numeric / pp.prev_page_views) * 100, 1)
          ELSE 0
        END AS page_views_trend,
        CASE
          WHEN pp.prev_visitors > 0 THEN
            ROUND(((cp.unique_visitors - pp.prev_visitors)::numeric / pp.prev_visitors) * 100, 1)
          ELSE 0
        END AS visitors_trend
      FROM current_period cp, previous_period pp, session_stats ss, top_ref tr
    `, [daysStr, doubleDaysStr]);

    return c.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/analytics/summary error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Analytics — Timeseries (enriched with sessions)
// ---------------------------------------------------------------------------
app.get("/api/analytics/timeseries", async (c) => {
  try {
    const days = parseInt(c.req.query("days") || "30", 10);
    const interval = c.req.query("interval") || "day";
    const daysStr = `${days} days`;

    let truncExpr: string;
    let seriesInterval: string;
    switch (interval) {
      case "hour":
        truncExpr = "date_trunc('hour', timestamp)";
        seriesInterval = "1 hour";
        break;
      case "week":
        truncExpr = "date_trunc('week', timestamp)";
        seriesInterval = "1 week";
        break;
      case "month":
        truncExpr = "date_trunc('month', timestamp)";
        seriesInterval = "1 month";
        break;
      default:
        truncExpr = "timestamp::date";
        seriesInterval = "1 day";
    }

    const result = await pool.query(`
      WITH event_series AS (
        SELECT
          ${truncExpr} AS ts,
          COUNT(*) FILTER (WHERE event_name = 'page_view') AS page_views,
          COUNT(DISTINCT user_id) AS visitors
        FROM analytics_events
        WHERE timestamp >= NOW() - $1::INTERVAL
        GROUP BY ts
      ),
      session_series AS (
        SELECT
          ${truncExpr === "timestamp::date" ? "started_at::date" : `date_trunc('${interval}', started_at)`} AS ts,
          COUNT(*) AS sessions
        FROM sessions
        WHERE started_at >= NOW() - $1::INTERVAL
        GROUP BY ts
      ),
      dates AS (
        SELECT generate_series(
          (NOW() - $1::INTERVAL)::date,
          CURRENT_DATE,
          '${seriesInterval}'::interval
        )::date AS date
      )
      SELECT
        d.date::text AS timestamp,
        COALESCE(es.page_views, 0)::int AS page_views,
        COALESCE(es.visitors, 0)::int AS visitors,
        COALESCE(ss.sessions, 0)::int AS sessions
      FROM dates d
      LEFT JOIN event_series es ON es.ts::date = d.date
      LEFT JOIN session_series ss ON ss.ts::date = d.date
      ORDER BY d.date
    `, [daysStr]);

    return c.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/analytics/timeseries error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Analytics — Top Pages (from page_analytics table)
// ---------------------------------------------------------------------------
app.get("/api/analytics/top-pages", async (c) => {
  try {
    const days = parseInt(c.req.query("days") || "30", 10);
    const limitParam = Math.min(50, parseInt(c.req.query("limit") || "10", 10));
    const daysStr = `${days} days`;

    const result = await pool.query(`
      SELECT
        page_path AS path,
        page_title AS title,
        SUM(views)::int AS views,
        SUM(unique_views)::int AS unique_views,
        ROUND(AVG(avg_duration_seconds))::int AS avg_duration
      FROM page_analytics
      WHERE date >= CURRENT_DATE - $1::INTERVAL
      GROUP BY page_path, page_title
      ORDER BY views DESC
      LIMIT $2
    `, [daysStr, limitParam]);

    return c.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/analytics/top-pages error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Funnels
// ---------------------------------------------------------------------------
app.get("/api/funnels", async (c) => {
  try {
    const funnels = await pool.query(`
      SELECT f.*, u.name AS created_by_name
      FROM funnels f
      LEFT JOIN users u ON u.id = f.created_by
      ORDER BY f.created_at DESC
    `);

    const steps = await pool.query(`
      SELECT * FROM funnel_steps ORDER BY funnel_id, step_order
    `);

    const funnelData = funnels.rows.map((f: Record<string, unknown>) => {
      const funnelSteps = steps.rows.filter(
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

app.get("/api/funnels/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const funnel = await pool.query(
      `SELECT f.*, u.name AS created_by_name FROM funnels f LEFT JOIN users u ON u.id = f.created_by WHERE f.id = $1`,
      [id],
    );

    if (funnel.rows.length === 0) {
      return c.json({ error: "Funnel not found" }, 404);
    }

    const steps = await pool.query(
      `SELECT * FROM funnel_steps WHERE funnel_id = $1 ORDER BY step_order`,
      [id],
    );

    const totalEntries = steps.rows.length > 0 ? steps.rows[0].count : 0;

    return c.json({
      ...funnel.rows[0],
      total_entries: totalEntries,
      steps: steps.rows.map((s: Record<string, unknown>, i: number) => ({
        name: s.name,
        event_name: s.event_name,
        count: s.count,
        percentage: totalEntries > 0 ? Math.round(((s.count as number) / totalEntries) * 100) : 0,
        drop_off: i > 0
          ? Math.round(((steps.rows[i - 1].count as number) - (s.count as number)) / (steps.rows[i - 1].count as number) * 100)
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
app.get("/api/reports", async (c) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name AS created_by_name
      FROM reports r
      LEFT JOIN users u ON u.id = r.created_by
      ORDER BY COALESCE(r.generated_at, r.created_at) DESC
    `);
    return c.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/reports error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/reports/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const result = await pool.query(
      `SELECT r.*, u.name AS created_by_name FROM reports r LEFT JOIN users u ON u.id = r.created_by WHERE r.id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      return c.json({ error: "Report not found" }, 404);
    }
    return c.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/reports/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Alert Rules
// ---------------------------------------------------------------------------
app.get("/api/alerts", async (c) => {
  try {
    const result = await pool.query(`
      SELECT ar.*, u.name AS created_by_name,
        (SELECT COUNT(*) FROM alert_history ah WHERE ah.alert_rule_id = ar.id)::int AS trigger_count
      FROM alert_rules ar
      LEFT JOIN users u ON u.id = ar.created_by
      ORDER BY ar.created_at DESC
    `);
    return c.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/alerts error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/alerts/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const rule = await pool.query(
      `SELECT ar.*, u.name AS created_by_name FROM alert_rules ar LEFT JOIN users u ON u.id = ar.created_by WHERE ar.id = $1`,
      [id],
    );
    if (rule.rows.length === 0) {
      return c.json({ error: "Alert not found" }, 404);
    }

    const history = await pool.query(
      `SELECT * FROM alert_history WHERE alert_rule_id = $1 ORDER BY triggered_at DESC LIMIT 20`,
      [id],
    );

    return c.json({ ...rule.rows[0], history: history.rows });
  } catch (err) {
    console.error("GET /api/alerts/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.patch("/api/alerts/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const allowed = ["name", "description", "active", "severity", "notify_email", "notify_slack"];
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const field of allowed) {
      if (body[field] !== undefined) {
        params.push(body[field]);
        setClauses.push(`${field} = $${params.length}`);
      }
    }

    if (setClauses.length === 0) {
      return c.json({ error: "No valid fields to update" }, 400);
    }

    setClauses.push("updated_at = NOW()");
    params.push(id);
    const result = await pool.query(
      `UPDATE alert_rules SET ${setClauses.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params,
    );

    if (result.rows.length === 0) {
      return c.json({ error: "Alert not found" }, 404);
    }

    return c.json(result.rows[0]);
  } catch (err) {
    console.error("PATCH /api/alerts/:id error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.delete("/api/alerts/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const result = await pool.query("DELETE FROM alert_rules WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
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
app.get("/api/files", async (c) => {
  try {
    const parentId = c.req.query("parent_id") || null;
    const trashed = c.req.query("trashed") === "true";

    const conditions = ["trashed = $1"];
    const params: unknown[] = [trashed];

    if (parentId) {
      params.push(parentId);
      conditions.push(`parent_id = $${params.length}`);
    } else if (!trashed) {
      conditions.push("parent_id IS NULL");
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const result = await pool.query(
      `SELECT * FROM files ${where} ORDER BY is_folder DESC, name ASC`,
      params,
    );

    return c.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/files error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Workspace Settings
// ---------------------------------------------------------------------------
app.get("/api/workspace", async (c) => {
  try {
    const settings = await pool.query("SELECT * FROM workspace_settings LIMIT 1");
    const billing = await pool.query("SELECT * FROM billing LIMIT 1");

    return c.json({
      workspace: settings.rows[0] || {},
      billing: billing.rows[0] || {},
    });
  } catch (err) {
    console.error("GET /api/workspace error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.patch("/api/workspace", async (c) => {
  try {
    const body = await c.req.json();
    const allowed = ["name", "timezone", "date_format"];
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const field of allowed) {
      if (body[field] !== undefined) {
        params.push(body[field]);
        setClauses.push(`${field} = $${params.length}`);
      }
    }

    if (setClauses.length === 0) {
      return c.json({ error: "No valid fields to update" }, 400);
    }

    setClauses.push("updated_at = NOW()");
    const result = await pool.query(
      `UPDATE workspace_settings SET ${setClauses.join(", ")} RETURNING *`,
    );

    return c.json(result.rows[0]);
  } catch (err) {
    console.error("PATCH /api/workspace error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// Notification Preferences
// ---------------------------------------------------------------------------
app.get("/api/notifications/preferences", async (c) => {
  try {
    const userId = c.req.query("user_id") || "a0000000-0000-0000-0000-000000000001";
    const result = await pool.query(
      "SELECT * FROM notification_preferences WHERE user_id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return c.json({
        user_id: userId,
        email_enabled: true,
        slack_enabled: false,
        weekly_digest: true,
        alert_notifications: true,
        marketing: false,
      });
    }

    return c.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/notifications/preferences error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.patch("/api/notifications/preferences", async (c) => {
  try {
    const body = await c.req.json();
    const userId = body.user_id || "a0000000-0000-0000-0000-000000000001";

    const result = await pool.query(
      `INSERT INTO notification_preferences (user_id, email_enabled, slack_enabled, weekly_digest, alert_notifications, marketing)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         email_enabled = EXCLUDED.email_enabled,
         slack_enabled = EXCLUDED.slack_enabled,
         weekly_digest = EXCLUDED.weekly_digest,
         alert_notifications = EXCLUDED.alert_notifications,
         marketing = EXCLUDED.marketing,
         updated_at = NOW()
       RETURNING *`,
      [
        userId,
        body.email_enabled ?? true,
        body.slack_enabled ?? false,
        body.weekly_digest ?? true,
        body.alert_notifications ?? true,
        body.marketing ?? false,
      ],
    );

    return c.json(result.rows[0]);
  } catch (err) {
    console.error("PATCH /api/notifications/preferences error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------------------------------------------------------------------
// API Keys
// ---------------------------------------------------------------------------
app.get("/api/api-keys", async (c) => {
  try {
    const result = await pool.query(`
      SELECT id, name, key_prefix, created_by, last_used_at, expires_at, created_at
      FROM api_keys
      ORDER BY created_at DESC
    `);
    return c.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/api-keys error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.delete("/api/api-keys/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const result = await pool.query("DELETE FROM api_keys WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
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
app.get("/api/sessions", async (c) => {
  try {
    const { page, limit, offset } = paginationParams(c);
    const userId = c.req.query("user_id");

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (userId) { params.push(userId); conditions.push(`user_id = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(`SELECT COUNT(*) FROM sessions ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataParams = [...params, limit, offset];
    const dataResult = await pool.query(
      `SELECT * FROM sessions ${where}
       ORDER BY started_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return c.json({ data: dataResult.rows, total, page, limit });
  } catch (err) {
    console.error("GET /api/sessions error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { app };
