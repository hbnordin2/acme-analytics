import "server-only";

import type {
  AnalyticsSummary,
  AnalyticsEvent,
  EventsParams,
  FileItem,
  FilesParams,
  PaginatedResponse,
  Project,
  Task,
  TasksParams,
  Ticket,
  TicketsParams,
  TimeseriesParams,
  TimeseriesPoint,
  TopPage,
  TopPagesParams,
  User,
  UsersParams,
  Funnel,
  Report,
  AlertRule,
  WorkspaceData,
  ApiKeyItem,
  NotificationPreferences,
} from "@/types";
import { CACHE_TAGS } from "./cache-tags";

// -----------------------------------------------------------------------------
// Base URLs – prefer the non-public env vars, fall back to the public ones
// -----------------------------------------------------------------------------

const REST_API_URL =
  process.env.REST_API_URL ?? process.env.NEXT_PUBLIC_REST_API_URL ?? "";

const GRAPHQL_API_URL =
  process.env.GRAPHQL_API_URL ?? process.env.NEXT_PUBLIC_GRAPHQL_API_URL ?? "";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown,
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// Convert snake_case keys to camelCase recursively
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function camelizeKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(camelizeKeys);
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        snakeToCamel(k),
        camelizeKeys(v),
      ]),
    );
  }
  return obj;
}

// -----------------------------------------------------------------------------
// Server-side fetch helper with Next.js cache options
// -----------------------------------------------------------------------------

interface FetchServerOptions {
  params?: Record<string, unknown>;
  next?: { revalidate?: number; tags?: string[] };
}

async function fetchApiServer<T>(
  path: string,
  options: FetchServerOptions = {},
): Promise<T> {
  const { params, next } = options;
  const query = params ? buildQuery(params) : "";
  const url = `${REST_API_URL}${path}${query}`;

  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    next,
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    throw new ApiError(response.status, response.statusText, body);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();
  return camelizeKeys(json) as T;
}

// -----------------------------------------------------------------------------
// Server-side GraphQL helper with Next.js cache options
// -----------------------------------------------------------------------------

interface GraphqlServerOptions {
  next?: { revalidate?: number; tags?: string[] };
}

async function graphqlQueryServer<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options: GraphqlServerOptions = {},
): Promise<T> {
  const { next } = options;

  const response = await fetch(GRAPHQL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next,
  });

  const text = await response.text();

  if (!response.ok) {
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    throw new ApiError(response.status, response.statusText, body);
  }

  const json = JSON.parse(text) as { data: T; errors?: unknown[] };

  if (json.errors?.length) {
    throw new Error(
      `GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`,
    );
  }

  return json.data;
}

// -----------------------------------------------------------------------------
// Dashboard – combined GraphQL fetch for summary, timeseries, and top pages
// -----------------------------------------------------------------------------

export interface DashboardData {
  analyticsSummary: AnalyticsSummary;
  timeseries: TimeseriesPoint[];
  topPages: TopPage[];
}

const DASHBOARD_QUERY = /* GraphQL */ `
  query DashboardData($days: Int, $interval: String, $topPagesLimit: Int) {
    analyticsSummary(days: $days) {
      totalPageViews
      uniqueVisitors
      avgSessionDuration
      bounceRate
      topReferrer
      pageViewsTrend
      visitorsTrend
    }
    timeseries(days: $days, interval: $interval) {
      timestamp
      pageViews
      visitors
      sessions
    }
    topPages(days: $days, limit: $topPagesLimit) {
      path
      title
      views
      uniqueViews
      avgDuration
    }
  }
`;

interface FetchDashboardDataParams {
  days?: number;
  interval?: string;
  topPagesLimit?: number;
}

export async function fetchDashboardDataServer(
  params: FetchDashboardDataParams = {},
): Promise<DashboardData> {
  const { days = 30, interval = "day", topPagesLimit = 8 } = params;

  return graphqlQueryServer<DashboardData>(
    DASHBOARD_QUERY,
    { days, interval, topPagesLimit },
    {
      next: {
        revalidate: 60,
        tags: [
          CACHE_TAGS.analyticsSummary,
          CACHE_TAGS.timeseries,
          CACHE_TAGS.topPages,
        ],
      },
    },
  );
}

// -----------------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------------

