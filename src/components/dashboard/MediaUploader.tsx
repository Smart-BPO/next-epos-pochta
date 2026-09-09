"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { dashInput } from "@/styles/dashboard";
import { toast } from "react-toastify";

type MediaUploaderProps = {
  onUploaded?: (result: { path: string; url: string }) => void;
  name?: string;
  defaultUrl?: string;
  accept?: string;
};

export function MediaUploader({
  onUploaded,
  name,
  defaultUrl = "",
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
}: MediaUploaderProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState(defaultUrl);
  const [error, setError] = useState("");

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
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
      setUrl(json.url);
      onUploaded?.({ path: json.path, url: json.url });
      toast.success("Файл загружен");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "upload_failed";
      setError(msg);
      toast.error("Не удалось загрузить");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-2">
      <label className="grid min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">
        Загрузить изображение
        <input
          type="file"
          accept={accept}
          disabled={busy}
          onChange={onChange}
          className="text-sm font-normal normal-case"
        />
      </label>
      {busy ? <p className="m-0 text-xs text-black/45">Загрузка…</p> : null}
      {error ? (
        <p className="m-0 text-xs text-primary" role="alert">
          {error}
        </p>
      ) : null}
      {name ? (
        <input
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/media/covers/…"
          className={dashInput}
        />
      ) : url ? (
        <p className="m-0 break-all font-mono text-[0.7rem] text-black/55">
          {url}
        </p>
      ) : null}
    </div>
  );
}
