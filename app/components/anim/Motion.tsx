"use client";

import { motion, MotionProps } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import classNames from "classnames";

interface FadeInProps extends MotionProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  variants?: {
    hidden: { opacity: number; y: number };
    show: { opacity: number; y: number };
  };
}

export function FadeIn({ 
  children, 
  delay = 0, 
  y = 10, 
  duration = 0.5, 
  className,
  variants,
  ...rest 
}: FadeInProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // If variants are provided, use them (for Stagger children)
  if (variants) {
    return (
      <motion.div
        variants={variants}
        className={className}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ 
        delay, 
        duration, 
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function Stagger({ 
  children, 
  className,
  staggerDelay = 0.08 
}: StaggerProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-20% 0px" }}
      variants={{ 
        hidden: {}, 
        show: { 
          transition: { staggerChildren: staggerDelay } 
        } 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Variant for use with Stagger
export const fadeInVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    }
  }
};

interface ScaleOnHoverProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function ScaleOnHover({ 
  children, 
  className = "",
  scale = 1.02 
}: ScaleOnHoverProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div 
      whileHover={{ scale }} 
      transition={{ type: "spring", stiffness: 250 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

