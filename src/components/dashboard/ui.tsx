import { cn } from "@/lib/cn";
import {
  dashBadgeBase,
  dashBtnPrimary,
  dashBtnSecondary,
  dashCard,
  dashCardPad,
  dashInput,
  dashPageLead,
  dashPageTitle,
  dashSelect,
} from "@/styles/dashboard";

export function DashPageHeader({
  title,
  lead,
  actions,
}: {
  title: string;
  lead?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className={dashPageTitle}>{title}</h1>
        {lead ? <p className={dashPageLead}>{lead}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function DashBreadcrumbs({
  items,
}: {
  items: Array<{ href?: string; label: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2 text-sm text-black/45">
      <ol className="m-0 flex flex-wrap items-center gap-1.5 p-0 list-none">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1.5">
            {i > 0 ? <span className="text-black/25">/</span> : null}
            {item.href ? (
              <a href={item.href} className="font-medium text-primary hover:underline">
                {item.label}
              </a>
            ) : (
              <span className="font-medium text-black/60">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function DashTableShell({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(dashCard, className)}>
      {title || action ? (
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
          {title ? (
            <h2 className="m-0 text-[0.95rem] font-semibold tracking-[-0.01em] text-ink">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

export function DashTable({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-left text-sm">{children}</table>;
}

export function DashTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "min-w-0 px-3 py-3 text-[0.7rem] font-semibold uppercase tracking-wide text-black/35 first:pl-5 last:pr-5",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function DashTd({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "min-w-0 border-t border-black/[0.05] px-3 py-3.5 first:pl-5 last:pr-5",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function DashEmptyState({
  title,
  lead,
  action,
  icon,
}: {
  title: string;
  lead?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon ? <div className="mb-3 text-black/25">{icon}</div> : null}
      <p className="m-0 text-sm font-semibold text-ink">{title}</p>
      {lead ? <p className="m-0 mt-1 max-w-sm text-sm text-black/45">{lead}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function DashFilterPills({
  items,
}: {
  items: Array<{ href: string; label: string; active?: boolean }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <a
          key={item.href + item.label}
          href={item.href}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            item.active
              ? "border-primary/30 bg-primary-soft text-primary"
              : "border-black/10 bg-white text-black/55 hover:border-black/20",
          )}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}

export function DashAlert({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "m-0 rounded-xl px-3 py-2.5 text-sm",
        tone === "error" && "bg-primary-soft text-primary",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "info" && "bg-black/[0.04] text-black/70",
      )}
    >
      {children}
    </p>
  );
}

export function DashFormField({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="grid min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40"
    >
      {label}
      <span className="block min-w-0 max-w-full font-normal normal-case">
        {children}
      </span>
    </label>
  );
}

export { dashBtnPrimary, dashBtnSecondary, dashInput, dashSelect, dashBadgeBase, dashCard, dashCardPad };
