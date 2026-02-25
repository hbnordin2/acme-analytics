"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Plus,
  Key,
  CreditCard,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  User,
  WorkspaceData,
  ApiKeyItem,
  NotificationPreferences,
} from "@/types";

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

function formatCentsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

// ---------------------------------------------------------------------------
// Settings client component
// ---------------------------------------------------------------------------

interface SettingsPageClientProps {
  initialTeamMembers: User[];
  initialWorkspace: WorkspaceData;
  initialApiKeys: ApiKeyItem[];
  initialNotificationPrefs: NotificationPreferences;
}

export function SettingsPageClient({
  initialTeamMembers,
  initialWorkspace,
  initialApiKeys,
  initialNotificationPrefs,
}: SettingsPageClientProps) {
  // ---- General tab state ----
  const [workspaceName, setWorkspaceName] = useState(
    initialWorkspace.workspace.name
  );
  const [timezone, setTimezone] = useState(
    initialWorkspace.workspace.timezone
  );
  const [dateFormat, setDateFormat] = useState(
    initialWorkspace.workspace.dateFormat
  );

  // ---- Team tab ----
  const teamMembers = initialTeamMembers;

  // ---- Billing ----
  const { billing } = initialWorkspace;
  const usageEvents = billing.usageEvents;
  const usageLimit = billing.usageLimit;
  const usagePercent = usageLimit > 0 ? (usageEvents / usageLimit) * 100 : 0;

  // ---- API Keys tab state ----
  const [apiKeys] = useState(initialApiKeys);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);

  const handleCopyKey = (apiKey: ApiKeyItem) => {
    navigator.clipboard.writeText(apiKey.keyPrefix).catch(() => {
      // clipboard API might fail in non-HTTPS contexts
    });
    setCopiedKeyId(apiKey.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // ---- Notifications tab state ----
  const [notifications, setNotifications] = useState({
    email: initialNotificationPrefs.emailEnabled,
    slack: initialNotificationPrefs.slackEnabled,
    weeklyDigest: initialNotificationPrefs.weeklyDigest,
    alertNotifications: initialNotificationPrefs.alertNotifications,
    marketing: initialNotificationPrefs.marketing,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace, team, billing, and API configuration.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* ==================================================================
            GENERAL TAB
        ================================================================== */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>
                Configure your workspace name, timezone, and display
                preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-md space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>

              <div className="max-w-md space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">
                      Eastern Time (ET)
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time (CT)
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time (MT)
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time (PT)
                    </SelectItem>
                    <SelectItem value="Europe/London">
                      London (GMT/BST)
                    </SelectItem>
                    <SelectItem value="Europe/Berlin">
                      Berlin (CET/CEST)
                    </SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    <SelectItem value="Asia/Kuala_Lumpur">
                      Kuala Lumpur (MYT)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="max-w-md space-y-2">
                <Label>Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MMM d, yyyy">
                      Feb 24, 2026
                    </SelectItem>
                    <SelectItem value="dd/MM/yyyy">24/02/2026</SelectItem>
                    <SelectItem value="yyyy-MM-dd">2026-02-24</SelectItem>
                    <SelectItem value="MM/dd/yyyy">02/24/2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================================================================
            TEAM TAB
        ================================================================== */}
        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage who has access to this workspace.
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="pr-6 text-right">
                      Joined
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {member.avatarUrl ? (
                              <AvatarImage
                                src={member.avatarUrl}
                                alt={member.name}
                              />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.role === "admin"
                              ? "destructive"
                              : member.role === "member"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                        {format(new Date(member.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================================================================
            BILLING TAB
        ================================================================== */}
        <TabsContent value="billing">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Current plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Current Plan
                  <Badge>{billing.plan}</Badge>
                </CardTitle>
                <CardDescription>
                  You&apos;re on the {billing.plan} plan at $
                  {formatCentsToDollars(billing.monthlyAmount)}/month.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Events this month
                    </span>
                    <span className="font-medium tabular-nums">
                      {usageEvents.toLocaleString()} /{" "}
                      {usageLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={usagePercent} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {(usageLimit - usageEvents).toLocaleString()} events
                    remaining this billing cycle.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Plan includes:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>&bull; {usageLimit.toLocaleString()} events/month</li>
                    <li>&bull; 5 team members</li>
                    <li>&bull; 90-day data retention</li>
                    <li>&bull; Custom dashboards</li>
                    <li>&bull; Email support</li>
                  </ul>
                </div>

                <Button className="w-full">Upgrade to Enterprise</Button>
              </CardContent>
            </Card>

            {/* Payment method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Manage your billing information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {billing.paymentMethodLast4 ? (
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-10 w-16 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-blue-800">
                      <span className="text-xs font-bold text-white">
                        {billing.paymentMethodType?.toUpperCase() ?? "CARD"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {billing.paymentMethodType
                          ? `${billing.paymentMethodType.charAt(0).toUpperCase()}${billing.paymentMethodType.slice(1)}`
                          : "Card"}{" "}
                        ending in {billing.paymentMethodLast4}
                      </p>
                      {billing.paymentMethodExpires && (
                        <p className="text-xs text-muted-foreground">
                          Expires {billing.paymentMethodExpires}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Default
                    </Badge>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No payment method on file.
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Next billing date
                    </span>
                    <span className="font-medium">
                      {format(
                        new Date(billing.nextBillingDate),
                        "MMMM d, yyyy"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Billing amount
                    </span>
                    <span className="font-medium">
                      ${formatCentsToDollars(billing.monthlyAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Update Payment
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================================================================
            API KEYS TAB
        ================================================================== */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Use API keys to authenticate requests to the Acme Analytics
                  API.
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create New Key
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Last Used
                    </TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="pl-6 font-medium">
                        {apiKey.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                            {visibleKeyId === apiKey.id
                              ? apiKey.keyPrefix + "••••••••"
                              : apiKey.keyPrefix.slice(0, 8) + "••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              setVisibleKeyId(
                                visibleKeyId === apiKey.id
                                  ? null
                                  : apiKey.id
                              )
                            }
                          >
                            {visibleKeyId === apiKey.id ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {format(new Date(apiKey.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {apiKey.lastUsedAt
                          ? format(
                              new Date(apiKey.lastUsedAt),
                              "MMM d 'at' h:mm a"
                            )
                          : "Never"}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyKey(apiKey)}
                          >
                            {copiedKeyId === apiKey.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 px-6 text-xs text-muted-foreground">
                <p>
                  API keys grant full access to your workspace data. Treat them
                  like passwords and never commit them to source control.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================================================================
            NOTIFICATIONS TAB
        ================================================================== */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(
                [
                  {
                    key: "email" as const,
                    label: "Email Notifications",
                    description:
                      "Receive email notifications for important events and alerts.",
                  },
                  {
                    key: "slack" as const,
                    label: "Slack Notifications",
                    description:
                      "Send notifications to your connected Slack workspace.",
                  },
                  {
                    key: "weeklyDigest" as const,
                    label: "Weekly Digest",
                    description:
                      "Receive a weekly summary of your analytics performance every Monday.",
                  },
                  {
                    key: "alertNotifications" as const,
                    label: "Alert Notifications",
                    description:
                      "Get notified when alert rules are triggered (as configured in Alerts).",
                  },
                  {
                    key: "marketing" as const,
                    label: "Marketing Emails",
                    description:
                      "Receive product updates, tips, and promotional emails from Acme.",
                  },
                ] as const
              ).map((item, idx) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        {item.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={() => toggleNotification(item.key)}
                    />
                  </div>
                  {idx < 4 && <Separator className="mt-6" />}
                </div>
              ))}

              <Separator />

              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
