"use client";

import { useEffect, useRef, useState } from "react";

interface CounterProps {
  to?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export default function Counter({ 
  to = 10000000, 
  duration = 1200,
  prefix = "",
  suffix = " €"
}: CounterProps) {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Start animation immediately or when component enters viewport
    const startAnimation = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      startRef.current = null;

      let raf: number;

      const step = (t: number) => {
        if (startRef.current === null) startRef.current = t;

        const elapsed = t - startRef.current;
        const p = Math.min(1, elapsed / duration);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - p, 3);

        setVal(Math.round(to * eased));

        if (p < 1) {
          raf = requestAnimationFrame(step);
        } else {
          setVal(to);
        }
      };

      raf = requestAnimationFrame(step);
    };

    // Try IntersectionObserver first
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
        }
      },
      { threshold: 0.1 }
    );

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
      // Also check if already visible (for SSR/hydration)
      if (element.getBoundingClientRect().top < window.innerHeight) {
        startAnimation();
      }
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [to, duration]);

  return (
    <>
      <span ref={elementRef} className="sr-only" aria-hidden />
      <span>{prefix}{val.toLocaleString("fr-FR")}{suffix}</span>
    </>
  );
}

