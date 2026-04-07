"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label: string;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) { return String(n).padStart(2, "0"); }

function getKSTToday() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split("T")[0];
}

export default function DarkCalendar({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [y, m] = value.split("-").map(Number);
  const [viewYear, setViewYear] = useState(y);
  const [viewMonth, setViewMonth] = useState(m);

  useEffect(() => {
    const [ny, nm] = value.split("-").map(Number);
    setViewYear(ny);
    setViewMonth(nm);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const today = getKSTToday();
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(viewYear - 1); setViewMonth(12); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(viewYear + 1); setViewMonth(1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectDate = (day: number) => {
    const dateStr = `${viewYear}-${pad(viewMonth)}-${pad(day)}`;
    onChange(dateStr);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="cursor-pointer"
        style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "#E1E7EF", fontSize: "18px", fontWeight: 700, padding: 0 }}
      >
        {label}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8494A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
          marginTop: "8px", zIndex: 100,
          background: "#1E293B", border: "1px solid #334155", borderRadius: "14px",
          padding: "16px", width: "280px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <button onClick={prevMonth} className="cursor-pointer" style={{ background: "none", border: "none", color: "#8494A7", fontSize: "16px", padding: "4px 8px" }}>◀</button>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#E1E7EF" }}>{viewYear}년 {viewMonth}월</span>
            <button onClick={nextMonth} className="cursor-pointer" style={{ background: "none", border: "none", color: "#8494A7", fontSize: "16px", padding: "4px 8px" }}>▶</button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "#566378", padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`e-${i}`} />
            ))}
            {/* Day buttons */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${pad(viewMonth)}-${pad(day)}`;
              const isToday = dateStr === today;
              const isSelected = dateStr === value;

              return (
                <button
                  key={day}
                  onClick={() => selectDate(day)}
                  className="cursor-pointer"
                  style={{
                    background: isSelected ? "#10B981" : isToday ? "rgba(16,185,129,0.15)" : "transparent",
                    color: isSelected ? "white" : isToday ? "#34D399" : "#d4d4d4",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 0",
                    fontSize: "13px",
                    fontWeight: isSelected || isToday ? 700 : 400,
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <button
            onClick={() => { onChange(today); setOpen(false); }}
            className="cursor-pointer"
            style={{ display: "block", width: "100%", marginTop: "8px", padding: "6px", background: "none", border: "1px solid #334155", borderRadius: "8px", color: "#10B981", fontSize: "12px", fontWeight: 600 }}
          >
            오늘로 이동
          </button>
        </div>
      )}
    </div>
  );
}
