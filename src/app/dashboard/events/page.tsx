import { fetchEventsServer } from "@/lib/api-server";
import { EventsPageClient } from "@/components/dashboard/events-page-client";

// ---------------------------------------------------------------------------
// Events explorer page (Server Component)
//
// Reads searchParams from the URL to determine the initial page and event
// name filter, fetches events server-side, and hands the data to the client
// component for rendering + subsequent client-side interactions.
// ---------------------------------------------------------------------------

export const metadata = { title: "Events Explorer" };

const PAGE_SIZE = 20;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; event_name?: string }>;
}) {
  const { page: pageParam, event_name } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const eventFilter = event_name ?? "all";

  const initialData = await fetchEventsServer({
    page,
    limit: PAGE_SIZE,
    ...(eventFilter !== "all" ? { event_name: eventFilter } : {}),
  });

  return (
    <EventsPageClient
      initialData={initialData}
      initialPage={page}
      initialFilter={eventFilter}
    />
  );
}
