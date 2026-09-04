"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;
  const el = document.getElementById(hash);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Ensures App Router navigations to /path/#id land below the sticky header. */
export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    scrollToHash();
    const onHashChange = () => scrollToHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  return null;
}
