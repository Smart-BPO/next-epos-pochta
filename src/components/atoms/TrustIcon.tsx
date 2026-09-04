import Image from "next/image";

const ICONS = [
  "/images/icons/attempt.svg",
  "/images/icons/return.svg",
  "/images/icons/sms.svg",
  "/images/icons/api.svg",
] as const;

export function TrustIcon({ index }: { index: number }) {
  return (
    <Image
      src={ICONS[index % ICONS.length]}
      alt=""
      width={56}
      height={56}
      unoptimized
    />
  );
}
