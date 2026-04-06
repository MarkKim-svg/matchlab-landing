"use client";

import { useEffect, useRef, useState } from "react";

interface DonutProps {
  percent: number | null;
  color: string;
  label?: string;
  sub?: string;
  size?: number;
  textSize?: number;
  trackColor?: string;
}

export default function Donut({
  percent,
  color,
  label,
  sub,
  size = 108,
  textSize = 22,
  trackColor = "#1E2D47",
}: DonutProps) {
  const r = 42;
  const C = 2 * Math.PI * r;
  const target = percent ?? 0;

  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || percent === null) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();

          const duration = 800;
          const start = performance.now();
          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out
            const eased = 1 - (1 - progress) * (1 - progress);
            setAnimatedPercent(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [percent, target, hasAnimated]);

  const displayPercent = percent === null ? 0 : animatedPercent;
  const filled = (displayPercent / 100) * C;

  return (
    <div className="flex flex-col items-center" ref={ref}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke={trackColor} strokeWidth="11" />
          {percent !== null && (
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={color}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${C}`}
              style={{ transition: "stroke-dasharray 0.1s linear" }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono-data font-bold" style={{ color, fontSize: textSize }}>
            {percent === null ? "—" : `${Math.round(displayPercent)}%`}
          </span>
        </div>
      </div>
      {label && (
        <div className="mt-2 text-[12px] font-semibold" style={{ color: "#d4d4d4" }}>
          {label}
        </div>
      )}
      {sub && (
        <div className="text-[11px] mt-0.5" style={{ color: "#737373" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
