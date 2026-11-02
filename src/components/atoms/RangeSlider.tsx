"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

export function RangeSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  className,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  className?: string;
}) {
  // Ignore value changes that are not part of a pointer or key gesture.
  // A custom appearance:none track lets Safari/Chrome emit a change (often the
  // max) when the result block shifts the layout or the page scrolls.
  const gesture = useRef(false);
  const disarmTimer = useRef<number | null>(null);

  const arm = () => {
    gesture.current = true;
    if (disarmTimer.current != null) window.clearTimeout(disarmTimer.current);
  };

  const disarm = () => {
    if (disarmTimer.current != null) window.clearTimeout(disarmTimer.current);
    disarmTimer.current = window.setTimeout(() => {
      gesture.current = false;
    }, 120);
  };

  const display =
    step < 1 ? value.toFixed(1).replace(/\.0$/, "") : String(value);

  const commit = (raw: string, input: HTMLInputElement) => {
    if (!gesture.current) {
      input.value = String(value);
      return;
    }
    const next = Number(raw);
    if (!Number.isFinite(next)) return;
    const snapped =
      step > 0 ? min + Math.round((next - min) / step) * step : next;
    const clamped = Math.min(max, Math.max(min, Number(snapped.toFixed(4))));
    if (clamped === value) return;
    onChange(clamped);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-baseline gap-2">
        <label htmlFor={id} className="text-sm font-medium text-black/70">
          {label}
        </label>
        <span className="text-base font-semibold tabular-nums text-black">
          {display} {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={arm}
        onPointerUp={disarm}
        onPointerCancel={disarm}
        onMouseDown={arm}
        onMouseUp={disarm}
        onTouchStart={arm}
        onTouchEnd={disarm}
        onTouchCancel={disarm}
        onKeyDown={arm}
        onKeyUp={disarm}
        onChange={(e) => commit(e.target.value, e.target)}
        className="h-8 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-black/10 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary"
        style={{ touchAction: "pan-y" }}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div className="flex justify-between text-[0.7rem] text-black/35">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}
