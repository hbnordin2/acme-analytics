import {
  fetchUsersServer,
  fetchWorkspaceServer,
  fetchApiKeysServer,
  fetchNotificationPreferencesServer,
} from "@/lib/api-server";
import { SettingsPageClient } from "@/components/dashboard/settings-page-client";

// ---------------------------------------------------------------------------
// Settings page (Server Component)
//
// Fetches workspace settings, team members, API keys, notification prefs,
// and billing data server-side for immediate hydration.
// ---------------------------------------------------------------------------

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [teamData, workspaceData, apiKeys, notificationPrefs] =
    await Promise.all([
      fetchUsersServer({ limit: 10 }),
      fetchWorkspaceServer(),
      fetchApiKeysServer(),
      fetchNotificationPreferencesServer(),
    ]);

  return (
    <SettingsPageClient
      initialTeamMembers={teamData.data ?? []}
      initialWorkspace={workspaceData}
      initialApiKeys={apiKeys}
      initialNotificationPrefs={notificationPrefs}
    />
  );
}
