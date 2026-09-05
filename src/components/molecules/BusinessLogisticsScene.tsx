import Image from "next/image";
import { cn } from "@/lib/cn";

const ASSETS = {
  laptop: {
    src: "/images/home/business/ecommerce-laptop.webp",
    width: 420,
    height: 420,
  },
  warehouse: {
    src: "/images/home/business/fulfillment-warehouse.webp",
    width: 460,
    height: 460,
  },
  van: {
    src: "/images/home/business/epos-van.webp",
    width: 480,
    height: 480,
  },
  parcel: {
    src: "/images/home/business/epos-parcel.webp",
    width: 120,
    height: 120,
  },
  pickup: {
    src: "/images/home/business/pickup-point.webp",
    width: 380,
    height: 380,
  },
  door: {
    src: "/images/home/business/recipient-door.webp",
    width: 360,
    height: 360,
  },
} as const;

function SceneImage({
  asset,
  className,
  sizes,
}: {
  asset: (typeof ASSETS)[keyof typeof ASSETS];
  className?: string;
  sizes: string;
}) {
  return (
    <Image
      src={asset.src}
      alt=""
      width={asset.width}
      height={asset.height}
      className={cn("object-contain", className)}
      sizes={sizes}
    />
  );
}

/**
 * Right-side logistics scene — order → warehouse → van → pickup / door.
 * Mobile: open grid diamond. md+: absolute collage with dashed route.
 */
export function BusinessLogisticsScene() {
  return (
    <>
      {/* Mobile — readable diamond, no crushed absolute stack */}
      <div
        className="relative mx-auto w-full max-w-[22rem] sm:max-w-[26rem] md:hidden"
        aria-hidden
      >
        <div className="pointer-events-none absolute inset-[12%_6%_6%] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_55%,rgb(245_246_248)_0%,transparent_72%)]" />

        <div className="relative grid grid-cols-2 items-end gap-x-2 gap-y-1">
          <div className="flex justify-center pb-1">
            <SceneImage
              asset={ASSETS.laptop}
              className="w-[88%] drop-shadow-[0_10px_18px_rgb(15_18_24/0.12)]"
              sizes="10rem"
            />
          </div>
          <div className="flex justify-center pb-1">
            <SceneImage
              asset={ASSETS.warehouse}
              className="w-[92%] drop-shadow-[0_10px_18px_rgb(15_18_24/0.12)]"
              sizes="10rem"
            />
          </div>

          <div className="col-span-2 -my-1 flex justify-center">
            <SceneImage
              asset={ASSETS.van}
              className="w-[64%] drop-shadow-[0_14px_24px_rgb(15_18_24/0.16)]"
              sizes="14rem"
            />
          </div>

          <div className="flex justify-center pt-1">
            <SceneImage
              asset={ASSETS.pickup}
              className="w-[82%] drop-shadow-[0_10px_18px_rgb(15_18_24/0.12)]"
              sizes="9rem"
            />
          </div>
          <div className="flex justify-center pt-1">
            <SceneImage
              asset={ASSETS.door}
              className="w-[78%] drop-shadow-[0_10px_18px_rgb(15_18_24/0.12)]"
              sizes="9rem"
            />
          </div>
        </div>
      </div>

      {/* Desktop / tablet — Figma-style absolute collage */}
      <div
        className="relative mx-auto hidden aspect-[560/480] w-full overflow-hidden md:block lg:h-full lg:min-h-[26rem] lg:max-w-none lg:aspect-auto"
        aria-hidden
      >
        <div className="pointer-events-none absolute inset-[8%_4%_2%] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_70%,rgb(245_246_248)_0%,transparent_72%)]" />

        <svg
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
          viewBox="0 0 560 480"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="biz-route-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0 0 10 5 0 10Z" fill="#E30613" />
            </marker>
          </defs>
          <path
            d="M150 150C210 95 300 90 380 120"
            stroke="#E30613"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 10"
            opacity="0.9"
          />
          <path
            d="M400 175C390 220 340 250 290 265"
            stroke="#E30613"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 10"
            opacity="0.9"
          />
          <path
            d="M250 300C210 340 170 360 145 385"
            stroke="#E30613"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 10"
            opacity="0.9"
          />
          <path
            d="M310 300C360 340 410 370 455 400"
            stroke="#E30613"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 10"
            markerEnd="url(#biz-route-arrow)"
            opacity="0.9"
          />
          <circle cx="150" cy="150" r="5" fill="#fff" stroke="#E30613" strokeWidth="2.5" />
          <circle cx="400" cy="130" r="5" fill="#fff" stroke="#E30613" strokeWidth="2.5" />
          <circle cx="280" cy="275" r="5" fill="#fff" stroke="#E30613" strokeWidth="2.5" />
          <circle cx="140" cy="395" r="5" fill="#fff" stroke="#E30613" strokeWidth="2.5" />
          <circle cx="460" cy="405" r="5" fill="#fff" stroke="#E30613" strokeWidth="2.5" />
        </svg>

        <SceneImage
          asset={ASSETS.laptop}
          className="absolute left-[2%] top-[4%] z-[3] w-[38%] drop-shadow-[0_12px_24px_rgb(15_18_24/0.14)]"
          sizes="(max-width: 1280px) 18vw, 13rem"
        />
        <SceneImage
          asset={ASSETS.warehouse}
          className="absolute right-[1%] top-[1%] z-[2] w-[42%] drop-shadow-[0_12px_24px_rgb(15_18_24/0.12)]"
          sizes="(max-width: 1280px) 20vw, 14rem"
        />
        <SceneImage
          asset={ASSETS.van}
          className="absolute left-[22%] top-[32%] z-[4] w-[46%] drop-shadow-[0_18px_30px_rgb(15_18_24/0.16)]"
          sizes="(max-width: 1280px) 22vw, 16rem"
        />
        <SceneImage
          asset={ASSETS.parcel}
          className="absolute left-[48%] top-[28%] z-[5] w-[11%] drop-shadow-md"
          sizes="3.5rem"
        />
        <SceneImage
          asset={ASSETS.pickup}
          className="absolute bottom-[1%] left-[4%] z-[3] w-[34%] drop-shadow-[0_12px_22px_rgb(15_18_24/0.12)]"
          sizes="(max-width: 1280px) 16vw, 12rem"
        />
        <SceneImage
          asset={ASSETS.door}
          className="absolute bottom-[1%] right-[2%] z-[3] w-[32%] drop-shadow-[0_12px_22px_rgb(15_18_24/0.12)]"
          sizes="(max-width: 1280px) 15vw, 11rem"
        />
      </div>
    </>
  );
}
