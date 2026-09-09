"use client";

import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/cn";
import { dashBtnSecondary, dashInput } from "@/styles/dashboard";

type DashImageFieldProps = {
  name: string;
  label?: string;
  defaultUrl?: string;
  folder?: string;
  className?: string;
};

export function DashImageField({
  name,
  label = "Изображение",
  defaultUrl = "",
  folder = "covers",
  className,
}: DashImageFieldProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [busy, setBusy] = useState(false);
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
          url?: string;
          error?: string;
        };
        if (!res.ok || !json.url) {
          throw new Error(json.error || "upload_failed");
        }
        setUrl(json.url);
        toast.success("Файл загружен");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Не удалось загрузить");
      } finally {
        setBusy(false);
      }
    },
    [folder],
  );

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await uploadFile(file);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-black/40">
        {label}
      </p>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed border-black/15 bg-[#fafbfc] transition",
          dragOver ? "border-primary bg-primary-soft/40" : "",
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
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="mx-auto max-h-48 w-full object-contain p-3"
          />
        ) : (
          <div className="grid place-items-center px-4 py-10 text-center text-sm text-black/45">
            Перетащите изображение или выберите файл
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className={cn(dashBtnSecondary, "cursor-pointer")}>
          {busy ? "Загрузка…" : url ? "Заменить" : "Выбрать"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            disabled={busy}
            onChange={onPick}
            className="sr-only"
          />
        </label>
        {url ? (
          <button
            type="button"
            className={dashBtnSecondary}
            onClick={() => setUrl("")}
          >
            Очистить
          </button>
        ) : null}
      </div>
      <input
        type="hidden"
        name={name}
        value={url}
        onChange={() => undefined}
      />
      {url ? (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={cn(dashInput, "font-mono text-xs")}
          aria-label="URL изображения"
        />
      ) : null}
    </div>
  );
}
