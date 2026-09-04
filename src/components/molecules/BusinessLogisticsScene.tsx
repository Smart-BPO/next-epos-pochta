import Image from "next/image";

/** Right-side logistics scene for the home business promo. */
export function BusinessLogisticsScene() {
  return (
    <div
      className="relative isolate min-h-[18rem] overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_70%_40%,#fde8e8_0%,transparent_55%),linear-gradient(160deg,#fff_0%,#f7f7f8_100%)] sm:min-h-[22rem] lg:min-h-[28rem]"
      aria-hidden
    >
      <Image
        src="/images/home/business/delivery-route.svg"
        alt=""
        width={1200}
        height={520}
        className="pointer-events-none absolute inset-x-[4%] top-[18%] hidden h-auto w-[92%] object-contain opacity-90 md:block"
        unoptimized
      />

      <Image
        src="/images/home/business/ecommerce-laptop.webp"
        alt=""
        width={400}
        height={400}
        className="absolute left-[-2%] top-[6%] w-[44%] max-w-[15rem] object-contain drop-shadow-lg sm:left-[1%] sm:top-[10%] sm:w-[40%]"
      />
      <Image
        src="/images/home/business/fulfillment-warehouse.webp"
        alt=""
        width={380}
        height={380}
        className="absolute left-[28%] top-[0%] w-[38%] max-w-[13rem] object-contain drop-shadow-md sm:left-[30%] sm:w-[36%]"
      />
      <Image
        src="/images/home/business/epos-van.webp"
        alt=""
        width={420}
        height={420}
        className="absolute bottom-[12%] left-[14%] w-[48%] max-w-[16rem] object-contain drop-shadow-xl sm:bottom-[10%] sm:left-[18%] sm:w-[44%]"
      />
      <Image
        src="/images/home/business/pickup-point.webp"
        alt=""
        width={360}
        height={360}
        className="absolute bottom-[4%] right-[24%] w-[36%] max-w-[12rem] object-contain drop-shadow-md sm:right-[26%]"
      />
      <Image
        src="/images/home/business/recipient-door.webp"
        alt=""
        width={340}
        height={340}
        className="absolute right-[-2%] top-[2%] w-[38%] max-w-[13rem] object-contain drop-shadow-lg sm:right-[1%] sm:top-[0%] sm:w-[36%]"
      />
      <Image
        src="/images/home/business/epos-parcel.webp"
        alt=""
        width={120}
        height={120}
        className="absolute bottom-[34%] left-[48%] w-[16%] max-w-[5rem] -translate-x-1/2 object-contain drop-shadow md:bottom-[38%] md:left-[52%]"
      />
    </div>
  );
}
