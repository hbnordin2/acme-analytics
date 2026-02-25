import { NextRequest, NextResponse } from "next/server";
import { fetchUserServer } from "@/lib/api-server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await fetchUserServer(id);
  return NextResponse.json(data);
}
