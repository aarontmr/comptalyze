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
  const [isVisible, setIsVisible] = useState(false);
  const startRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasStartedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startAnimation = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      startRef.current = null;

      const step = (t: number) => {
        if (startRef.current === null) startRef.current = t;

        const elapsed = t - startRef.current;
        const p = Math.min(1, elapsed / duration);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - p, 3);

        setVal(Math.round(to * eased));

        if (p < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setVal(to);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    };

    // IntersectionObserver pour détecter la visibilité
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStartedRef.current) {
            setIsVisible(true);
            startAnimation();
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
    }

    // Fallback : Si après 2 secondes l'animation n'a pas démarré, la forcer
    const fallbackTimer = setTimeout(() => {
      if (!hasStartedRef.current && element) {
        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport) {
          startAnimation();
        }
      }
    }, 2000);

    return () => {
      if (element) observer.unobserve(element);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(fallbackTimer);
    };
  }, [to, duration]);

  return (
    <>
      <span ref={elementRef} />
      <span suppressHydrationWarning>{prefix}{val.toLocaleString("fr-FR")}{suffix}</span>
    </>
  );
}

