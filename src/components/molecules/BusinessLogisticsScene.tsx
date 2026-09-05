import Image from "next/image";

/**
 * Right-side logistics scene — order → warehouse → van → pickup / door.
 * Positions tuned to the Figma e-commerce section reference.
 */
export function BusinessLogisticsScene() {
  return (
    <div
      className="relative mx-auto aspect-[560/480] w-full max-w-[36rem] overflow-hidden lg:max-w-none lg:h-full lg:min-h-[26rem] lg:aspect-auto"
      aria-hidden
    >
      {/* Ground wash */}
      <div className="pointer-events-none absolute inset-[8%_4%_2%] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_70%,rgb(245_246_248)_0%,transparent_72%)]" />

      {/* Route aligned to object anchors */}
      <svg
        className="pointer-events-none absolute inset-0 z-[1] hidden h-full w-full md:block"
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
        {/* laptop → warehouse */}
        <path
          d="M150 150C210 95 300 90 380 120"
          stroke="#E30613"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8 10"
          opacity="0.9"
        />
        {/* warehouse → van */}
        <path
          d="M400 175C390 220 340 250 290 265"
          stroke="#E30613"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8 10"
          opacity="0.9"
        />
        {/* van → pickup */}
        <path
          d="M250 300C210 340 170 360 145 385"
          stroke="#E30613"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8 10"
          opacity="0.9"
        />
        {/* van → door */}
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

      {/* 1. Laptop — upper left */}
      <Image
        src="/images/home/business/ecommerce-laptop.webp"
        alt=""
        width={420}
        height={420}
        className="absolute left-[2%] top-[4%] z-[3] w-[38%] object-contain drop-shadow-[0_12px_24px_rgb(15_18_24/0.14)]"
        sizes="(max-width: 1024px) 38vw, 13rem"
      />

      {/* 2. Warehouse — upper right */}
      <Image
        src="/images/home/business/fulfillment-warehouse.webp"
        alt=""
        width={460}
        height={460}
        className="absolute right-[1%] top-[1%] z-[2] w-[42%] object-contain drop-shadow-[0_12px_24px_rgb(15_18_24/0.12)]"
        sizes="(max-width: 1024px) 42vw, 14rem"
      />

      {/* 3. Van — center */}
      <Image
        src="/images/home/business/epos-van.webp"
        alt=""
        width={480}
        height={480}
        className="absolute left-[22%] top-[32%] z-[4] w-[46%] object-contain drop-shadow-[0_18px_30px_rgb(15_18_24/0.16)]"
        sizes="(max-width: 1024px) 46vw, 16rem"
      />

      {/* Parcel on warehouse→van leg */}
      <Image
        src="/images/home/business/epos-parcel.webp"
        alt=""
        width={120}
        height={120}
        className="absolute left-[48%] top-[28%] z-[5] w-[11%] object-contain drop-shadow-md"
        sizes="3.5rem"
      />

      {/* 4. Pickup — lower left */}
      <Image
        src="/images/home/business/pickup-point.webp"
        alt=""
        width={380}
        height={380}
        className="absolute bottom-[1%] left-[4%] z-[3] w-[34%] object-contain drop-shadow-[0_12px_22px_rgb(15_18_24/0.12)]"
        sizes="(max-width: 1024px) 34vw, 12rem"
      />

      {/* 5. Door — lower right */}
      <Image
        src="/images/home/business/recipient-door.webp"
        alt=""
        width={360}
        height={360}
        className="absolute bottom-[1%] right-[2%] z-[3] w-[32%] object-contain drop-shadow-[0_12px_22px_rgb(15_18_24/0.12)]"
        sizes="(max-width: 1024px) 32vw, 11rem"
      />
    </div>
  );
}
