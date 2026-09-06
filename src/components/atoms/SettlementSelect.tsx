"use client";

import { useEffect, useMemo, useState } from "react";
import Select, { type ClassNamesConfig, type GroupBase } from "react-select";
import type { Locale } from "@/i18n/config";
import {
  getSettlementById,
  settlementLabel,
  uzbekistanHubSettlements,
  uzbekistanSettlements,
  type Settlement,
  type SettlementLevel,
} from "@/data/settlements";
import { cn } from "@/lib/cn";

export type SettlementOption = {
  value: string;
  label: string;
  level: SettlementLevel;
  regionLabel: string;
  searchText: string;
};

type SettlementSelectProps = {
  id?: string;
  instanceId: string;
  locale: Locale;
  value: string;
  onChange: (settlementId: string) => void;
  placeholder: string;
  className?: string;
  isClearable?: boolean;
  /** Compact island / toolbar styling. */
  variant?: "default" | "compact";
};

const LEVEL_ORDER: Record<SettlementLevel, number> = {
  city: 0,
  region: 1,
  district: 2,
};

function levelBadge(level: SettlementLevel, locale: Locale) {
  if (locale === "uz") {
    if (level === "city") return "shahar";
    if (level === "district") return "tuman";
    return "viloyat";
  }
  if (level === "city") return "город";
  if (level === "district") return "район";
  return "область";
}

function hubsHeading(locale: Locale) {
  return locale === "uz" ? "Yirik shaharlar" : "Крупные города";
}

function toOption(settlement: Settlement, locale: Locale): SettlementOption {
  const label = settlementLabel(settlement, locale);
  const regionLabel =
    locale === "uz" ? settlement.regionUz : settlement.regionRu;
  return {
    value: settlement.id,
    label,
    level: settlement.level,
    regionLabel,
    searchText: [
      settlement.ru,
      settlement.uz,
      settlement.regionRu,
      settlement.regionUz,
      settlement.id,
    ]
      .join(" ")
      .toLowerCase(),
  };
}

/** Prefer exact / prefix city matches when typing «Ташкент». */
function matchRank(option: SettlementOption, q: string): number {
  const label = option.label.toLowerCase();
  const exact = label === q ? 0 : 1;
  const prefix = label.startsWith(q) ? 0 : 1;
  const level = LEVEL_ORDER[option.level];
  return exact * 1000 + prefix * 100 + level;
}

const defaultClassNames: ClassNamesConfig<
  SettlementOption,
  false,
  GroupBase<SettlementOption>
> = {
  control: ({ isFocused }) =>
    cn(
      "min-h-11 rounded-xl border bg-white px-1 text-sm text-ink shadow-none! sm:min-h-[var(--tap-min)] sm:text-base",
      isFocused
        ? "border-primary ring-2 ring-primary/15"
        : "border-black/15",
    ),
  valueContainer: () => "px-2.5 py-1.5 sm:py-2",
  placeholder: () => "text-black/40",
  singleValue: () => "text-ink",
  input: () => "text-ink",
  indicatorSeparator: () => "hidden",
  dropdownIndicator: () => "text-black/40 px-2",
  clearIndicator: () => "text-black/35 hover:text-black/60 px-1",
  menu: () =>
    "mt-1 rounded-xl border border-black/12 bg-white shadow-[0_12px_32px_rgb(15_18_24/0.12)] overflow-hidden z-50",
  menuList: () => "max-h-72 py-1",
  option: ({ isFocused, isSelected }) =>
    cn(
      "cursor-pointer px-3 py-2.5 text-sm",
      isSelected && "bg-primary-soft text-primary",
      !isSelected && isFocused && "bg-black/[0.04]",
      !isSelected && !isFocused && "bg-white text-ink",
    ),
  groupHeading: () =>
    "px-3 pt-2.5 pb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-black/45",
  noOptionsMessage: () => "px-3 py-3 text-sm text-black/50",
};

const compactClassNames: ClassNamesConfig<
  SettlementOption,
  false,
  GroupBase<SettlementOption>
