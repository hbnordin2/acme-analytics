"use client";

import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnalyticsEvent, Task, User } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function taskStatusColor(status: string): string {
  switch (status) {
    case "done":
      return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30";
    case "in_progress":
      return "text-blue-600 bg-blue-50 dark:bg-blue-950/30";
    case "cancelled":
      return "text-zinc-500 bg-zinc-100 dark:bg-zinc-800";
    default:
      return "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
  }
}

function priorityBadgeVariant(
  priority: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case "P0":
      return "destructive";
    case "P1":
      return "default";
    case "P2":
      return "secondary";
    default:
      return "outline";
  }
}

// ---------------------------------------------------------------------------
// Event colors for the timeline
// ---------------------------------------------------------------------------

const eventColors: Record<string, string> = {
  pageview: "bg-blue-500",
  click: "bg-green-500",
  form_submit: "bg-purple-500",
  purchase: "bg-amber-500",
  signup: "bg-emerald-500",
  error: "bg-red-500",
};

function getEventColor(name: string): string {
  const key = Object.keys(eventColors).find((k) =>
    name.toLowerCase().includes(k)
  );
  return key ? eventColors[key] : "bg-muted-foreground";
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface UserDetailTabsProps {
  user: User;
  events: AnalyticsEvent[];
  tasks: Task[];
  taskCount: number;
}

// ---------------------------------------------------------------------------
// User detail tabs client component
//
// Handles tab switching (Activity / Tasks / Details) on the client.
// All data is passed in as props from the server component page.
// ---------------------------------------------------------------------------

export function UserDetailTabs({
  user,
  events,
  tasks,
  taskCount,
}: UserDetailTabsProps) {
  return (
    <Tabs defaultValue="activity" className="space-y-4">
      <TabsList>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>

      {/* ---- Activity tab ---- */}
      <TabsContent value="activity">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No activity recorded for this user.
              </p>
            ) : (
              <div className="relative space-y-0">
                {/* Timeline line */}
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />

                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className={cn(
                      "relative flex items-start gap-3 py-3",
                      index === 0 && "pt-0"
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background",
                        getEventColor(event.eventName)
                      )}
                    />
                    <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                      <Badge
                        variant="secondary"
                        className="w-fit text-[10px] uppercase"
                      >
                        {event.eventName}
                      </Badge>
                      <p className="truncate text-sm text-muted-foreground">
                        {event.pageUrl}
                      </p>
                      {Boolean(event.properties.browser) && (
                        <p className="text-xs text-muted-foreground">
                          {String(event.properties.browser)} &middot; {String(event.properties.os ?? "Unknown OS")}{" "}
                          &middot; {String(event.properties.country ?? "Unknown")}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {format(
                        new Date(event.timestamp),
                        "MMM d, h:mm a"
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ---- Tasks tab ---- */}
      <TabsContent value="tasks">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              Assigned Tasks
              <Badge variant="secondary" className="tabular-nums">
                {taskCount}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {tasks.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                No tasks assigned to this user.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Due Date
                    </TableHead>
                    <TableHead className="pr-6 text-right">
                      Updated
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="pl-6 font-medium">
                        {task.title}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            taskStatusColor(task.status)
                          )}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priorityBadgeVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {task.dueDate
                          ? format(new Date(task.dueDate), "MMM d, yyyy")
                          : "--"}
                      </TableCell>
                      <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(task.updatedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ---- Details tab ---- */}
      <TabsContent value="details">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Full Name
                </dt>
                <dd className="mt-1 text-sm">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Email Address
                </dt>
                <dd className="mt-1 text-sm">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Role
                </dt>
                <dd className="mt-1">
                  <Badge variant={roleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  User ID
                </dt>
                <dd className="mt-1 font-mono text-xs text-muted-foreground">
                  {user.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Created At
                </dt>
                <dd className="mt-1 text-sm">
                  {format(
                    new Date(user.createdAt),
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Last Seen
                </dt>
                <dd className="mt-1 text-sm">
                  {format(
                    new Date(user.lastSeen),
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Avatar URL
                </dt>
                <dd className="mt-1 truncate text-sm text-muted-foreground">
                  {user.avatarUrl ?? "Not set"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
