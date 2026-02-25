"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/use-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Badge variant helper
// ---------------------------------------------------------------------------

function eventBadgeVariant(name: string): "default" | "secondary" | "outline" {
  if (name.startsWith("page")) return "default";
  if (name.startsWith("click") || name.startsWith("button")) return "secondary";
  return "outline";
}

// ---------------------------------------------------------------------------
// Events table component
// ---------------------------------------------------------------------------

export function EventsTable({ className }: { className?: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useEvents({
    page,
    limit: PAGE_SIZE,
  });

  const events = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (isLoading) {
    return <TableSkeleton rows={PAGE_SIZE} columns={6} className={className} />;
  }

  if (isError) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Failed to load events. Please try again later.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Events</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Event Name</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Page URL</TableHead>
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              <TableHead className="hidden lg:table-cell">Device</TableHead>
              <TableHead className="pr-6 text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
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
                    <span className="text-muted-foreground">Anonymous</span>
                  )}
                </TableCell>
                <TableCell className="hidden max-w-[200px] truncate text-sm text-muted-foreground md:table-cell">
                  {event.pageUrl}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {String(event.properties.referrer ?? "") || "Direct"}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {String(event.properties.device ?? "") || "Unknown"}
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
            {events.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({total} events)
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
