import { NextResponse } from "next/server";
import { POST as leadsPost, GET as leadsGet } from "@/app/api/leads/route";

/** Resume helpers — same handlers as /api/leads?uid= / mode update. */
export async function GET(request: Request) {
  return leadsGet(request);
}

export async function PATCH(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const rewritten = new Request(request.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      type: "price",
      mode: "update",
    }),
  });
  return leadsPost(rewritten);
}
