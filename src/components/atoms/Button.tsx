import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  btnBase,
  btnSizeLg,
  btnSizeMd,
  btnSizeSm,
  btnToneGhost,
  btnTonePrimary,
  btnToneSecondary,
  btnWidthAuto,
  btnWidthFull,
  btnWidthMobile,
} from "@/styles/ui";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
/** `mobile` = full width below sm, auto from sm+. */
export type ButtonWidth = "auto" | "full" | "mobile";

interface ButtonProps {
  href?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  target?: string;
  rel?: string;
}

const toneClass: Record<ButtonVariant, string> = {
  primary: btnTonePrimary,
  secondary: btnToneSecondary,
  ghost: btnToneGhost,
};

const sizeClass: Record<ButtonSize, string> = {
  sm: btnSizeSm,
  md: btnSizeMd,
  lg: btnSizeLg,
};

const widthClass: Record<ButtonWidth, string> = {
  auto: btnWidthAuto,
  full: btnWidthFull,
  mobile: btnWidthMobile,
};

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  width = "auto",
  className = "",
  type = "button",
  onClick,
  disabled,
  target,
  rel,
}: ButtonProps) {
  const cls = cn(
    btnBase,
    sizeClass[size],
    toneClass[variant],
    widthClass[width],
    className,
  );

  if (href) {
    if (href.startsWith("#") || isExternalHref(href)) {
      return (
        <a
          href={href}
          className={cls}
          onClick={onClick}
          target={target}
          rel={rel}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} onClick={onClick} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
