"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Plus,
  Radio,
  Zap,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Users,
  X,
  Info,
  Activity,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useAlertStream } from "@/hooks/use-alert-stream";
import type { AlertNotification } from "@/hooks/use-alert-stream";
import type { LucideIcon } from "lucide-react";
import type { AlertRule } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function severityColor(severity: AlertRule["severity"]): string {
  switch (severity) {
    case "critical":
      return "text-red-600 bg-red-50 dark:bg-red-950/30";
    case "warning":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
    case "info":
      return "text-blue-600 bg-blue-50 dark:bg-blue-950/30";
  }
}

function severityIcon(severity: AlertRule["severity"]): LucideIcon {
  switch (severity) {
    case "critical":
      return ShieldAlert;
    case "warning":
      return AlertTriangle;
    case "info":
      return Info;
  }
}

function metricIcon(metric: string): LucideIcon {
  const normalized = metric.toLowerCase();
  if (normalized.includes("error")) return AlertTriangle;
  if (normalized.includes("revenue") || normalized.includes("purchase") || normalized.includes("price")) return DollarSign;
  if (normalized.includes("user") || normalized.includes("signup")) return Users;
  if (normalized.includes("conversion") || normalized.includes("bounce") || normalized.includes("drop")) return TrendingDown;
  if (normalized.includes("page_view") || normalized.includes("pageview") || normalized.includes("traffic")) return Zap;
  if (normalized.includes("session") || normalized.includes("latency") || normalized.includes("response")) return Activity;
  return BarChart3;
}

function operatorLabel(operator: string): string {
  switch (operator) {
    case "gt":
      return ">";
    case "gte":
      return ">=";
    case "lt":
      return "<";
    case "lte":
      return "<=";
    case "eq":
      return "=";
    case "neq":
      return "!=";
    case "change":
      return "% change >";
    default:
      return operator;
  }
}

function buildConditionString(alert: AlertRule): string {
  return `${alert.conditionMetric} ${operatorLabel(alert.conditionOperator)} ${alert.conditionThreshold} over ${alert.conditionWindow}`;
}

function formatTriggeredTime(timestamp: string | null): string {
  if (!timestamp) return "Never triggered";
  const date = new Date(timestamp);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Less than an hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Notification helpers
// ---------------------------------------------------------------------------

function notificationSeverityDot(severity: AlertNotification["severity"]): string {
  switch (severity) {
    case "critical":
      return "bg-red-500";
    case "warning":
      return "bg-amber-500";
    case "info":
      return "bg-blue-500";
  }
}

function notificationSeverityBadgeClass(severity: AlertNotification["severity"]): string {
  switch (severity) {
    case "critical":
      return "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400";
    case "warning":
      return "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400";
    case "info":
      return "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400";
  }
}

function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffSeconds < 10) return "Just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Alerts client component
// ---------------------------------------------------------------------------

interface AlertsPageClientProps {
  alerts: AlertRule[];
}

