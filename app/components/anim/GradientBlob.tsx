"use client";

import { useEffect, useState } from "react";

export default function GradientBlob() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -top-24 h-72 blur-3xl opacity-30"
      style={{
        background:
          "radial-gradient(60% 60% at 50% 40%, rgba(0,208,132,0.25), rgba(46,108,246,0.15) 60%, transparent 80%)",
        animation: reducedMotion ? "none" : "drift 20s ease-in-out infinite alternate",
      }}
    />
  );
}













