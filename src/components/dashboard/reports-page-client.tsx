"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Plus,
  Clock,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Repeat,
  FileBarChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LucideIcon } from "lucide-react";
import type { Report } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a reportType string to a Lucide icon. Falls back to FileText. */
function iconForReportType(reportType: string): LucideIcon {
  const map: Record<string, LucideIcon> = {
    traffic: BarChart3,
    users: Users,
    funnel: TrendingUp,
    revenue: DollarSign,
    retention: Repeat,
    pages: FileBarChart,
  };
  return map[reportType] ?? FileText;
}

/** Format a byte count into a human-readable string (e.g. "2.4 MB"). */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  // Use up to 1 decimal place, but drop trailing ".0"
  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[i]}`;
}

/** Return a relative time label like "2 days ago" for a given ISO timestamp. */
function timeAgo(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  return `${diffMonths} months ago`;
}

/** Badge variant based on report status. */
function statusBadgeVariant(
  status: Report["status"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ready":
      return "default";
    case "generating":
      return "secondary";
    case "scheduled":
      return "outline";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

// ---------------------------------------------------------------------------
// Reports client component
// ---------------------------------------------------------------------------

interface ReportsPageClientProps {
  reports: Report[];
}

export function ReportsPageClient({ reports }: ReportsPageClientProps) {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            View and download pre-generated analytics reports.
          </p>
        </div>

        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate New Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Select a report type and date range to generate a new analytics
                report.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traffic">Traffic Summary</SelectItem>
                    <SelectItem value="users">Active Users</SelectItem>
                    <SelectItem value="funnel">Conversion Funnel</SelectItem>
                    <SelectItem value="revenue">Revenue Analytics</SelectItem>
                    <SelectItem value="retention">
                      Retention Cohorts
                    </SelectItem>
                    <SelectItem value="pages">Top Pages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-from">From</Label>
                  <Input id="report-from" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-to">To</Label>
                  <Input id="report-to" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setGenerateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setGenerateDialogOpen(false)}>
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Report cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => {
          const Icon = iconForReportType(report.reportType);

          return (
            <Card key={report.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={statusBadgeVariant(report.status)}
                      className="text-[10px]"
                    >
                      {report.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {report.format.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="mt-3 text-base">
                  {report.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Last generated:{" "}
                    {report.generatedAt
                      ? timeAgo(report.generatedAt)
                      : "Never"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{formatBytes(report.sizeBytes)}</span>
                </div>
              </CardContent>

              <CardFooter className="gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={report.status !== "ready"}
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  View Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={report.status !== "ready"}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Bottom info text */}
      <p className="text-center text-xs text-muted-foreground">
        Reports are generated automatically on a weekly schedule. You can also
        generate custom reports on demand using the button above.
      </p>
    </div>
  );
}
