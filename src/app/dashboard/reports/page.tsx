import { fetchReportsServer } from "@/lib/api-server";
import { ReportsPageClient } from "@/components/dashboard/reports-page-client";

// ---------------------------------------------------------------------------
// Reports page (Server Component)
// ---------------------------------------------------------------------------

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const reports = await fetchReportsServer();
  return <ReportsPageClient reports={reports} />;
}
