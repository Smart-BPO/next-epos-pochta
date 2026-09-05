import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    id: "order",
    src: "/images/home/business/ecommerce-laptop.webp",
    width: 720,
    height: 720,
  },
  {
    id: "warehouse",
    src: "/images/home/business/fulfillment-warehouse.webp",
    width: 720,
    height: 720,
  },
  {
    id: "transit",
    src: "/images/home/business/epos-van.webp",
    width: 720,
    height: 720,
  },
  {
    id: "pickup",
    src: "/images/home/business/pickup-point.webp",
    width: 720,
    height: 720,
  },
  {
    id: "door",
    src: "/images/home/business/recipient-door.webp",
    width: 720,
    height: 720,
  },
] as const;

function ParcelMarker({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-[1] flex size-10 items-center justify-center sm:size-12",
        className,
      )}
      aria-hidden
    >
      <Image
        src="/images/home/business/epos-parcel.webp"
        alt=""
        width={96}
        height={96}
        className="h-auto w-full object-contain drop-shadow-md"
      />
    </span>
  );
}

/** Assembled logistics chain from EPOS delivery 3D assets. */
export function DeliveryChain({ locale }: { locale: Locale }) {
  const labels = getContent(locale).home.chainSteps;

  return (
    <div className="relative overflow-x-hidden rounded-3xl border border-black/10 bg-[linear-gradient(180deg,#fff_0%,#faf7f7_100%)] px-4 py-5 max-md:overflow-y-visible sm:px-5 sm:py-8 md:overflow-hidden md:px-6 md:py-10">
      {/* Desktop / tablet horizontal path */}
      <div className="relative hidden md:block">
        {/* Line between first and last column centers (5 equal cols → 10% … 90%) */}
        <div
          aria-hidden
          className="absolute left-[10%] right-[10%] top-[46%] h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary via-primary to-primary-hover"
        />

        {/* One connector dot in each gap between the 5 cards */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[46%]">
          {[20, 40, 60, 80].map((left) => (
            <span
              key={left}
              className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-sm"
              style={{ left: `${left}%` }}
            />
          ))}
        </div>

        <ParcelMarker className="left-[30%] top-[34%] -translate-x-1/2" />
        <ParcelMarker className="left-[50%] top-[54%] -translate-x-1/2" />
        <ParcelMarker className="left-[70%] top-[34%] -translate-x-1/2" />

        <ol className="relative z-[2] m-0 grid list-none grid-cols-5 items-end gap-2 p-0 lg:gap-3">
          {STEPS.map((step, index) => (
            <li key={step.id} className="flex flex-col items-center gap-3">
              <div className="relative flex h-[7.5rem] w-full items-end justify-center lg:h-[9.5rem]">
                <Image
                  src={step.src}
                  alt=""
                  width={step.width}
                  height={step.height}
                  className={cn(
                    "h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_12px_24px_rgb(15_18_24/0.12)]",
                    step.id === "transit" && "scale-110",
                    step.id === "order" && "scale-105",
                  )}
                  sizes="(max-width: 1024px) 18vw, 12rem"
                />
              </div>
              <p className="m-0 max-w-[9rem] text-center text-xs font-medium uppercase tracking-wide text-black/55 lg:text-sm">
                {labels[index]}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile vertical path — one continuous rail through node centers */}
      <ol className="relative m-0 grid list-none gap-0 p-0 md:hidden">
        <div
          aria-hidden
          className="absolute bottom-[2.75rem] left-[0.4375rem] top-[2.75rem] w-0.5 -translate-x-1/2 bg-primary"
        />

        {STEPS.map((step, index) => (
          <li
            key={step.id}
            className="relative z-[1] grid grid-cols-[0.875rem_4.5rem_minmax(0,1fr)] items-center gap-x-3.5 py-2"
          >
            <span
              aria-hidden
              className="relative z-[1] mx-auto size-2.5 rounded-full bg-primary shadow-[0_0_0_3px_rgb(255_250_248)]"
            />
            <div className="relative aspect-square w-full">
              <Image
                src={step.src}
                alt=""
                fill
                className="object-contain object-center drop-shadow-md"
                sizes="4.5rem"
              />
            </div>
            <p className="m-0 text-sm font-semibold uppercase leading-snug tracking-wide text-black/65">
              {labels[index]}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
