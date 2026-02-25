// -----------------------------------------------------------------------------
// Entity types – field names match the REST API responses after snake_case →
// camelCase conversion (handled automatically by fetchApi's camelizeKeys).
// -----------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  plan: string;
  createdAt: string;
  lastSeen: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "P0" | "P1" | "P2" | "P3";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeId: string | null;
  projectId: string;
  labels: string[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assigneeName: string | null;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  userId: string | null;
  pageUrl: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

export type ClaimStatus = "open" | "under_review" | "approved" | "denied" | "closed";

export interface Claim {
  id: string;
  claimNumber: string;
  type: string;
  description: string;
  status: string;
  amount: string;
  adjusterId: string | null;
  claimantName: string;
  filedAt: string;
  updatedAt: string;
  adjusterName: string | null;
}

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "discontinued";

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: string;
  warehouseLocation: string | null;
  supplier: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = "open" | "closed" | "paused" | "draft";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  remotePolicy: string;
  status: string;
  postedAt: string;
  closesAt: string | null;
}

export interface FileItem {
  id: string;
  name: string;
  mimeType: string | null;
  sizeBytes: string;
  isFolder: boolean;
  parentId: string | null;
  createdBy: string;
  trashed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  customerId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  assigneeName: string | null;
}

// -----------------------------------------------------------------------------
// Analytics-specific types
// -----------------------------------------------------------------------------

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  topReferrer: string | null;
  pageViewsTrend: number;
  visitorsTrend: number;
}

export interface TimeseriesPoint {
  timestamp: string;
  pageViews: number;
  visitors: number;
  sessions: number;
}

export interface TopPage {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgDuration: number;
}

// -----------------------------------------------------------------------------
// API response wrapper
// -----------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// -----------------------------------------------------------------------------
// API request parameter types
// -----------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRangeParams {
  from?: string;
  to?: string;
}

export interface UsersParams extends PaginationParams, SortParams {
  search?: string;
  role?: string;
}

export interface TasksParams extends PaginationParams, SortParams {
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface EventsParams extends PaginationParams, DateRangeParams {
  projectId?: string;
  name?: string;
  sessionId?: string;
  userId?: string;
}

export interface TimeseriesParams extends DateRangeParams {
  projectId?: string;
  interval?: "hour" | "day" | "week" | "month";
  period?: string;
  days?: number;
}

export interface TopPagesParams extends DateRangeParams {
  projectId?: string;
  limit?: number;
}

export interface ClaimsParams extends PaginationParams, SortParams {
  status?: string;
  claimantId?: string;
  search?: string;
}

export interface InventoryParams extends PaginationParams, SortParams {
  category?: string;
  status?: string;
  search?: string;
}

export interface JobsParams extends PaginationParams, SortParams {
  status?: string;
  type?: string;
}

export interface FilesParams extends PaginationParams, SortParams {
  parent_id?: string;
  trashed?: boolean;
  projectId?: string;
  mimeType?: string;
  search?: string;
}

export interface TicketsParams extends PaginationParams, SortParams {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
}

// -----------------------------------------------------------------------------
// Funnels
// -----------------------------------------------------------------------------

export interface FunnelStep {
  name: string;
  eventName: string;
  count: number;
  percentage: number;
  dropOff: number;
}

export interface Funnel {
  id: string;
  name: string;
  description: string | null;
  createdByName: string | null;
  totalEntries: number;
  steps: FunnelStep[];
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Reports
// -----------------------------------------------------------------------------

export interface Report {
  id: string;
  title: string;
  description: string | null;
  format: "pdf" | "csv" | "excel";
  status: "ready" | "generating" | "scheduled" | "failed";
  sizeBytes: number;
  reportType: string;
  createdByName: string | null;
  generatedAt: string | null;
  schedule: string | null;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Alert Rules
// -----------------------------------------------------------------------------

export interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  conditionMetric: string;
  conditionOperator: string;
  conditionThreshold: number;
  conditionWindow: string;
  severity: "info" | "warning" | "critical";
  active: boolean;
  notifyEmail: boolean;
  notifySlack: boolean;
  lastTriggeredAt: string | null;
  triggerCount: number;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Workspace
// -----------------------------------------------------------------------------

export interface WorkspaceSettings {
  id: string;
  name: string;
  timezone: string;
  dateFormat: string;
}

export interface BillingInfo {
  plan: string;
  monthlyAmount: number;
  usageEvents: number;
  usageLimit: number;
  nextBillingDate: string;
  paymentMethodType: string | null;
  paymentMethodLast4: string | null;
  paymentMethodExpires: string | null;
}

export interface WorkspaceData {
  workspace: WorkspaceSettings;
  billing: BillingInfo;
}

// -----------------------------------------------------------------------------
// API Keys
// -----------------------------------------------------------------------------

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdBy: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Notification Preferences
// -----------------------------------------------------------------------------

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  slackEnabled: boolean;
  weeklyDigest: boolean;
  alertNotifications: boolean;
  marketing: boolean;
}

// -----------------------------------------------------------------------------
// Notification type used in the global store
// -----------------------------------------------------------------------------

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  createdAt: Date;
}
