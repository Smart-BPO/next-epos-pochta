import { NextResponse } from "next/server";
import { requireMutationApi, writeAuditLog } from "@/lib/cms/auth";
import { deleteMediaPath } from "@/lib/cms/media";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const admin = await requireMutationApi("media");
    const body = (await request.json()) as { path?: string };
    const path = typeof body.path === "string" ? body.path.trim() : "";
    if (!path) {
      return NextResponse.json({ error: "path_required" }, { status: 400 });
    }

    await deleteMediaPath(path);

    await writeAuditLog({
      actor: admin,
      action: "media.delete",
      entityType: "storage",
      entityId: path,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    const status =
      message === "Forbidden"
        ? 403
        : message === "Unauthorized"
          ? 401
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
