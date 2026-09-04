"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getHash(): string {
  return window.location.hash.replace(/^#/, "");
}

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function scrollToHash(behavior: ScrollBehavior = "smooth"): boolean {
  const hash = getHash();
  if (!hash) return false;
  const el = document.getElementById(hash);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}

function scrollToHashWithRetry(behavior: ScrollBehavior = "auto") {
  let attempts = 0;
  const tryScroll = () => {
    if (scrollToHash(behavior)) return;
    attempts += 1;
    if (attempts < 16) window.setTimeout(tryScroll, 40);
  };
  window.requestAnimationFrame(tryScroll);
}

/** New pages start at top; hash links scroll to the target section. */
export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (getHash()) {
      scrollToHashWithRetry("auto");
    } else {
      scrollToTop();
    }

    const onHashChange = () => {
      if (getHash()) scrollToHash("smooth");
      else scrollToTop();
    };

    const onPopState = () => {
      if (getHash()) scrollToHashWithRetry("auto");
      else scrollToTop();
    };

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.("a[href]");
      if (!(target instanceof HTMLAnchorElement)) return;
      if (target.target && target.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(target.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const nextHash = url.hash.replace(/^#/, "");
      const samePath =
        url.pathname.replace(/\/$/, "") ===
        window.location.pathname.replace(/\/$/, "");

      if (samePath && nextHash) {
        window.setTimeout(() => scrollToHash("smooth"), 0);
        return;
      }

      if (!samePath && !nextHash) {
        // Cross-page without hash: ensure top after App Router paints.
        window.setTimeout(scrollToTop, 0);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick);
    };
  }, [pathname]);

  return null;
}
