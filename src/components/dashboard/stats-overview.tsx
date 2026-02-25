"use client";

import { Activity, Users, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalyticsSummary } from "@/hooks/use-api";
import { KpiCard } from "./kpi-card";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import type { AnalyticsSummary } from "@/types";

// ---------------------------------------------------------------------------
// Stats overview - row of 4 KPI cards
//
// Accepts an optional `data` prop for server-side rendering. When `data` is
// provided the component renders immediately without hitting the client-side
// hook. When omitted it falls back to the `useAnalyticsSummary` hook for
// backward compatibility.
// ---------------------------------------------------------------------------

interface StatsOverviewProps {
  data?: AnalyticsSummary;
  className?: string;
}

export function StatsOverview({ data: serverData, className }: StatsOverviewProps) {
  // Only call the hook when no server data was provided
  const { data: clientData, isLoading, isError } = useAnalyticsSummary({
    enabled: !serverData,
  });

  const data = serverData ?? clientData;

  if (!serverData && isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!serverData && (isError || !data)) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow"
          >
            Failed to load
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      title: "Total Events",
      value: data.totalPageViews.toLocaleString(),
      change: data.pageViewsTrend,
      changeLabel: "vs last period",
      icon: Activity,
      trend: [65, 72, 68, 80, 75, 90, 88, 95, 102, 98],
    },
    {
      title: "Unique Users",
      value: data.uniqueVisitors.toLocaleString(),
      change: data.visitorsTrend,
      changeLabel: "vs last period",
      icon: Users,
      trend: [40, 42, 38, 45, 50, 48, 52, 55, 53, 60],
    },
    {
      title: "Avg Session Duration",
      value: `${Math.floor(data.avgSessionDuration / 60)}m ${Math.round(data.avgSessionDuration % 60)}s`,
      change: 3.2,
      changeLabel: "vs last period",
      icon: TrendingUp,
      trend: [120, 125, 118, 130, 128, 135, 140, 138, 145, 150],
    },
    {
      title: "Bounce Rate",
      value: `${data.bounceRate.toFixed(1)}%`,
      change: -data.bounceRate > 50 ? 2.1 : -1.8,
      changeLabel: "vs last period",
      icon: Zap,
      trend: [45, 42, 44, 40, 38, 36, 35, 33, 32, 30],
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  );
}
