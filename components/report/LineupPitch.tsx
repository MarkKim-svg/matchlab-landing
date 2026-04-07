"use client";

import { useState } from "react";
import type { LineupsData, LineupPlayer } from "./MatchDetailTables";

interface Props {
  lineups: LineupsData;
  homeName: string;
  awayName: string;
}

// ── Formation → position coordinates (% based, 0-100 for x/y within half-pitch) ──
// y=0 is goal line, y=100 is halfway line. x=0 is left, x=100 is right.

function getPositions(formation: string, count: number): { x: number; y: number }[] {
  // Parse formation like "4-3-3" → [4,3,3]
  const parts = formation.split("-").map(Number).filter(n => n > 0);
  if (parts.length === 0) return evenSpread(count);

  const lines: number[] = [1, ...parts]; // GK + formation lines
  const positions: { x: number; y: number }[] = [];
  const totalLines = lines.length;

  for (let li = 0; li < totalLines; li++) {
    const n = lines[li];
    const y = 8 + (li / (totalLines - 1 || 1)) * 82; // 8% to 90%
    for (let pi = 0; pi < n; pi++) {
      const x = n === 1 ? 50 : 12 + (pi / (n - 1)) * 76;
      positions.push({ x, y });
    }
  }
  return positions.slice(0, count);
}

function evenSpread(count: number): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    x: 15 + ((i % 4) / 3) * 70,
    y: 10 + Math.floor(i / 4) * 25,
  }));
}

// ── Half Pitch SVG ──

function HalfPitch({ players, formation, teamName, flip }: { players: LineupPlayer[]; formation: string; teamName: string; flip?: boolean }) {
  const positions = getPositions(formation, players.length);

  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: "65%", overflow: "hidden", borderRadius: flip ? "0 0 12px 12px" : "12px 12px 0 0" }}>
      {/* Pitch background */}
      <svg viewBox="0 0 400 260" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* Grass stripes */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={0} y={i * 32.5} width={400} height={32.5} fill={i % 2 === 0 ? "#1a4d2e" : "#1d5a35"} />
        ))}
        {/* Pitch lines */}
        <rect x={2} y={2} width={396} height={256} rx={0} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
        {/* Halfway line */}
        <line x1={0} y1={flip ? 2 : 258} x2={400} y2={flip ? 2 : 258} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
        {/* Center circle (half) */}
        <path d={flip ? "M 160 2 A 40 40 0 0 1 240 2" : "M 160 258 A 40 40 0 0 0 240 258"} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
        {/* Penalty box */}
        <rect x={110} y={flip ? 2 : 200} width={180} height={58} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        {/* Goal box */}
        <rect x={155} y={flip ? 2 : 230} width={90} height={28} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      </svg>

      {/* Players */}
      {players.map((p, i) => {
        const pos = positions[i] ?? { x: 50, y: 50 };
        const px = pos.x;
        const py = flip ? (100 - pos.y) : pos.y;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${px}%`,
              top: `${py}%`,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 2,
            }}
          >
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "#111827", border: "2px solid rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700, color: "#E1E7EF",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {p.number || ""}
            </div>
            <span style={{
              fontSize: "8px", color: "rgba(255,255,255,0.8)", marginTop: "2px",
              whiteSpace: "nowrap", maxWidth: "60px", overflow: "hidden", textOverflow: "ellipsis",
              textAlign: "center", fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            }}>
              {p.name.split(" ").pop()}
            </span>
          </div>
        );
      })}

      {/* Team name + formation overlay */}
      <div style={{
        position: "absolute", [flip ? "bottom" : "top"]: "6px", left: "50%", transform: "translateX(-50%)",
        fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: 600, zIndex: 3,
      }}>
        {teamName} {formation}
      </div>
    </div>
  );
}

// ── Subs List ──

function SubsList({ subs, label }: { subs: LineupPlayer[]; label: string }) {
  const [open, setOpen] = useState(false);
  if (subs.length === 0) return null;
  return (
    <div>
      <button onClick={() => setOpen(v => !v)} className="cursor-pointer" style={{ background: "none", border: "none", padding: "4px 0", fontSize: "11px", color: "#8494A7", fontWeight: 600 }}>
        {open ? "▼" : "▶"} {label} 후보 ({subs.length}명)
      </button>
      {open && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
          {subs.map((s, i) => (
            <span key={i} style={{ fontSize: "10px", color: "#8494A7", background: "#0F172A", borderRadius: "4px", padding: "2px 6px" }}>
              {s.number ? `#${s.number} ` : ""}{s.name.split(" ").pop()} <span style={{ color: "#566378" }}>{s.pos}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──

export default function LineupPitch({ lineups, homeName, awayName }: Props) {
  if (!lineups?.home?.startXI.length && !lineups?.away?.startXI.length) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "16px" }}>📋</span>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF" }}>예상 라인업</span>
        {lineups.home?.formation && lineups.away?.formation && (
          <span style={{ fontSize: "12px", color: "#8494A7", fontFamily: "'JetBrains Mono',monospace" }}>
            {lineups.home.formation} vs {lineups.away.formation}
          </span>
        )}
      </div>

      {/* Full pitch (home top, away bottom) */}
      <div style={{ border: "1px solid #1E2D47", borderRadius: "14px", overflow: "hidden", background: "#0F172A" }}>
        {lineups.home && lineups.home.startXI.length > 0 && (
          <HalfPitch players={lineups.home.startXI} formation={lineups.home.formation} teamName={homeName} />
        )}
        {lineups.away && lineups.away.startXI.length > 0 && (
          <HalfPitch players={lineups.away.startXI} formation={lineups.away.formation} teamName={awayName} flip />
        )}
      </div>

      {/* Subs */}
      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {lineups.home && <SubsList subs={lineups.home.subs} label={homeName} />}
        {lineups.away && <SubsList subs={lineups.away.subs} label={awayName} />}
      </div>

      <p style={{ fontSize: "10px", color: "#566378", marginTop: "8px" }}>
        예상 라인업은 API 제공 데이터 기반이며, 실제 출전 명단과 다를 수 있습니다
      </p>
    </div>
  );
}
