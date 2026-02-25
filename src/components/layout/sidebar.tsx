"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Filter,
  Users,
  FileText,
  Bell,
  FolderOpen,
  Settings,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Navigation structure
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Events", href: "/dashboard/events", icon: Activity },
    ],
  },
  {
    title: "ANALYSIS",
    items: [
      { label: "Funnels", href: "/dashboard/funnels", icon: Filter },
      { label: "Users", href: "/dashboard/users", icon: Users },
      { label: "Reports", href: "/dashboard/reports", icon: FileText },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
      { label: "Files", href: "/dashboard/files", icon: FolderOpen },
    ],
  },
  {
    title: "SETTINGS",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

export function Sidebar() {
  const pathname = usePathname();
  const liveVisitorCount = useAppStore((s) => s.liveVisitorCount);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <BarChart3 className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold tracking-tight">
          Acme Analytics
        </span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Live visitors indicator */}
      <Separator />
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-sm text-muted-foreground">
          Live:{" "}
          <span className="font-semibold text-foreground">
            {liveVisitorCount}
          </span>{" "}
          {liveVisitorCount === 1 ? "visitor" : "visitors"}
        </span>
      </div>
    </div>
  );
}
