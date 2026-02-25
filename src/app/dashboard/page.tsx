import { Suspense } from "react";
import { fetchDashboardDataServer } from "@/lib/api-server";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { AreaChartCard } from "@/components/dashboard/area-chart-card";
import { BarChartCard } from "@/components/dashboard/bar-chart-card";
import { EventsTable } from "@/components/dashboard/events-table";
import { LiveVisitors } from "@/components/dashboard/live-visitors";
import { TopPagesList } from "@/components/dashboard/top-pages-list";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  CardSkeleton,
  ChartSkeleton,
} from "@/components/shared/loading-skeleton";

// ---------------------------------------------------------------------------
// Main dashboard overview page (Server Component)
//
// This page uses a single GraphQL query (via fetchDashboardDataServer) to
// fetch the analytics summary, timeseries, and top pages data in one request.
// This is more efficient than the previous approach of making three separate
// REST calls, reducing round-trips and overall latency.
//
// Interactive/chart components remain client components and receive data as
// props. Sections that need client-side pagination (EventsTable,
// RecentActivity) and WebSocket (LiveVisitors) stay fully client-managed.
//
// TODO: Add date range picker to control the timeseries interval
// TODO: Support project-level filtering from the sidebar project selector
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export const metadata = { title: "Dashboard" };

// ---------------------------------------------------------------------------
// Async server sub-component — fetches all dashboard data via GraphQL
// ---------------------------------------------------------------------------

async function DashboardContent() {
  // Single GraphQL query fetches summary, timeseries, and top pages together
  const { analyticsSummary, timeseries, topPages } =
    await fetchDashboardDataServer({
      days: 30,
      interval: "day",
      topPagesLimit: 8,
    });

  // Transform timeseries into the shape AreaChartCard expects
  const areaChartData = timeseries.map((point) => ({
    date: point.timestamp,
    value: point.pageViews,
  }));

  // Transform top pages into the shape BarChartCard expects
  const barChartData = topPages.map((page) => ({
    name:
      page.path.length > 20 ? page.path.slice(0, 20) + "..." : page.path,
    views: page.views,
  }));

  return (
    <>
      {/* KPI row (4 cards) */}
      <StatsOverview data={analyticsSummary} />

      {/* Charts row: Area chart + Live visitors */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AreaChartCard
          title="Page Views"
          data={areaChartData}
          className="lg:col-span-2"
        />

        <div className="flex flex-col gap-4">
          <LiveVisitors className="flex-1" />

          {/* Quick stats box */}
          <div className="rounded-xl border bg-card p-4 shadow">
            <p className="text-sm font-medium text-muted-foreground">
              Data Points Loaded
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {timeseries.length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {/* NOTE: this is just a decorative stat showing how many data points
                  the timeseries endpoint returned */}
              timeseries data points
            </p>
          </div>
        </div>
      </div>

      {/* Second row: Bar chart + Top pages list */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChartCard
          title="Top Pages (Views)"
          data={barChartData}
          dataKey="views"
          xAxisKey="name"
        />

        <TopPagesList data={topPages} />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Skeleton fallback for the Suspense boundary
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <>
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartSkeleton className="lg:col-span-2" />
        <div className="flex flex-col gap-4">
          <CardSkeleton className="flex-1" />
          <CardSkeleton />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your analytics for the last 30 days.
        </p>
      </div>

      {/* All server-fetched dashboard content — single GraphQL query */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>

      {/* Events table + Recent activity (client-side pagination) */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <EventsTable className="xl:col-span-2" />
        <RecentActivity />
      </div>
    </div>
  );
}