> = {
  ...defaultClassNames,
  control: ({ isFocused }) =>
    cn(
      "min-h-10 rounded-xl border bg-white px-0.5 text-xs text-ink shadow-none! sm:min-h-12 sm:text-base",
      isFocused
        ? "border-primary ring-2 ring-primary/15"
        : "border-black/15",
    ),
  valueContainer: () => "gap-0.5 px-2 py-1 sm:px-3 sm:py-1.5",
  singleValue: () => "truncate text-ink",
  placeholder: () => "truncate text-black/40",
  dropdownIndicator: () => "text-black/40 px-1 sm:px-2",
  clearIndicator: () => "text-black/35 hover:text-black/60 px-0.5 sm:px-1",
};

export function SettlementSelect({
  id,
  instanceId,
  locale,
  value,
  onChange,
  placeholder,
  className,
  isClearable = true,
  variant = "default",
}: SettlementSelectProps) {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = useMemo(() => {
    const hubIds = new Set(uzbekistanHubSettlements.map((s) => s.id));
    const hubOptions = uzbekistanHubSettlements.map((s) =>
      toOption(s, locale),
    );

    const byRegion = new Map<string, SettlementOption[]>();
    const rest = uzbekistanSettlements.filter((s) => !hubIds.has(s.id));

    const sorted = [...rest].sort((a, b) => {
      const regionCmp = a.regionId.localeCompare(b.regionId);
      if (regionCmp !== 0) return regionCmp;
      const levelCmp = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
      if (levelCmp !== 0) return levelCmp;
      return settlementLabel(a, locale).localeCompare(
        settlementLabel(b, locale),
        locale === "uz" ? "uz" : "ru",
      );
    });

    for (const settlement of sorted) {
      const option = toOption(settlement, locale);
      const groupKey =
        locale === "uz" ? settlement.regionUz : settlement.regionRu;
      const list = byRegion.get(groupKey) ?? [];
      list.push(option);
      byRegion.set(groupKey, list);
    }

    const regionGroups = [...byRegion.entries()].map(([label, groupOptions]) => ({
      label,
      options: groupOptions,
    }));

    return [
      { label: hubsHeading(locale), options: hubOptions },
      ...regionGroups,
    ];
  }, [locale]);

  const rankedOptions = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return options;

    return options
      .map((group) => ({
        ...group,
        options: [...group.options]
          .filter((opt) => opt.searchText.includes(q) || opt.label.toLowerCase().includes(q))
          .sort((a, b) => matchRank(a, q) - matchRank(b, q)),
      }))
      .filter((group) => group.options.length > 0);
  }, [options, inputValue]);

  const selected = useMemo(() => {
    if (!value) return null;
    const settlement = getSettlementById(value);
    return settlement ? toOption(settlement, locale) : null;
  }, [value, locale]);

  const shellClass =
    variant === "compact"
      ? "flex min-h-10 items-center rounded-xl border border-black/15 bg-white px-2.5 text-xs text-black/40 sm:min-h-12 sm:px-3.5 sm:text-base"
      : "flex min-h-11 items-center rounded-xl border border-black/15 bg-white px-3.5 text-sm text-black/40 sm:min-h-[var(--tap-min)] sm:px-4 sm:text-base";

  if (!mounted) {
    return (
      <div className={cn("min-w-0", className)}>
        <div className={shellClass} aria-hidden>
          {selected?.label ?? placeholder}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <Select<SettlementOption, false, GroupBase<SettlementOption>>
        inputId={id}
        instanceId={instanceId}
        options={rankedOptions}
        value={selected}
        onChange={(opt) => onChange(opt?.value ?? "")}
        onInputChange={(next, meta) => {
          if (meta.action === "input-change" || meta.action === "set-value") {
            setInputValue(next);
          }
          if (meta.action === "menu-close" || meta.action === "input-blur") {
            setInputValue("");
          }
          return next;
        }}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable
        filterOption={() => true}
        unstyled
        classNames={variant === "compact" ? compactClassNames : defaultClassNames}
        formatOptionLabel={(option) => (
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-medium">{option.label}</span>
            <span className="truncate text-xs text-black/45">
              {levelBadge(option.level, locale)}
              {option.level !== "region" ? ` · ${option.regionLabel}` : ""}
            </span>
          </span>
        )}
        noOptionsMessage={() =>
          locale === "uz" ? "Topilmadi" : "Ничего не найдено"
        }
      />
    </div>
  );
}
