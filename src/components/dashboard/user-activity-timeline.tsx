"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useEvents } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserActivityTimelineProps {
  userId: string;
  limit?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Event type styling
// ---------------------------------------------------------------------------

const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; dotColor: string; variant: "default" | "secondary" | "outline" }
> = {
  page_view: {
    label: "Page View",
    dotColor: "bg-blue-500",
    variant: "default",
  },
  click: {
    label: "Click",
    dotColor: "bg-green-500",
    variant: "secondary",
  },
  button_click: {
    label: "Button Click",
    dotColor: "bg-green-500",
    variant: "secondary",
  },
  form_submit: {
    label: "Form Submit",
    dotColor: "bg-amber-500",
    variant: "outline",
  },
  sign_in: {
    label: "Sign In",
    dotColor: "bg-purple-500",
    variant: "default",
  },
  sign_up: {
    label: "Sign Up",
    dotColor: "bg-purple-500",
    variant: "default",
  },
  purchase: {
    label: "Purchase",
    dotColor: "bg-emerald-500",
    variant: "default",
  },
  error: {
    label: "Error",
    dotColor: "bg-red-500",
    variant: "outline",
  },
};

function getEventConfig(eventName: string) {
  // Direct match
  if (EVENT_TYPE_CONFIG[eventName]) {
    return EVENT_TYPE_CONFIG[eventName];
  }

  // Prefix match
  for (const [prefix, config] of Object.entries(EVENT_TYPE_CONFIG)) {
    if (eventName.startsWith(prefix)) {
      return { ...config, label: eventName.replace(/_/g, " ") };
    }
  }

  // Default
  return {
    label: eventName.replace(/_/g, " "),
    dotColor: "bg-gray-400",
    variant: "outline" as const,
  };
}

function buildDescription(event: { eventName: string; pageUrl: string; properties: Record<string, unknown> }): string {
  const config = getEventConfig(event.eventName);

  if (event.eventName.startsWith("page_view") || event.eventName === "page_view") {
    return `Viewed ${event.pageUrl}`;
  }

  const referrer = event.properties.referrer;
  if (referrer) {
    return `${config.label} on ${event.pageUrl} (from ${String(referrer)})`;
  }

  return `${config.label} on ${event.pageUrl}`;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function TimelineSkeleton() {
  return (
    <div className="space-y-6 pl-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline component
// ---------------------------------------------------------------------------

export function UserActivityTimeline({
  userId,
  limit = 20,
  className,
}: UserActivityTimelineProps) {
  const { data, isLoading, isError } = useEvents({
    userId,
    limit,
  });

  const events = useMemo(() => data?.data ?? [], [data]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Failed to load activity timeline.
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No activity recorded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-6">
            {events.map((event, index) => {
              const config = getEventConfig(event.eventName);
              const description = buildDescription(event);
              const timestamp = new Date(event.timestamp);

              return (
                <div
                  key={event.id}
                  className={cn(
                    "relative flex gap-4 pl-6",
                    index === events.length - 1 && "pb-0",
                  )}
                >
                  {/* Colored dot */}
                  <div
                    className={cn(
                      "absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-background ring-2 ring-background",
                      config.dotColor,
                    )}
                  />

                  {/* Event content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={config.variant} className="text-xs">
                        {config.label}
                      </Badge>
                      {Boolean(event.properties.device) && (
                        <span className="text-xs text-muted-foreground">
                          {String(event.properties.device)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-foreground">
                      {description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(timestamp, { addSuffix: true })}
                      <span className="mx-1.5 text-border">|</span>
                      {timestamp.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
