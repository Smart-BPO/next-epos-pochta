import { notFound } from "next/navigation";

/**
 * Catch unmatched /zh/* paths so app/zh/not-found.tsx handles them
 * (root UZ not-found would otherwise win for unknown URLs).
 */
export default function ZhCatchAll() {
  notFound();
}
