import { fetchUsersServer } from "@/lib/api-server";
import { UsersPageClient } from "@/components/dashboard/users-page-client";

// ---------------------------------------------------------------------------
// Users list page (Server Component)
//
// Reads searchParams from the URL to determine the initial page and search
// query, fetches users server-side, and hands the data to the client
// component for rendering + subsequent client-side interactions.
// ---------------------------------------------------------------------------

export const metadata = { title: "Users" };

const PAGE_SIZE = 15;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page: pageParam, search } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const initialData = await fetchUsersServer({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
  });

  return (
    <UsersPageClient
      initialData={initialData}
      initialPage={page}
      initialSearch={search ?? ""}
    />
  );
}
