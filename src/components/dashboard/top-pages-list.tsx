"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTopPages } from "@/hooks/use-api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopPage } from "@/types";

// ---------------------------------------------------------------------------
// Top pages list component
//
// Accepts an optional `data` prop for server-side rendering. When `data` is
// provided the component renders immediately without hitting the client-side
// hook. When omitted it falls back to the `useTopPages` hook for backward
// compatibility.
// ---------------------------------------------------------------------------

interface TopPagesListProps {
  data?: TopPage[];
  className?: string;
}

export function TopPagesList({ data: serverData, className }: TopPagesListProps) {
  // Only call the hook when no server data was provided
  const { data: clientData, isLoading, isError } = useTopPages(
    { limit: 10 },
    { enabled: !serverData },
  );

  const pages = serverData ?? clientData;
  const maxViews = pages?.[0]?.views ?? 1;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Top Pages
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!serverData && isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : !serverData && (isError || !pages) ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Failed to load top pages.
          </p>
        ) : !pages || pages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No page data available yet.
          </p>
        ) : (
          <div className="space-y-3">
            {pages.map((page, index) => {
              const percentage = (page.views / maxViews) * 100;

              return (
                <div key={`${page.path}-${index}`} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 truncate pr-4">
                      <span className="w-5 shrink-0 text-xs font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="truncate font-medium" title={page.path}>
                        {page.title || page.path}
                      </span>
                    </div>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
