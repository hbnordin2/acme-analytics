import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fetchUserDetailGraphQLServer } from "@/lib/api-server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserDetailTabs } from "@/components/dashboard/user-detail-tabs";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function roleBadgeVariant(
  role: string
): "default" | "secondary" | "destructive" {
  switch (role) {
    case "admin":
      return "destructive";
    case "member":
      return "default";
    default:
      return "secondary";
  }
}

// ---------------------------------------------------------------------------
// Dynamic metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const { user } = await fetchUserDetailGraphQLServer(id);
    return { title: user.name };
  } catch {
    return { title: "User Not Found" };
  }
}

// ---------------------------------------------------------------------------
// User detail page (Server Component)
//
// Uses a single GraphQL query (UserDetail) to fetch the user together with
// nested events (limit 20) and tasks (limit 50) in one request. This replaces
// the previous three separate REST calls (fetchUserServer, fetchEventsServer,
// fetchTasksServer). If the user fetch fails the page triggers the Next.js
// not-found boundary. All fetched data is passed down to the
// `UserDetailTabs` client component which handles tab switching interactivity.
// ---------------------------------------------------------------------------

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Single GraphQL query: user + nested events + tasks
  let user;
  let events;
  let tasks;
  try {
    const result = await fetchUserDetailGraphQLServer(id);
    user = result.user;
    events = result.events;
    tasks = result.tasks;
  } catch {
    notFound();
  }

  // Compute stats
  const taskCount = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/dashboard/users">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>
      </Button>

      {/* User header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-20 w-20">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.name} />
          ) : null}
          <AvatarFallback className="text-xl">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
            <Badge variant="outline">
              {user.plan}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {user.email}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Recent Events
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {events.length.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last Seen</span>
            </div>
            <p className="mt-1 text-lg font-semibold">
              {formatDistanceToNow(new Date(user.lastSeen), {
                addSuffix: true,
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Member Since
              </span>
            </div>
            <p className="mt-1 text-lg font-semibold">
              {format(new Date(user.createdAt), "MMM yyyy")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Tasks Assigned
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {taskCount}
              {taskCount > 0 && (
                <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                  ({completedTasks} done)
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Tabs (client component for interactivity) */}
      <UserDetailTabs
        user={user}
        events={events}
        tasks={tasks}
        taskCount={taskCount}
      />
    </div>
  );
}
