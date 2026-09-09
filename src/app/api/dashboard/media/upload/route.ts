import { NextResponse } from "next/server";
import { requireMutationApi, writeAuditLog } from "@/lib/cms/auth";
import { uploadMediaBuffer } from "@/lib/cms/media";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const admin = await requireMutationApi("media");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "file_required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadMediaBuffer({
      buffer,
      contentType: file.type || "application/octet-stream",
      fileName: file.name,
    });

    await writeAuditLog({
      actor: admin,
      action: "media.upload",
      entityType: "storage",
      entityId: result.path,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "upload_failed";
    const status =
      message === "Forbidden"
        ? 403
        : message === "Unauthorized"
          ? 401
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
