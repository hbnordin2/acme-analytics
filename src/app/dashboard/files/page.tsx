import { fetchFilesServer } from "@/lib/api-server";
import { FilesPageClient } from "@/components/dashboard/files-page-client";

// ---------------------------------------------------------------------------
// Files page (Server Component)
//
// Reads searchParams from the URL to determine the initial parent folder,
// fetches files server-side, and hands the data to the client component
// for rendering + subsequent client-side interactions.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export const metadata = { title: "Files" };

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<{ parent_id?: string }>;
}) {
  const { parent_id } = await searchParams;

  const initialData = await fetchFilesServer({
    ...(parent_id ? { parent_id } : {}),
  });

  return (
    <FilesPageClient
      initialData={initialData}
      initialParentId={parent_id ?? null}
    />
  );
}