export function AlertsPageClient({ alerts: initialAlerts }: AlertsPageClientProps) {
  const [alerts, setAlerts] = useState<AlertRule[]>(initialAlerts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [triggersExpanded, setTriggersExpanded] = useState(true);

  const { alertNotifications, isConnected } = useAlertStream();

  // Toggle alert active state
  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  // Delete alert
  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const activeCount = alerts.filter((a) => a.active).length;
  const pausedCount = alerts.filter((a) => !a.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alert Rules</h1>
          <p className="text-sm text-muted-foreground">
            Configure automated alerts based on your analytics data.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
              <DialogDescription>
                Set up a new alert rule that triggers when specific conditions
                are met. {/* TODO: wire this up to a real backend */}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="alert-name">Alert Name</Label>
                <Input id="alert-name" placeholder="e.g. High Bounce Rate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-description">Description</Label>
                <Input
                  id="alert-description"
                  placeholder="Describe when this alert should trigger"
                />
              </div>
              <div className="space-y-2">
                <Label>Metric</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page_views">Page Views</SelectItem>
                    <SelectItem value="error_rate">Error Rate</SelectItem>
                    <SelectItem value="signup_rate">Signup Rate</SelectItem>
                    <SelectItem value="bounce_rate">Bounce Rate</SelectItem>
                    <SelectItem value="purchase_events">
                      Purchase Events
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gt">Greater than</SelectItem>
                      <SelectItem value="lt">Less than</SelectItem>
                      <SelectItem value="eq">Equals</SelectItem>
                      <SelectItem value="change">% Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Decorative: just close the dialog
                  setDialogOpen(false);
                }}
              >
                Create Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary badges */}
      <div className="flex items-center gap-3">
        <Badge variant="default" className="tabular-nums">
          {activeCount} Active
        </Badge>
        <Badge variant="secondary" className="tabular-nums">
          {pausedCount} Paused
        </Badge>
        <Badge variant="outline" className="tabular-nums">
          {alerts.length} Total
        </Badge>
      </div>

      {/* Real-time alert triggers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Recent Triggers</CardTitle>
              {isConnected ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live Monitoring
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                  Disconnected
                </Badge>
              )}
              {alertNotifications.length > 0 && (
                <Badge variant="secondary" className="tabular-nums text-[10px]">
                  {alertNotifications.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTriggersExpanded((prev) => !prev)}
            >
              {triggersExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">
                {triggersExpanded ? "Collapse" : "Expand"} recent triggers
              </span>
            </Button>
          </div>
          <CardDescription>
            Real-time alert trigger notifications from the monitoring stream.
          </CardDescription>
        </CardHeader>
        {triggersExpanded && (
          <CardContent className="pt-0">
            {alertNotifications.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No alert triggers yet. Waiting for incoming notifications...
              </p>
            ) : (
              <div className="space-y-2">
                {alertNotifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    {/* Severity dot */}
                    <span
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        notificationSeverityDot(notification.severity),
                      )}
                    />

                    {/* Alert name */}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {notification.name}
                    </span>

                    {/* Severity badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-[10px]",
                        notificationSeverityBadgeClass(notification.severity),
                      )}
                    >
                      {notification.severity}
                    </Badge>

                    {/* Timestamp */}
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatNotificationTime(notification.triggeredAt)}
                    </span>
                  </div>
                ))}
                {alertNotifications.length > 5 && (
                  <p className="pt-1 text-center text-xs text-muted-foreground">
                    +{alertNotifications.length - 5} more notifications
                  </p>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Alert cards */}
      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alert rules"
          description="You haven't created any alert rules yet. Create one to get notified when key metrics change."
          actionLabel="Create Alert"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = metricIcon(alert.conditionMetric);
            const SeverityIcon = severityIcon(alert.severity);
            return (
              <Card
                key={alert.id}
                className={cn(
                  "transition-opacity",
                  !alert.active && "opacity-60"
                )}
              >
                <CardContent className="flex items-start gap-4 p-5">
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      severityColor(alert.severity)
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{alert.name}</h3>
                      <Badge
                        variant={alert.active ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {alert.active ? "Active" : "Paused"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          alert.severity === "critical" &&
                            "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
                          alert.severity === "warning" &&
                            "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                        )}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    {alert.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                    )}
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {buildConditionString(alert)}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Last triggered:{" "}
                        <span className="font-medium">
                          {formatTriggeredTime(alert.lastTriggeredAt)}
                        </span>
                      </span>
                      <span>
                        Triggered{" "}
                        <span className="font-medium">
                          {alert.triggerCount} {alert.triggerCount === 1 ? "time" : "times"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`toggle-${alert.id}`}
                        className="sr-only"
                      >
                        {alert.active ? "Pause" : "Activate"} alert
                      </Label>
                      <Switch
                        id={`toggle-${alert.id}`}
                        checked={alert.active}
                        onCheckedChange={() => toggleAlert(alert.id)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Delete alert</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
