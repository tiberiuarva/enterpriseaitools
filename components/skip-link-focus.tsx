"use client";

import { useEffect } from "react";

export function SkipLinkFocus() {
  useEffect(() => {
    const focusMain = () => {
      const main = document.getElementById("main-content");
      if (main instanceof HTMLElement) {
        main.focus({ preventScroll: true });
        main.scrollIntoView({ block: "start" });
      }
    };

    const focusMainFromHash = () => {
      if (window.location.hash === "#main-content") {
        window.requestAnimationFrame(focusMain);
      }
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a.skip-link");
      if (link) {
        window.setTimeout(focusMain, 0);
      }
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("hashchange", focusMainFromHash);
    window.addEventListener("load", focusMainFromHash);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("hashchange", focusMainFromHash);
      window.removeEventListener("load", focusMainFromHash);
    };
  }, []);

  return null;
}
