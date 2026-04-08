"use client";

import { useState } from "react";
import type { LineupsData, LineupPlayer } from "./MatchDetailTables";

interface Props {
  lineups: LineupsData;
  homeName: string;
  awayName: string;
  isEstimated?: boolean;
  isFinished?: boolean;
}

const POS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  G: { bg: "#EAB308", text: "#000", label: "GK" },
  D: { bg: "#3B82F6", text: "#fff", label: "DF" },
  M: { bg: "#10B981", text: "#fff", label: "MF" },
  F: { bg: "#EF4444", text: "#fff", label: "FW" },
};

function posColor(pos: string) {
  return POS_COLORS[pos?.charAt(0)?.toUpperCase() ?? ""] ?? { bg: "#374151", text: "#fff", label: "?" };
}

// ── Formation → coordinates (GK=bottom y=90%, FW=top y=10%) ──
function getPositions(formation: string, count: number): { x: number; y: number }[] {
  const parts = formation.split("-").map(Number).filter(n => n > 0);
  if (parts.length === 0) return Array.from({ length: count }, (_, i) => ({ x: 15 + ((i % 4) / 3) * 70, y: 90 - Math.floor(i / 4) * 25 }));

  const lines: number[] = [1, ...parts];
  const positions: { x: number; y: number }[] = [];
  const totalLines = lines.length;

  for (let li = 0; li < totalLines; li++) {
    const n = lines[li];
    const y = 90 - (li / (totalLines - 1 || 1)) * 80;
    for (let pi = 0; pi < n; pi++) {
      const x = n === 1 ? 50 : 12 + (pi / (n - 1)) * 76;
      positions.push({ x, y });
    }
  }
  return positions.slice(0, count);
}

// ── Half Pitch SVG (finished matches only) ──
function HalfPitch({ players, formation, teamName, flip }: { players: LineupPlayer[]; formation: string; teamName: string; flip?: boolean }) {
  const positions = getPositions(formation, players.length);

  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: "75%", overflow: "hidden", borderRadius: flip ? "0 0 12px 12px" : "12px 12px 0 0" }}>
      <svg viewBox="0 0 400 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={0} y={i * 30} width={400} height={30} fill={i % 2 === 0 ? "#1a4d2e" : "#1d5a35"} />
        ))}
        <rect x={2} y={2} width={396} height={296} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
        <line x1={0} y1={flip ? 2 : 298} x2={400} y2={flip ? 2 : 298} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
        <path d={flip ? "M 155 2 A 45 45 0 0 1 245 2" : "M 155 298 A 45 45 0 0 0 245 298"} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
        <rect x={105} y={flip ? 2 : 230} width={190} height={68} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <rect x={150} y={flip ? 2 : 260} width={100} height={38} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      </svg>

      {players.map((p, i) => {
        const pos = positions[i] ?? { x: 50, y: 50 };
        // For flip (away team): invert y so GK is at top, FW at bottom → teams face each other
        const py = flip ? (100 - pos.y) : pos.y;
        const c = posColor(p.pos);
        const lastName = p.name.split(" ").pop() ?? p.name;

        return (
          <div key={i} style={{ position: "absolute", left: `${pos.x}%`, top: `${py}%`, transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: c.bg, border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: c.text, fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
              {p.number || ""}
            </div>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.85)", marginTop: "2px", whiteSpace: "nowrap", maxWidth: "56px", overflow: "hidden", textOverflow: "ellipsis", textAlign: "center", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>
              {lastName}
            </span>
          </div>
        );
      })}

      <div style={{ position: "absolute", [flip ? "bottom" : "top"]: "6px", left: "50%", transform: "translateX(-50%)", fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 600, zIndex: 3, background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: "4px" }}>
        {teamName} {formation}
      </div>
    </div>
  );
}

