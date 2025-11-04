'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ResponsiveChartProps {
  children: ReactNode;
  minHeight?: number;
  className?: string;
}

export default function ResponsiveChart({
  children,
  minHeight = 240,
  className = '',
}: ResponsiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(minHeight);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
        setHeight(Math.max(minHeight, containerRef.current.offsetHeight));
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [minHeight]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ minHeight: `${minHeight}px` }}
    >
      {width > 0 && (
        <div style={{ width: `${width}px`, height: `${height}px` }}>
          {children}
        </div>
      )}
    </div>
  );
}

