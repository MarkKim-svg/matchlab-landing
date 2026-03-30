"use client";

import { useEffect, useState } from "react";

export function useHitRate() {
  const [hitRate, setHitRate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/dashboard?period=all")
      .then((r) => r.json())
      .then((data) => {
        const rate = data?.high_confidence?.hit_rate;
        if (typeof rate === "number") setHitRate(rate);
      })
      .catch(() => {});
  }, []);

  return hitRate;
}
