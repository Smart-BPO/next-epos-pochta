import { notFound } from "next/navigation";

/**
 * Catch unmatched /ru/* paths so app/ru/not-found.tsx handles them
 * (root UZ not-found would otherwise win for unknown URLs).
 */
export default function RuCatchAll() {
  notFound();
}
