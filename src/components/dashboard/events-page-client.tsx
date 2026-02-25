"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useEvents } from "@/hooks/use-api";
import { useEventStream } from "@/hooks/use-event-stream";
import type { LiveEvent } from "@/hooks/use-event-stream";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ChevronLeft, ChevronRight, Activity, Radio } from "lucide-react";
import type { PaginatedResponse, AnalyticsEvent } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

const EVENT_TYPES = [
  { value: "all", label: "All Events" },
  { value: "page_view", label: "Page View" },
  { value: "click", label: "Click" },
  { value: "signup", label: "Signup" },
  { value: "purchase", label: "Purchase" },
  { value: "form_submit", label: "Form Submit" },
  { value: "search", label: "Search" },
  { value: "error", label: "Error" },
  // TODO: fetch distinct event names from the API instead of hardcoding
] as const;

function eventBadgeVariant(
  name: string
): "default" | "secondary" | "outline" | "destructive" {
  const lower = name.toLowerCase();
  if (lower.includes("error")) return "destructive";
  if (lower.includes("page")) return "default";
  if (lower.includes("click") || lower.includes("purchase"))
    return "secondary";
  return "outline";
}

const MAX_VISIBLE_LIVE_EVENTS = 8;

// ---------------------------------------------------------------------------
// Live event feed component
// ---------------------------------------------------------------------------

function LiveEventFeed({
  liveEvents,
  isConnected,
}: {
  liveEvents: LiveEvent[];
  isConnected: boolean;
}) {
  const visibleEvents = liveEvents.slice(0, MAX_VISIBLE_LIVE_EVENTS);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Live Event Stream
          </CardTitle>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isConnected
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-muted-foreground"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isConnected ? "text-emerald-600" : "text-muted-foreground"
              }`}
            >
              {isConnected ? "Live" : "Disconnected"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {visibleEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 text-center">
            {isConnected
              ? "Waiting for live events..."
              : "Connecting to event stream..."}
          </p>
        ) : (
          <div className="space-y-2">
            {visibleEvents.map((event, index) => (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-all duration-500 ease-out"
                style={{
                  animation: index === 0 ? "live-event-enter 0.4s ease-out" : undefined,
                }}
              >
                <Badge variant={eventBadgeVariant(event.eventName)} className="shrink-0">
                  {event.eventName}
                </Badge>
                <span className="truncate text-muted-foreground" title={event.pageUrl}>
                  {event.pageUrl}
                </span>
                {event.properties.device && (
                  <span className="hidden sm:inline-block text-xs text-muted-foreground/70">
                    {event.properties.device}
                  </span>
                )}
                {event.properties.country && (
                  <span className="hidden sm:inline-block text-xs text-muted-foreground/70">
                    {event.properties.country}
                  </span>
                )}
                <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                  {new Date(event.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* CSS animation for incoming events – uses a plain <style> tag */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes live-event-enter {
              from {
                opacity: 0;
                transform: translateY(-8px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `,
        }}
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EventsPageClientProps {
  initialData: PaginatedResponse<AnalyticsEvent>;
  initialPage: number;
  initialFilter: string;
}

// ---------------------------------------------------------------------------
// Events explorer client component
//
// Receives server-fetched initialData for the first render. Subsequent
// pagination / filter interactions use the client-side React Query hook
// with `initialData` so there is no flash of loading state on first paint.
// ---------------------------------------------------------------------------

export function EventsPageClient({
  initialData,
  initialPage,
  initialFilter,
}: EventsPageClientProps) {
  const [page, setPage] = useState(initialPage);
  const [eventFilter, setEventFilter] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");

  // Live event stream via WebSocket
  const { liveEvents, isConnected } = useEventStream();

  // Build params for the API call
  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(eventFilter !== "all" ? { event_name: eventFilter } : {}),
    }),
    [page, eventFilter]
  );

  // Use initialData for the hook so the first render is instant
  const isInitialParams =
    page === initialPage && eventFilter === initialFilter;

  const { data, isLoading, isError, refetch } = useEvents(params, {
    initialData: isInitialParams ? initialData : undefined,
  });

  const events = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Client-side search filter (supplements server-side name filter)
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.eventName.toLowerCase().includes(q) ||
        e.pageUrl.toLowerCase().includes(q) ||
        (e.userId && e.userId.toLowerCase().includes(q)) ||
        (typeof e.properties.browser === "string" && e.properties.browser.toLowerCase().includes(q)) ||
        (typeof e.properties.country === "string" && e.properties.country.toLowerCase().includes(q))
    );
  }, [events, searchQuery]);

  // Unique event types in current result set
  const uniqueTypes = useMemo(() => {
    const set = new Set(events.map((e) => e.eventName));
    return set.size;
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Browse, filter, and search through all tracked analytics events.
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-xl font-bold tabular-nums">
                {isLoading ? "..." : total.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Filter className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Unique Event Types
              </p>
              <p className="text-xl font-bold tabular-nums">
                {isLoading ? "..." : uniqueTypes}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Range</p>
              <p className="text-sm font-semibold">
                {format(
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  "MMM d"
                )}{" "}
                &ndash; {format(new Date(), "MMM d, yyyy")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live event stream */}
      <LiveEventFeed liveEvents={liveEvents} isConnected={isConnected} />

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={eventFilter}
          onValueChange={(v) => {
            setEventFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events by URL, user, browser, country..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Events table */}
      {isLoading ? (
        <TableSkeleton rows={PAGE_SIZE} columns={7} />
      ) : isError ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Failed to load events. Please try again.
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No events found"
          description={
            searchQuery
              ? "Try adjusting your search or filters."
              : "No events match the current filter criteria."
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setEventFilter("all");
            setSearchQuery("");
            setPage(1);
          }}
        />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Events{" "}
              <Badge variant="secondary" className="ml-2">
                {total.toLocaleString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">URL</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Referrer
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Browser
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Country
                  </TableHead>
                  <TableHead className="pr-6 text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="pl-6">
                      <Badge variant={eventBadgeVariant(event.eventName)}>
                        {event.eventName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {event.userId ? (
                        <span className="font-mono text-xs">
                          {event.userId.slice(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Anon</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate text-sm text-muted-foreground md:table-cell">
                      {event.pageUrl}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {String(event.properties.referrer ?? "") || "Direct"}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {String(event.properties.browser ?? "") || "Unknown"}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                      {String(event.properties.country ?? "") || "--"}
                    </TableCell>
                    <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} &middot; {total} total events
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
