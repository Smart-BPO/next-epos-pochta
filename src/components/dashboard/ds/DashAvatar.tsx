"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

function initialsFromName(name?: string | null) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function DashAvatar({
  name,
  photoUrl,
  telegramUserId,
  size = 40,
  className,
}: {
  name?: string | null;
  photoUrl?: string | null;
  telegramUserId?: number | null;
  size?: number;
  className?: string;
}) {
  const proxy =
    telegramUserId && telegramUserId > 0
      ? `/api/dashboard/telegram-avatar/${telegramUserId}/`
      : null;
  const [src, setSrc] = useState<string | null>(
    () => (photoUrl && photoUrl.trim()) || proxy,
  );
  const [failed, setFailed] = useState(false);
  const initials = initialsFromName(name);

  if (!src || failed) {
    return (
      <span
        className={cn(
          "inline-grid shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary",
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-full object-cover bg-black/[0.04]",
        className,
      )}
      style={{ width: size, height: size }}
      onError={() => {
        if (src === photoUrl && proxy) {
          setSrc(proxy);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
