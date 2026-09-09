"use client";

import { useState } from "react";
import { dashInput } from "@/styles/dashboard";
import { cn } from "@/lib/cn";

export function NewsTagsInput({
  name = "tags",
  defaultTags = [],
}: {
  name?: string;
  defaultTags?: string[];
}) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const next = raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (!next.length) return;
    setTags((prev) => [...new Set([...prev, ...next])]);
    setDraft("");
  };

  return (
    <div className="grid gap-2">
      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-black/40">
        Tags
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="rounded-lg bg-black/[0.05] px-2 py-1 text-xs font-medium text-black/65"
            onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
            title="Удалить"
          >
            {tag} ×
          </button>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          }
        }}
        onBlur={() => add(draft)}
        placeholder="tag + Enter"
        className={cn(dashInput)}
      />
      <input type="hidden" name={name} value={tags.join(",")} />
    </div>
  );
}
