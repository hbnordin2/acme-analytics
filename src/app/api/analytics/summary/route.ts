import { NextResponse } from "next/server";
import { fetchAnalyticsSummaryServer } from "@/lib/api-server";

export async function GET() {
  const data = await fetchAnalyticsSummaryServer();
  return NextResponse.json(data);
}
