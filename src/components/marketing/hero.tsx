import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function DashboardPreview() {
  const barHeights = [40, 65, 45, 80, 60, 90, 75, 55, 85, 70, 95, 88];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <Card className="w-full overflow-hidden border-border/50 shadow-2xl">
      {/* Mock toolbar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-muted px-3 py-1">
          <BarChart3 className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            dashboard.acme-analytics.com
          </span>
        </div>
        <div className="w-14" />
      </div>

      <CardContent className="p-6">
        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total Events",
              value: "1.2M",
              change: "+12.5%",
              icon: MousePointerClick,
            },
            {
              label: "Active Users",
              value: "8,429",
              change: "+8.1%",
              icon: Users,
            },
            {
              label: "Page Views",
              value: "324K",
              change: "+23.4%",
              icon: Eye,
            },
            {
              label: "Conversion",
              value: "3.24%",
              change: "+0.8%",
              icon: TrendingUp,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/50 bg-card p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
                <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-emerald-600">
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Mock chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Events Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex h-32 items-end gap-1.5 sm:gap-2">
              {barHeights.map((height, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm bg-primary/80 transition-all hover:bg-primary"
                    style={{ height: `${height}%` }}
                  />
                  <span className="hidden text-[10px] text-muted-foreground sm:block">
                    {months[i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Gradient background decorations */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.6 0.15 250), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.7 0.12 320), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.1 160), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8 lg:pb-32 lg:pt-40">
        {/* Text content */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium"
          >
            Now with AI-powered insights
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Understand your users.
            <br />
            <span className="bg-gradient-to-r from-primary/80 via-primary to-primary/80 bg-clip-text text-transparent">
              Grow your product.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Acme Analytics gives you real-time insights into how users interact
            with your product. Track events, analyze funnels, and make
            data-driven decisions.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              <Link href="#">View Demo</Link>
            </Button>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
          <div className="rounded-xl bg-gradient-to-b from-muted/50 to-muted/20 p-2 ring-1 ring-border/50 sm:p-3">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
