"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { cn } from "@/lib/cn";
import {
  MEDIA_FOLDERS,
  type MediaFolder,
} from "@/lib/cms/media-folders";
import { dashBtnSecondary, dashCard, dashSelect } from "@/styles/dashboard";

type MediaUploaderProps = {
  onUploaded?: (result: { path: string; url: string; folder: MediaFolder }) => void;
  defaultFolder?: MediaFolder;
  accept?: string;
};

export function MediaUploader({
  onUploaded,
  defaultFolder = "news/covers",
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
}: MediaUploaderProps) {
  const t = useDashT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [folder, setFolder] = useState<MediaFolder>(defaultFolder);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", folder);
        const res = await fetch("/api/dashboard/media/upload/", {
          method: "POST",
          body,
        });
        const json = (await res.json()) as {
          ok?: boolean;
          path?: string;
          url?: string;
          error?: string;
        };
        if (!res.ok || !json.url || !json.path) {
          throw new Error(json.error || "upload_failed");
        }
        onUploaded?.({ path: json.path, url: json.url, folder });
        toast.success(t.media.uploaded);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t.media.uploadFailed,
        );
      } finally {
        setBusy(false);
      }
    },
    [folder, onUploaded, router, t.media.uploadFailed, t.media.uploaded],
  );

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await uploadFile(file);
  };

  return (
    <div className={`${dashCard} space-y-4 p-5`}>
      <div>
        <p className="m-0 text-sm font-semibold text-ink">{t.media.uploadTitle}</p>
        <p className="m-0 mt-1 text-xs text-black/45">{t.media.uploadHint}</p>
      </div>

      <label className="grid min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
        {t.media.folder}
        <select
          value={folder}
          disabled={busy}
          onChange={(e) => setFolder(e.target.value as MediaFolder)}
          className={cn(dashSelect, "font-normal normal-case")}
        >
          {MEDIA_FOLDERS.map((id) => (
            <option key={id} value={id}>
              {t.media.folders[id]}
            </option>
          ))}
        </select>
      </label>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed border-black/15 bg-[#fafbfc] transition",
          dragOver ? "border-primary bg-primary-soft/40" : "",
          busy ? "opacity-60" : "",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void uploadFile(file);
        }}
      >
        <div className="grid place-items-center gap-3 px-4 py-10 text-center">
          <p className="m-0 text-sm text-black/45">
            {busy ? t.media.uploading : t.media.uploadHint}
          </p>
          <label className={cn(dashBtnSecondary, "cursor-pointer")}>
            {t.media.chooseFile}
            <input
              type="file"
              accept={accept}
              disabled={busy}
              onChange={onPick}
              className="sr-only"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