// ── Text Lineup List (pre-match) ──
function LineupList({ players, formation, teamName }: { players: LineupPlayer[]; formation: string; teamName: string }) {
  // Group by position
  const groups: Record<string, LineupPlayer[]> = { G: [], D: [], M: [], F: [] };
  for (const p of players) {
    const key = p.pos?.charAt(0)?.toUpperCase() ?? "M";
    (groups[key] ?? (groups["M"] = groups["M"] || [])).push(p);
  }

  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "14px", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#E1E7EF" }}>{teamName}</span>
        <span style={{ fontSize: "12px", color: "#8494A7", fontFamily: "'JetBrains Mono',monospace" }}>{formation}</span>
      </div>
      {(["G", "D", "M", "F"] as const).map(posKey => {
        const list = groups[posKey] ?? [];
        if (list.length === 0) return null;
        const c = POS_COLORS[posKey];
        return (
          <div key={posKey} style={{ marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: c.bg, marginBottom: "2px", display: "block" }}>{c.label}</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {list.map((p, i) => (
                <span key={i} style={{ fontSize: "11px", color: "#E1E7EF", background: "#0F172A", borderRadius: "6px", padding: "3px 8px", borderLeft: `3px solid ${c.bg}` }}>
                  {p.number ? `${p.number} ` : ""}{p.name.split(" ").pop()}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Subs ──
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

// ── Main ──
export default function LineupPitch({ lineups, homeName, awayName, isEstimated, isFinished }: Props) {
  if (!lineups?.home?.startXI.length && !lineups?.away?.startXI.length) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "16px" }}>📋</span>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF" }}>
          {isEstimated ? "예상 라인업" : "확정 라인업"}
        </span>
        <span style={{ fontSize: "10px", fontWeight: 700, borderRadius: "9999px", padding: "2px 8px", background: isEstimated ? "#F9731625" : "#22C55E25", color: isEstimated ? "#F97316" : "#22C55E" }}>
          {isEstimated ? "예상" : "확정"}
        </span>
        {lineups.home?.formation && lineups.away?.formation && (
          <span style={{ fontSize: "12px", color: "#8494A7", fontFamily: "'JetBrains Mono',monospace" }}>
            {lineups.home.formation} vs {lineups.away.formation}
          </span>
        )}
      </div>

      {/* Position legend */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "10px", fontSize: "10px", color: "#8494A7" }}>
        {Object.values(POS_COLORS).map(p => (
          <span key={p.label} style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.bg, display: "inline-block" }} />
            {p.label}
          </span>
        ))}
      </div>

      {isFinished ? (
        /* Pitch visualization for finished matches */
        <div className="lineup-pitch" style={{ border: "1px solid #1E2D47", borderRadius: "14px", overflow: "hidden", background: "#0F172A" }}>
          {lineups.home && lineups.home.startXI.length > 0 && (
            <div className="lineup-half">
              <HalfPitch players={lineups.home.startXI} formation={lineups.home.formation} teamName={homeName} />
            </div>
          )}
          {lineups.away && lineups.away.startXI.length > 0 && (
            <div className="lineup-half">
              <HalfPitch players={lineups.away.startXI} formation={lineups.away.formation} teamName={awayName} flip />
            </div>
          )}
        </div>
      ) : (
        /* Text list for pre-match */
        <div className="lineup-pitch" style={{ gap: "12px" }}>
          {lineups.home && lineups.home.startXI.length > 0 && (
            <LineupList players={lineups.home.startXI} formation={lineups.home.formation} teamName={homeName} />
          )}
          {lineups.away && lineups.away.startXI.length > 0 && (
            <LineupList players={lineups.away.startXI} formation={lineups.away.formation} teamName={awayName} />
          )}
        </div>
      )}

      {/* Subs */}
      <div className="lineup-subs" style={{ marginTop: "8px" }}>
        {lineups.home && <SubsList subs={lineups.home.subs} label={homeName} />}
        {lineups.away && <SubsList subs={lineups.away.subs} label={awayName} />}
      </div>

      <p style={{ fontSize: "10px", color: "#566378", marginTop: "8px" }}>
        {isEstimated
          ? "최근 3경기 출전 기록과 부상 정보를 기반으로 구성된 예상 라인업입니다"
          : "공식 확정 라인업입니다"}
      </p>
    </div>
  );
}
