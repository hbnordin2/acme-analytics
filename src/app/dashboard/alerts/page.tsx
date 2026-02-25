import { fetchAlertsServer } from "@/lib/api-server";
import { AlertsPageClient } from "@/components/dashboard/alerts-page-client";

// ---------------------------------------------------------------------------
// Alert rules page (Server Component)
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export const metadata = { title: "Alert Rules" };

export default async function AlertsPage() {
  const alerts = await fetchAlertsServer();
  return <AlertsPageClient alerts={alerts} />;
}
