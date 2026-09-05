"use client";

import { useEffect, useMemo, useState } from "react";
import Select, { type ClassNamesConfig, type GroupBase } from "react-select";
import type { Locale } from "@/i18n/config";
import {
  getSettlementById,
  settlementLabel,
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
  district: 1,
  region: 2,
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

const defaultClassNames: ClassNamesConfig<
  SettlementOption,
  false,
  GroupBase<SettlementOption>
> = {
  control: ({ isFocused }) =>
    cn(
      "min-h-[var(--tap-min)] rounded-xl border bg-white px-1 text-base text-ink shadow-none!",
      isFocused
        ? "border-primary ring-2 ring-primary/20"
        : "border-black/30",
    ),
  valueContainer: () => "px-2.5 py-2",
  placeholder: () => "text-black/40",
  singleValue: () => "text-ink",
  input: () => "text-ink",
  indicatorSeparator: () => "hidden",
  dropdownIndicator: () => "text-black/40 px-2",
  clearIndicator: () => "text-black/35 hover:text-black/60 px-1",
  menu: () =>
    "mt-1 rounded-xl border border-black/15 bg-white shadow-[0_12px_32px_rgb(15_18_24/0.12)] overflow-hidden z-50",
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
      "min-h-12 rounded-xl border bg-white px-0.5 text-base text-ink shadow-none!",
      isFocused
        ? "border-primary ring-2 ring-primary/20"
        : "border-black/20",
    ),
  valueContainer: () => "px-3 py-1.5",
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
  useEffect(() => {
    setMounted(true);
  }, []);

  const options = useMemo(() => {
    const byRegion = new Map<string, SettlementOption[]>();

    const sorted = [...uzbekistanSettlements].sort((a, b) => {
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

    return [...byRegion.entries()].map(([label, groupOptions]) => ({
      label,
      options: groupOptions,
    }));
  }, [locale]);

  const selected = useMemo(() => {
    if (!value) return null;
    const settlement = getSettlementById(value);
    return settlement ? toOption(settlement, locale) : null;
  }, [value, locale]);

  const shellClass =
    variant === "compact"
      ? "flex min-h-12 items-center rounded-xl border border-black/20 bg-white px-3.5 text-base text-black/40"
      : "flex min-h-[var(--tap-min)] items-center rounded-xl border border-black/30 bg-white px-4 text-base text-black/40";

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
      <Select<SettlementOption, false>
        inputId={id}
        instanceId={instanceId}
        options={options}
        value={selected}
        onChange={(opt) => onChange(opt?.value ?? "")}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable
        filterOption={(option, raw) => {
          const q = raw.trim().toLowerCase();
          if (!q) return true;
          return option.data.searchText.includes(q);
        }}
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
