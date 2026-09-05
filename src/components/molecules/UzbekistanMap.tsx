"use client";

import { useMemo, useState } from "react";
import { UZBEKISTAN_MAP_PATHS, UZBEKISTAN_MAP_VIEWBOX } from "@/data/uzbekistan-map-paths";
import {
  MAP_REGION_BY_ISO,
  mapRegionLabel,
  type MapRegionIso,
} from "@/data/uzbekistan-map";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

type UzbekistanMapProps = {
  locale: Locale;
  activeIso: MapRegionIso | null;
  onSelect: (iso: MapRegionIso) => void;
  className?: string;
};

/** Approximate centroids for selected-region pins (viewBox 0 0 1000 652). */
const REGION_PIN: Partial<Record<MapRegionIso, { x: number; y: number }>> = {
  UZAN: { x: 910, y: 385 },
  UZBU: { x: 470, y: 430 },
  UZFA: { x: 860, y: 405 },
  UZJI: { x: 675, y: 400 },
  UZNG: { x: 850, y: 355 },
  UZNW: { x: 520, y: 310 },
  UZQA: { x: 590, y: 510 },
  UZQR: { x: 220, y: 200 },
  UZSA: { x: 600, y: 430 },
  UZSI: { x: 725, y: 400 },
  UZSU: { x: 655, y: 560 },
  UZTK: { x: 748, y: 340 },
  UZTO: { x: 780, y: 330 },
  UZXO: { x: 310, y: 330 },
};

const FILL_IDLE = "color-mix(in srgb, var(--color-primary) 14%, white)";
const FILL_HOVER = "color-mix(in srgb, var(--color-primary) 28%, white)";
const FILL_ACTIVE = "color-mix(in srgb, var(--color-primary) 55%, white)";
const STROKE_IDLE = "color-mix(in srgb, var(--color-primary) 40%, transparent)";
const STROKE_ACTIVE = "var(--color-primary)";

/** Interactive Uzbekistan regions from the hero SVG path set. */
export function UzbekistanMap({
  locale,
  activeIso,
  onSelect,
  className,
}: UzbekistanMapProps) {
  const [hoveredIso, setHoveredIso] = useState<MapRegionIso | null>(null);

  const orderedIsos = useMemo(() => {
    const keys = Object.keys(UZBEKISTAN_MAP_PATHS) as MapRegionIso[];
    if (!activeIso) return keys;
    return [...keys.filter((iso) => iso !== activeIso), activeIso];
  }, [activeIso]);

  const pin = activeIso ? REGION_PIN[activeIso] : null;

  return (
    <svg
      viewBox={UZBEKISTAN_MAP_VIEWBOX}
      className={cn("h-auto w-full select-none touch-manipulation", className)}
      role="img"
      aria-label={locale === "uz" ? "Oʻzbekiston xaritasi" : "Карта Узбекистана"}
    >
      {orderedIsos.map((iso) => {
        const region = MAP_REGION_BY_ISO[iso];
        const active = activeIso === iso;
        const hovered = hoveredIso === iso;
        const label = mapRegionLabel(region, locale);

        return (
          <path
            key={iso}
            d={UZBEKISTAN_MAP_PATHS[iso]}
            role="button"
            tabIndex={0}
            aria-label={label}
            aria-pressed={active}
            data-iso={iso}
            onClick={() => onSelect(iso)}
            onPointerEnter={() => setHoveredIso(iso)}
            onPointerLeave={() =>
              setHoveredIso((current) => (current === iso ? null : current))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(iso);
              }
            }}
            style={{
              fill: active ? FILL_ACTIVE : hovered ? FILL_HOVER : FILL_IDLE,
              stroke: active ? STROKE_ACTIVE : STROKE_IDLE,
              strokeWidth: active ? 1.4 : 0.75,
              cursor: "pointer",
              outline: "none",
              transition: "fill 150ms ease, stroke 150ms ease",
            }}
          >
            <title>{label}</title>
          </path>
        );
      })}

      {pin ? (
        <g pointerEvents="none" aria-hidden>
          <circle
            cx={pin.x}
            cy={pin.y}
            r={11}
            fill="color-mix(in srgb, var(--color-primary) 22%, transparent)"
          />
          <circle cx={pin.x} cy={pin.y} r={5.5} fill="var(--color-primary)" />
          <circle cx={pin.x} cy={pin.y} r={2.2} fill="white" />
        </g>
      ) : null}
    </svg>
  );
}
