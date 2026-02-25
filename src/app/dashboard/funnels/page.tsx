import { fetchFunnelsGraphQLServer } from "@/lib/api-server";
import { FunnelsPageClient } from "@/components/dashboard/funnels-page-client";

// ---------------------------------------------------------------------------
// Funnel analysis page (Server Component)
// This page fetches funnel data via GraphQL (port 4011) instead of REST.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export const metadata = { title: "Funnel Analysis" };

export default async function FunnelsPage() {
  const funnels = await fetchFunnelsGraphQLServer();
  return <FunnelsPageClient funnels={funnels} />;
}
