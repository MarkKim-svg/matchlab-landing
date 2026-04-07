"use client";

import { useRef, type ReactNode } from "react";

export default function HScrollArrows({ children, scrollAmount = 200 }: { children: ReactNode; scrollAmount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <button
        onClick={() => scroll(-1)}
        className="cursor-pointer"
        style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", background: "#111827", border: "1px solid #1E2D47", color: "#8494A7", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
      >
        ◀
      </button>
      <div ref={ref} className="scrollbar-hide" style={{ display: "flex", gap: "8px", overflowX: "auto", flex: 1 }}>
        {children}
      </div>
      <button
        onClick={() => scroll(1)}
        className="cursor-pointer"
        style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", background: "#111827", border: "1px solid #1E2D47", color: "#8494A7", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
      >
        ▶
      </button>
    </div>
  );
}
