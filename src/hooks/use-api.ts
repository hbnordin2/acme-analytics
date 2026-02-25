"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  fetchUsers,
  fetchUser,
  fetchProjects,
  fetchTasks,
  updateTask,
  fetchEvents,
  fetchAnalyticsSummary,
  fetchTimeseries,
  fetchTopPages,
  fetchClaims,
  fetchInventory,
  fetchJobs,
  fetchFiles,
  fetchTickets,
} from "@/lib/api";

import type {
  AnalyticsSummary,
  Claim,
  AnalyticsEvent,
  ClaimsParams,
  EventsParams,
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
// Query key factory – keeps keys consistent and easy to invalidate
// -----------------------------------------------------------------------------

export const queryKeys = {
  users: {
    all: ["users"] as const,
    list: (params?: UsersParams) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: () => ["projects", "list"] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (params?: TasksParams) => ["tasks", "list", params] as const,
  },
  events: {
    all: ["events"] as const,
    list: (params?: EventsParams) => ["events", "list", params] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    summary: () => ["analytics", "summary"] as const,
    timeseries: (params?: TimeseriesParams) =>
      ["analytics", "timeseries", params] as const,
    topPages: (params?: TopPagesParams) =>
      ["analytics", "topPages", params] as const,
  },
  claims: {
    all: ["claims"] as const,
    list: (params?: ClaimsParams) => ["claims", "list", params] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    list: (params?: InventoryParams) =>
      ["inventory", "list", params] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    list: (params?: JobsParams) => ["jobs", "list", params] as const,
  },
  files: {
    all: ["files"] as const,
    list: (params?: FilesParams) => ["files", "list", params] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    list: (params?: TicketsParams) => ["tickets", "list", params] as const,
  },
} as const;

// -----------------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------------

export function useUsers(
  params?: UsersParams,
  options?: Partial<UseQueryOptions<PaginatedResponse<User>>>,
) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => fetchUsers(params),
    ...options,
  });
}

export function useUser(
  id: string,
  options?: Partial<UseQueryOptions<User>>,
) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
    ...options,
  });
}

// -----------------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------------

export function useProjects(
  options?: Partial<UseQueryOptions<Project[]>>,
) {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: fetchProjects,
    ...options,
  });
}

// -----------------------------------------------------------------------------
// Tasks
// -----------------------------------------------------------------------------

export function useTasks(
  params?: TasksParams,
  options?: Partial<UseQueryOptions<PaginatedResponse<Task>>>,
) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => fetchTasks(params),
    ...options,
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

// -----------------------------------------------------------------------------
// Events
// -----------------------------------------------------------------------------

export function useEvents(
  params?: EventsParams,
  options?: Partial<UseQueryOptions<PaginatedResponse<AnalyticsEvent>>>,
) {
  return useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => fetchEvents(params),
    ...options,
  });
}

// -----------------------------------------------------------------------------
// Analytics
// -----------------------------------------------------------------------------

export function useAnalyticsSummary(
  options?: Partial<UseQueryOptions<AnalyticsSummary>>,
) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(),
    queryFn: fetchAnalyticsSummary,
    ...options,
  });
}

export function useTimeseries(
  params?: TimeseriesParams,
  options?: Partial<UseQueryOptions<TimeseriesPoint[]>>,
) {
  return useQuery({
    queryKey: queryKeys.analytics.timeseries(params),
    queryFn: () => fetchTimeseries(params),
    ...options,
  });
}

export function useTopPages(
  params?: TopPagesParams,
  options?: Partial<UseQueryOptions<TopPage[]>>,
) {
  return useQuery({
    queryKey: queryKeys.analytics.topPages(params),
    queryFn: () => fetchTopPages(params),
    ...options,
  });
}

// -----------------------------------------------------------------------------
// Claims
// -----------------------------------------------------------------------------

export function useClaims(
  params?: ClaimsParams,
  options?: Partial<UseQueryOptions<PaginatedResponse<Claim>>>,
) {
  return useQuery({
    queryKey: queryKeys.claims.list(params),
    queryFn: () => fetchClaims(params),
    ...options,
  });
}

// -----------------------------------------------------------------------------
// Inventory
// -----------------------------------------------------------------------------

export function useInventory(
  params?: InventoryParams,
  options?: Partial<UseQueryOptions<PaginatedResponse<InventoryItem>>>,
) {
  return useQuery({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => fetchInventory(params),
    ...options,
  });
}

// -----------------------------------------------------------------------------
// Jobs
// -----------------------------------------------------------------------------

export function useJobs(
  params?: JobsParams,
  options?: Partial<UseQueryOptions<PaginatedResponse<Job>>>,
) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: () => fetchJobs(params),
    ...options,
  });
}

// -----------------------------------------------------------------------------
// Files
// -----------------------------------------------------------------------------

export function useFiles(
  params?: FilesParams,
  options?: Partial<UseQueryOptions<PaginatedResponse<FileItem>>>,
) {
  return useQuery({
    queryKey: queryKeys.files.list(params),
    queryFn: () => fetchFiles(params),
    ...options,
  });
}

// -----------------------------------------------------------------------------
// Tickets
// -----------------------------------------------------------------------------

export function useTickets(
  params?: TicketsParams,
  options?: Partial<UseQueryOptions<PaginatedResponse<Ticket>>>,
) {
  return useQuery({
    queryKey: queryKeys.tickets.list(params),
    queryFn: () => fetchTickets(params),
    ...options,
  });
}
