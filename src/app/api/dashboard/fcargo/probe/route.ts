import { NextResponse } from "next/server";
import { requireMutationApi } from "@/lib/cms/auth";
import { runFcargoDebugProbe } from "@/lib/fcargo/probe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CMS FCargo probes — Route Handler avoids Hostinger 404s on Server Action
 * POSTs to nested dashboard pages.
 */
export async function POST(request: Request) {
  try {
    await requireMutationApi("fcargo_secrets");
    const formData = await request.formData();
    const result = await runFcargoDebugProbe(formData);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "probe_failed";
    const status =
      message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 400;
    return NextResponse.json(
      {
        ok: false,
        probe: "error",
        elapsedMs: 0,
        message,
        data: null,
        meta: null,
      },
      { status },
    );
  }
}
