export const CACHE_TAGS = {
  analyticsSummary: "analytics-summary",
  timeseries: "analytics-timeseries",
  topPages: "analytics-top-pages",
  events: "events",
  users: "users",
  user: (id: string) => `user-${id}`,
  files: "files",
  tasks: "tasks",
  projects: "projects",
} as const;
