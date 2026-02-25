import type {
  AnalyticsSummary,
  ClaimsParams,
  Claim,
  EventsParams,
  AnalyticsEvent,
  FileItem,
  FilesParams,
  InventoryItem,
  InventoryParams,
  Job,
  JobsParams,
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
  UpdateTaskData,
  User,
  UsersParams,
} from "@/types";

// -----------------------------------------------------------------------------
// Base URLs – read from environment variables (set in .env.local)
// These MUST be configured via env vars — no hardcoded fallbacks in source.
// See .env.example for the expected variables.
// -----------------------------------------------------------------------------

const REST_API_URL = process.env.NEXT_PUBLIC_REST_API_URL ?? "";
const GRAPHQL_API_URL = process.env.NEXT_PUBLIC_GRAPHQL_API_URL ?? "";

// WS_API_URL is exported so the websocket hook can import it directly.
export const WS_API_URL = process.env.NEXT_PUBLIC_WS_API_URL ?? "";

// -----------------------------------------------------------------------------
// Generic REST fetch helper
// -----------------------------------------------------------------------------

export class ApiError extends Error {
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

export async function fetchApi<T>(
  path: string,
  options: RequestInit & { params?: Record<string, unknown> } = {},
): Promise<T> {
  const { params, ...init } = options;
  const query = params ? buildQuery(params) : "";
  const url = `${REST_API_URL}${path}${query}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
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
// GraphQL helper
// -----------------------------------------------------------------------------

export async function graphqlQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(GRAPHQL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
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

  const json = (await response.json()) as { data: T; errors?: unknown[] };

  if (json.errors?.length) {
    throw new Error(
      `GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`,
    );
  }

  return json.data;
}

// -----------------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------------

export function fetchUsers(
  params?: UsersParams,
): Promise<PaginatedResponse<User>> {
  return fetchApi<PaginatedResponse<User>>("/api/users", {
    params: params as Record<string, unknown>,
  });
}

export function fetchUser(id: string): Promise<User> {
  return fetchApi<User>(`/api/users/${encodeURIComponent(id)}`);
}

// -----------------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------------

export async function fetchProjects(): Promise<Project[]> {
  const raw = await fetchApi<{ data: Project[] } | Project[]>("/api/projects");
  return Array.isArray(raw) ? raw : raw.data ?? [];
}

// -----------------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------------

export function fetchTasks(
  params?: TasksParams,
): Promise<PaginatedResponse<Task>> {
  return fetchApi<PaginatedResponse<Task>>("/api/tasks", {
    params: params as Record<string, unknown>,
  });
}

export function updateTask(id: string, data: UpdateTaskData): Promise<Task> {
  return fetchApi<Task>(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// -----------------------------------------------------------------------------
// Analytics – Events
// -----------------------------------------------------------------------------

export function fetchEvents(
  params?: EventsParams,
): Promise<PaginatedResponse<AnalyticsEvent>> {
  return fetchApi<PaginatedResponse<AnalyticsEvent>>("/api/analytics/events", {
    params: params as Record<string, unknown>,
  });
}

// -----------------------------------------------------------------------------
// Analytics – Summary, Timeseries, Top Pages
// -----------------------------------------------------------------------------

export function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  return fetchApi<AnalyticsSummary>("/api/analytics/summary");
}

export async function fetchTimeseries(
  params?: TimeseriesParams,
): Promise<TimeseriesPoint[]> {
  const raw = await fetchApi<{ data: TimeseriesPoint[] }>(
    "/api/analytics/timeseries",
    { params: params as Record<string, unknown> },
  );
  return raw.data ?? [];
}

export async function fetchTopPages(params?: TopPagesParams): Promise<TopPage[]> {
  const raw = await fetchApi<{ data: TopPage[] }>(
    "/api/analytics/top-pages",
    { params: params as Record<string, unknown> },
  );
  return raw.data ?? [];
}

// -----------------------------------------------------------------------------
// Claims
// -----------------------------------------------------------------------------

export function fetchClaims(
  params?: ClaimsParams,
): Promise<PaginatedResponse<Claim>> {
  return fetchApi<PaginatedResponse<Claim>>("/api/claims", {
    params: params as Record<string, unknown>,
  });
}

// -----------------------------------------------------------------------------
// Inventory
// -----------------------------------------------------------------------------

export function fetchInventory(
  params?: InventoryParams,
): Promise<PaginatedResponse<InventoryItem>> {
  return fetchApi<PaginatedResponse<InventoryItem>>("/api/inventory", {
    params: params as Record<string, unknown>,
  });
}

// -----------------------------------------------------------------------------
// Jobs
// -----------------------------------------------------------------------------

export function fetchJobs(
  params?: JobsParams,
): Promise<PaginatedResponse<Job>> {
  return fetchApi<PaginatedResponse<Job>>("/api/jobs", {
    params: params as Record<string, unknown>,
  });
}

// -----------------------------------------------------------------------------
// Files
// -----------------------------------------------------------------------------

export function fetchFiles(
  params?: FilesParams,
): Promise<PaginatedResponse<FileItem>> {
  return fetchApi<PaginatedResponse<FileItem>>("/api/files", {
    params: params as Record<string, unknown>,
  });
}

// -----------------------------------------------------------------------------
// Tickets
// -----------------------------------------------------------------------------

export function fetchTickets(
  params?: TicketsParams,
): Promise<PaginatedResponse<Ticket>> {
  return fetchApi<PaginatedResponse<Ticket>>("/api/tickets", {
    params: params as Record<string, unknown>,
  });
}
