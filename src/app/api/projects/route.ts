import { NextResponse } from "next/server";
import { fetchProjectsServer } from "@/lib/api-server";

export async function GET() {
  const data = await fetchProjectsServer();
  return NextResponse.json(data);
}