export function fetchUsersServer(
  params?: UsersParams,
): Promise<PaginatedResponse<User>> {
  return fetchApiServer<PaginatedResponse<User>>("/api/users", {
    params: params as Record<string, unknown>,
    next: { revalidate: 30, tags: [CACHE_TAGS.users] },
  });
}

export function fetchUserServer(id: string): Promise<User> {
  return fetchApiServer<User>(`/api/users/${encodeURIComponent(id)}`, {
    next: { revalidate: 30, tags: [CACHE_TAGS.users, CACHE_TAGS.user(id)] },
  });
}

// -----------------------------------------------------------------------------
// Users – GraphQL detail query (user + nested events + tasks in one request)
// -----------------------------------------------------------------------------

export interface UserDetailGraphQLResult {
  user: User;
  events: AnalyticsEvent[];
  tasks: Task[];
}

const USER_DETAIL_QUERY = /* GraphQL */ `
  query UserDetail($id: ID!) {
    user(id: $id) {
      id email name avatarUrl role plan createdAt lastSeen
      events(limit: 20) { id eventName pageUrl timestamp properties }
      tasks(limit: 50) { id title status priority assigneeName dueDate createdAt updatedAt }
    }
  }
`;

interface UserDetailGraphQLRaw {
  user: User & { events: AnalyticsEvent[]; tasks: Task[] };
}

export async function fetchUserDetailGraphQLServer(
  id: string,
): Promise<UserDetailGraphQLResult> {
  const data = await graphqlQueryServer<UserDetailGraphQLRaw>(
    USER_DETAIL_QUERY,
    { id },
    {
      next: {
        revalidate: 30,
        tags: [
          CACHE_TAGS.users,
          CACHE_TAGS.user(id),
          CACHE_TAGS.events,
          CACHE_TAGS.tasks,
        ],
      },
    },
  );

  if (!data.user) {
    throw new ApiError(404, "Not Found", { message: "User not found" });
  }

  const { events, tasks, ...user } = data.user;

  return {
    user,
    events: events ?? [],
    tasks: tasks ?? [],
  };
}

// -----------------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------------

export async function fetchProjectsServer(): Promise<Project[]> {
  const raw = await fetchApiServer<{ data: Project[] } | Project[]>(
    "/api/projects",
    {
      next: { revalidate: 120, tags: [CACHE_TAGS.projects] },
    },
  );
  return Array.isArray(raw) ? raw : raw.data ?? [];
}

// -----------------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------------

export function fetchTasksServer(
  params?: TasksParams,
): Promise<PaginatedResponse<Task>> {
  return fetchApiServer<PaginatedResponse<Task>>("/api/tasks", {
    params: params as Record<string, unknown>,
    next: { revalidate: 30, tags: [CACHE_TAGS.tasks] },
  });
}

// -----------------------------------------------------------------------------
// Analytics – Events
// -----------------------------------------------------------------------------

export function fetchEventsServer(
  params?: EventsParams,
): Promise<PaginatedResponse<AnalyticsEvent>> {
  return fetchApiServer<PaginatedResponse<AnalyticsEvent>>(
    "/api/analytics/events",
    {
      params: params as Record<string, unknown>,
      next: { revalidate: 30, tags: [CACHE_TAGS.events] },
    },
  );
}

// -----------------------------------------------------------------------------
// Analytics – Summary (real data from dedicated backend)
// -----------------------------------------------------------------------------

export function fetchAnalyticsSummaryServer(): Promise<AnalyticsSummary> {
  return fetchApiServer<AnalyticsSummary>("/api/analytics/summary", {
    next: { revalidate: 60, tags: [CACHE_TAGS.analyticsSummary] },
  });
}

// -----------------------------------------------------------------------------
// Analytics – Timeseries (real data from dedicated backend)
// -----------------------------------------------------------------------------

export async function fetchTimeseriesServer(
  params?: TimeseriesParams,
): Promise<TimeseriesPoint[]> {
  const raw = await fetchApiServer<{ data: TimeseriesPoint[] }>(
    "/api/analytics/timeseries",
    {
      params: params as Record<string, unknown>,
      next: { revalidate: 60, tags: [CACHE_TAGS.timeseries] },
    },
  );
  return raw.data ?? [];
}

