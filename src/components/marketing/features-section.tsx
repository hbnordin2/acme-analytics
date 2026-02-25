import {
  Activity,
  Filter,
  Users,
  LayoutDashboard,
  Bell,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Real-time Events",
    description:
      "Track every user interaction as it happens. Page views, clicks, signups, and custom events.",
    icon: Activity,
  },
  {
    title: "Funnel Analysis",
    description:
      "See where users drop off in your conversion flows. Optimize every step.",
    icon: Filter,
  },
  {
    title: "User Profiles",
    description:
      "Rich user profiles with full event history. Segment by behavior, plan, or custom properties.",
    icon: Users,
  },
  {
    title: "Custom Dashboards",
    description:
      "Build dashboards with drag-and-drop widgets. Share with your team.",
    icon: LayoutDashboard,
  },
  {
    title: "Alerts & Monitoring",
    description:
      "Set up alerts for anomalies. Get notified when metrics spike or drop.",
    icon: Bell,
  },
  {
    title: "Team Collaboration",
    description:
      "Share insights, annotate charts, and collaborate with your whole team.",
    icon: MessageSquare,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to understand your users
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful analytics tools designed for modern product teams. No data
            engineering degree required.
          </p>
        </div>

        {/* Features grid */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-300 group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
