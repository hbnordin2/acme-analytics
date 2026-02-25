"use client";

import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const eventColors: Record<string, string> = {
  pageview: "bg-blue-500",
  click: "bg-green-500",
  form_submit: "bg-purple-500",
  purchase: "bg-amber-500",
  signup: "bg-emerald-500",
  error: "bg-red-500",
};

function getEventColor(name: string): string {
  const key = Object.keys(eventColors).find((k) =>
    name.toLowerCase().includes(k)
  );
  return key ? eventColors[key] : "bg-muted-foreground";
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function describeEvent(eventName: string, pageUrl: string): string {
  if (eventName.toLowerCase().includes("pageview")) return `Viewed ${pageUrl}`;
  if (eventName.toLowerCase().includes("click")) return `Clicked on ${pageUrl}`;
  if (eventName.toLowerCase().includes("signup")) return "New user signed up";
  if (eventName.toLowerCase().includes("purchase")) return "Completed a purchase";
  if (eventName.toLowerCase().includes("form")) return `Submitted form on ${pageUrl}`;
  return `${eventName} on ${pageUrl}`;
}

// ---------------------------------------------------------------------------
// Recent activity component
// ---------------------------------------------------------------------------

export function RecentActivity({ className }: { className?: string }) {
  const { data, isLoading, isError } = useEvents({ limit: 10 });

  const events = data?.data ?? [];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Failed to load recent activity.
          </p>
        ) : events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent activity.
          </p>
        ) : (
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />

            {events.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  "relative flex items-start gap-3 py-3",
                  index === 0 && "pt-0"
                )}
              >
                {/* Colored dot */}
                <span
                  className={cn(
                    "relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background",
                    getEventColor(event.eventName)
                  )}
                />

                {/* Content */}
                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  <Badge
                    variant="secondary"
                    className="w-fit text-[10px] uppercase"
                  >
                    {event.eventName}
                  </Badge>
                  <p className="truncate text-sm text-muted-foreground">
                    {describeEvent(event.eventName, event.pageUrl)}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