// -----------------------------------------------------------------------------
// Analytics – Top Pages (real data from dedicated backend)
// -----------------------------------------------------------------------------

export async function fetchTopPagesServer(
  params?: TopPagesParams,
): Promise<TopPage[]> {
  const raw = await fetchApiServer<{ data: TopPage[] }>(
    "/api/analytics/top-pages",
    {
      params: params as Record<string, unknown>,
      next: { revalidate: 120, tags: [CACHE_TAGS.topPages] },
    },
  );
  return raw.data ?? [];
}

// -----------------------------------------------------------------------------
// Files
// -----------------------------------------------------------------------------

export function fetchFilesServer(
  params?: FilesParams,
): Promise<PaginatedResponse<FileItem>> {
  return fetchApiServer<PaginatedResponse<FileItem>>("/api/files", {
    params: params as Record<string, unknown>,
    next: { revalidate: 60, tags: [CACHE_TAGS.files] },
  });
}

// -----------------------------------------------------------------------------
// Funnels
// -----------------------------------------------------------------------------

export async function fetchFunnelsServer(): Promise<Funnel[]> {
  const raw = await fetchApiServer<{ data: Funnel[] }>("/api/funnels", {
    next: { revalidate: 120, tags: ["funnels"] },
  });
  return raw.data ?? [];
}

// GraphQL-based funnels fetch — returns the same Funnel[] shape.
// Note: the GraphQL schema does not expose `createdByName`, so that field will
// be undefined on the returned objects.  The client component does not use it.

const FUNNELS_QUERY = /* GraphQL */ `
  query Funnels {
    funnels {
      id
      name
      description
      createdAt
      totalEntries
      steps {
        name
        eventName
        count
        percentage
        dropOff
      }
    }
  }
`;

export async function fetchFunnelsGraphQLServer(): Promise<Funnel[]> {
  const data = await graphqlQueryServer<{ funnels: Funnel[] }>(
    FUNNELS_QUERY,
    undefined,
    {
      next: { revalidate: 120, tags: ["funnels"] },
    },
  );
  return data.funnels;
}

// -----------------------------------------------------------------------------
// Reports
// -----------------------------------------------------------------------------

export async function fetchReportsServer(): Promise<Report[]> {
  const raw = await fetchApiServer<{ data: Report[] }>("/api/reports", {
    next: { revalidate: 120, tags: ["reports"] },
  });
  return raw.data ?? [];
}

// -----------------------------------------------------------------------------
// Alerts
// -----------------------------------------------------------------------------

export async function fetchAlertsServer(): Promise<AlertRule[]> {
  const raw = await fetchApiServer<{ data: AlertRule[] }>("/api/alerts", {
    next: { revalidate: 30, tags: ["alerts"] },
  });
  return raw.data ?? [];
}

// -----------------------------------------------------------------------------
// Workspace (settings + billing)
// -----------------------------------------------------------------------------

export function fetchWorkspaceServer(): Promise<WorkspaceData> {
  return fetchApiServer<WorkspaceData>("/api/workspace", {
    next: { revalidate: 120, tags: ["workspace"] },
  });
}

// -----------------------------------------------------------------------------
// API Keys
// -----------------------------------------------------------------------------

export async function fetchApiKeysServer(): Promise<ApiKeyItem[]> {
  const raw = await fetchApiServer<{ data: ApiKeyItem[] }>("/api/api-keys", {
    next: { revalidate: 60, tags: ["api-keys"] },
  });
  return raw.data ?? [];
}

// -----------------------------------------------------------------------------
// Notification Preferences
// -----------------------------------------------------------------------------

export function fetchNotificationPreferencesServer(): Promise<NotificationPreferences> {
  return fetchApiServer<NotificationPreferences>(
    "/api/notifications/preferences",
    {
      next: { revalidate: 60, tags: ["notification-preferences"] },
    },
  );
}

// -----------------------------------------------------------------------------
// Tickets
// -----------------------------------------------------------------------------

export function fetchTicketsServer(
  params?: TicketsParams,
): Promise<PaginatedResponse<Ticket>> {
  return fetchApiServer<PaginatedResponse<Ticket>>("/api/tickets", {
    params: params as Record<string, unknown>,
    next: { revalidate: 60, tags: ["tickets"] },
  });
}
