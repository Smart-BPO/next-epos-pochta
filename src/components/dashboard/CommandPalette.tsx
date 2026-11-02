"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDashT } from "@/components/dashboard/DashLocaleProvider";
import { DASHBOARD_NAV } from "@/components/dashboard/nav";
import { DashKbd } from "@/components/dashboard/ds/DashKbd";
import { DashModal } from "@/components/dashboard/ds/DashModal";
import { canAccess, type AdminUser } from "@/lib/cms/auth-shared";
import { cn } from "@/lib/cn";
import { dashInput } from "@/styles/dashboard";

type CommandItem = {
  id: string;
  group: "nav" | "actions";
  label: string;
  href?: string;
  run?: () => void;
  keywords?: string;
};

export function CommandPalette({ admin }: { admin: AdminUser }) {
  const t = useDashT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [queryEpoch, setQueryEpoch] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !meta) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
          return;
        }
        e.preventDefault();
        setOpen(true);
      }
      if (!open && e.key.toLowerCase() === "g") {
        // simple g then letter shortcuts handled below via sequential buffer
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    let prev = "";
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const key = e.key.toLowerCase();
      if (prev === "g") {
        if (key === "l") {
          e.preventDefault();
          router.push("/dashboard/leads/");
        } else if (key === "u") {
          e.preventDefault();
          router.push("/dashboard/webapp/contacts/");
        } else if (key === "o") {
          e.preventDefault();
          router.push("/dashboard/");
        } else if (key === "s") {
          e.preventDefault();
          router.push("/dashboard/webapp/shipments/");
        }
        prev = "";
        return;
      }
      if (key === "g") prev = "g";
      else prev = "";
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, router]);

  const items = useMemo<CommandItem[]>(() => {
    const nav: CommandItem[] = DASHBOARD_NAV.filter((item) =>
      canAccess(admin.role, item.area),
    ).map((item) => ({
      id: `nav-${item.href}`,
      group: "nav",
      label: t.nav[item.labelKey],
      href: item.href,
      keywords: item.href,
    }));

    const actions: CommandItem[] = [
      {
        id: "action-news",
        group: "actions",
        label: t.news.newArticle,
        href: "/dashboard/news/new/",
      },
      {
        id: "action-fcargo",
        group: "actions",
        label: t.nav.fcargo,
        href: "/dashboard/settings/fcargo/",
      },
    ];

    const all = [...nav, ...actions];
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((item) =>
      `${item.label} ${item.keywords ?? ""} ${item.href ?? ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [admin.role, q, t]);

  const safeActive =
    items.length === 0 ? 0 : Math.min(active, items.length - 1);

  function run(item: CommandItem) {
    setOpen(false);
    setQ("");
    if (item.run) item.run();
    else if (item.href) router.push(item.href);
  }

  return (
    <>
      <button
        type="button"
        className="hidden h-9 items-center gap-2 rounded-xl border border-[var(--dash-border-strong)] bg-[var(--dash-surface)] px-3 text-xs font-semibold text-[var(--dash-muted)] transition hover:border-black/20 hover:text-[var(--dash-ink)] md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Search className="size-3.5" strokeWidth={1.75} aria-hidden />
        {t.common.commandPalette}
        <span className="ml-2 inline-flex gap-1">
          <DashKbd>⌘</DashKbd>
          <DashKbd>K</DashKbd>
        </span>
      </button>

      <DashModal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQ("");
        }}
        title={t.common.commandPalette}
        size="md"
        closeLabel={t.common.close}
      >
        <div className="space-y-3">
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
              setQueryEpoch((n) => n + 1);
            }}
            placeholder={t.common.commandPlaceholder}
            className={dashInput}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(items.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter" && items[safeActive]) {
                e.preventDefault();
                run(items[safeActive]);
              }
            }}
          />
          <div className="max-h-72 overflow-y-auto" key={queryEpoch}>
            {items.length === 0 ? (
              <p className="m-0 px-2 py-6 text-center text-sm text-[var(--dash-muted)]">
                {t.common.commandEmpty}
              </p>
            ) : (
              <ul className="m-0 grid list-none gap-1 p-0">
                {items.map((item, i) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition",
                        i === safeActive
                          ? "bg-primary-soft text-primary"
                          : "hover:bg-black/[0.03]",
                      )}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(item)}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-[0.65rem] uppercase tracking-wide text-[var(--dash-faint)]">
                        {item.group === "nav"
                          ? t.common.commandNav
                          : t.common.commandActions}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DashModal>
    </>
  );
}
