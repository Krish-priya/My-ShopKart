import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

function scrollWindowToTop() {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  } catch {
    window.scrollTo(0, 0);
  }

  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
  if (document.scrollingElement) document.scrollingElement.scrollTop = 0;

  const main = document.querySelector("main.main-content");
  if (main) main.scrollTop = 0;

  const topEl = document.getElementById("top");
  if (topEl) {
    topEl.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

/** Jump to top on every route change (desktop + mobile). */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return undefined;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Blur focused footer/nav controls so mobile browsers don't keep the old scroll
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    scrollWindowToTop();
    const raf = requestAnimationFrame(scrollWindowToTop);
    const t1 = setTimeout(scrollWindowToTop, 0);
    const t2 = setTimeout(scrollWindowToTop, 80);
    const t3 = setTimeout(scrollWindowToTop, 200);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, search, hash]);

  return null;
}
