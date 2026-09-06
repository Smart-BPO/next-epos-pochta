import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  btnBase,
  btnSizeLg,
  btnSizeMd,
  btnSizeSm,
  btnSizeXs,
  btnToneAccent,
  btnToneDanger,
  btnToneGhost,
  btnToneMain,
  btnToneMuted,
  btnToneOutline,
  btnToneSecondary,
  btnToneSuccess,
  btnToneTelegram,
  btnWidthAuto,
  btnWidthFull,
  btnWidthMobile,
} from "@/styles/ui";

/**
 * Button tones (CSS vars in `tokens.css`):
 * - main / primary — solid brand CTA
 * - secondary — brand outline
 * - accent — soft brand fill
 * - ghost — transparent
 * - outline — neutral border
 * - muted — quiet surface fill
 * - danger / success / telegram — semantic
 */
export type ButtonVariant =
  | "main"
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "outline"
  | "muted"
  | "danger"
  | "success"
  | "telegram";

/** `xs` = header chrome; `sm` compact; `md` default; `lg` hero. */
export type ButtonSize = "xs" | "sm" | "md" | "lg";
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
  main: btnToneMain,
  primary: btnToneMain,
  secondary: btnToneSecondary,
  accent: btnToneAccent,
  ghost: btnToneGhost,
  outline: btnToneOutline,
  muted: btnToneMuted,
  danger: btnToneDanger,
  success: btnToneSuccess,
  telegram: btnToneTelegram,
};

const sizeClass: Record<ButtonSize, string> = {
  xs: btnSizeXs,
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
  variant = "main",
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
