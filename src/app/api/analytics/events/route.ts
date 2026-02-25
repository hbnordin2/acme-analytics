import { NextRequest, NextResponse } from "next/server";
import { fetchEventsServer } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const data = await fetchEventsServer(params);
  return NextResponse.json(data);
}
