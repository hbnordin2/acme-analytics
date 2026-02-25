import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { fetchTasksServer } from "@/lib/api-server";
import { CACHE_TAGS } from "@/lib/cache-tags";

const REST_API_URL =
  process.env.REST_API_URL ?? process.env.NEXT_PUBLIC_REST_API_URL ?? "";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // Fetch tasks and find the one with the matching id
  const result = await fetchTasksServer();
  const task = result.data.find((t) => t.id === id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const response = await fetch(
    `${REST_API_URL}/api/tasks/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json(
      { error: error || response.statusText },
      { status: response.status },
    );
  }

  const updated = await response.json();

  revalidateTag(CACHE_TAGS.tasks, { expire: 0 });

  return NextResponse.json(updated);
}
