import Image from "next/image";

/** Right-side logistics scene for the home business promo (Figma reference). */
export function BusinessLogisticsScene() {
  return (
    <div
      className="relative isolate min-h-[18rem] overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_70%_40%,#fde8e8_0%,transparent_55%),linear-gradient(160deg,#fff_0%,#f7f7f8_100%)] sm:min-h-[22rem] lg:min-h-[26rem]"
      aria-hidden
    >
      {/* Dotted route */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 640 420"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M90 250 C160 210, 220 160, 280 180 S400 260, 460 230 S560 150, 580 120"
          stroke="#D30203"
          strokeWidth="3"
          strokeDasharray="7 9"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="90" cy="250" r="5" fill="#D30203" />
        <circle cx="280" cy="180" r="5" fill="#D30203" />
        <circle cx="460" cy="230" r="5" fill="#D30203" />
        <circle cx="580" cy="120" r="5" fill="#D30203" />
      </svg>

      <Image
        src="/images/home/delivery-chain/ecommerce.webp"
        alt=""
        width={280}
        height={280}
        className="absolute left-[-2%] top-[8%] w-[42%] max-w-[14rem] object-contain drop-shadow-lg sm:left-[2%] sm:top-[12%] sm:w-[38%]"
      />
      <Image
        src="/images/home/delivery-chain/warehouse.webp"
        alt=""
        width={260}
        height={260}
        className="absolute left-[28%] top-[2%] w-[36%] max-w-[12rem] object-contain drop-shadow-md sm:left-[32%] sm:w-[34%]"
      />
      <Image
        src="/images/home/delivery-chain/van.webp"
        alt=""
        width={300}
        height={300}
        className="absolute bottom-[18%] left-[18%] w-[44%] max-w-[15rem] object-contain drop-shadow-xl sm:bottom-[14%] sm:left-[22%] sm:w-[40%]"
      />
      <Image
        src="/images/home/delivery-chain/pickup.webp"
        alt=""
        width={240}
        height={160}
        className="absolute bottom-[8%] right-[28%] w-[34%] max-w-[11rem] object-contain drop-shadow-md sm:right-[30%]"
      />
      <Image
        src="/images/home/delivery-chain/door.webp"
        alt=""
        width={220}
        height={200}
        className="absolute right-[-2%] top-[6%] w-[36%] max-w-[12rem] object-contain drop-shadow-lg sm:right-[2%] sm:top-[4%] sm:w-[34%]"
      />
      <Image
        src="/images/home/delivery-chain/parcel.webp"
        alt=""
        width={96}
        height={80}
        className="absolute bottom-[36%] right-[42%] w-[14%] max-w-[4.5rem] object-contain drop-shadow sm:bottom-[32%]"
      />
    </div>
  );
}
