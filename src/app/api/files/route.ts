import { NextRequest, NextResponse } from "next/server";
import { fetchFilesServer } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const data = await fetchFilesServer(params);
  return NextResponse.json(data);
}
