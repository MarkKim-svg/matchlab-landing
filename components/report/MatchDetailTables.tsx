"use client";

import { useState } from "react";

// ── Types ──

interface FormData {
  results: string[];
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface StatsData {
  goalsPerGame: number;
  concededPerGame: number;
  cleanSheetPct: number;
  played: number;
}

interface H2HMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
}

interface H2HData {
  homeWins: number;
  draws: number;
  awayWins: number;
  total: number;
  recentMatches: H2HMatch[];
}

interface StandingData {
  rank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsDiff: number;
}

interface InjuryData {
  player: string;
  team: string;
  type: string;
  reason: string;
}

export interface MatchDetail {
  form: { home: FormData; away: FormData };
  stats: { home: StatsData | null; away: StatsData | null };
  h2h: H2HData;
  standings: { home: StandingData | null; away: StandingData | null };
  injuries: InjuryData[];
  fixtureInfo?: { kickoffKST: string; round: string };
}

// ── Styles ──

const TH: React.CSSProperties = { color: "#10B981", padding: "10px 14px", background: "#0A1121", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em", textAlign: "left" as const };
const TD: React.CSSProperties = { padding: "10px 14px", color: "#d4d4d4", fontSize: "13px" };
const TD_NUM: React.CSSProperties = { ...TD, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#E1E7EF" };
const WRAP: React.CSSProperties = { border: "1px solid #1E2D47", borderRadius: "12px", overflow: "hidden" };

function rowBg(i: number) { return i % 2 === 0 ? "#0F172A" : "#1A2332"; }

function FormBadge({ result }: { result: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    W: { bg: "#05966930", text: "#34D399" },
    D: { bg: "#F59E0B25", text: "#FBBF24" },
    L: { bg: "#EF444425", text: "#F87171" },
  };
  const c = colors[result] ?? colors.D;
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: "4px", padding: "2px 8px", fontSize: "12px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
      {result}
    </span>
  );
}

// ── Section Header ──

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
      <span style={{ fontSize: "16px" }}>{emoji}</span>
      <span style={{ fontSize: "15px", fontWeight: 700, color: "#E1E7EF" }}>{title}</span>
    </div>
  );
}

// ── 1. Form Table ──

export function FormTable({ form, homeName, awayName }: { form: MatchDetail["form"]; homeName: string; awayName: string }) {
  const rows = [
    { label: "최근 폼", home: form.home.results.slice(0, 5).map((r, i) => <FormBadge key={i} result={r} />), away: form.away.results.slice(0, 5).map((r, i) => <FormBadge key={i} result={r} />) },
    { label: "승-무-패", home: `${form.home.wins}-${form.home.draws}-${form.home.losses}`, away: `${form.away.wins}-${form.away.draws}-${form.away.losses}` },
    { label: "득점", home: String(form.home.goalsFor), away: String(form.away.goalsFor) },
    { label: "실점", home: String(form.home.goalsAgainst), away: String(form.away.goalsAgainst) },
  ];

  return (
    <div>
      <SectionHeader emoji="📊" title="양팀 최근 폼 (10경기)" />
      <div style={{ overflowX: "auto", ...WRAP }}>
        <table style={{ width: "100%", minWidth: "340px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #1E2D47" }}>
              <th style={TH}>지표</th>
              <th style={{ ...TH, textAlign: "center" }}>{homeName}</th>
              <th style={{ ...TH, textAlign: "center" }}>{awayName}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} style={{ background: rowBg(i), borderBottom: "1px solid #1E2D4766" }}>
                <td style={TD}>{r.label}</td>
                <td style={{ ...TD_NUM, textAlign: "center" }}>
                  {typeof r.home === "string" ? r.home : <span style={{ display: "flex", gap: "4px", justifyContent: "center" }}>{r.home}</span>}
                </td>
                <td style={{ ...TD_NUM, textAlign: "center" }}>
                  {typeof r.away === "string" ? r.away : <span style={{ display: "flex", gap: "4px", justifyContent: "center" }}>{r.away}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 2. Stats Table ──

export function StatsTable({ stats, homeName, awayName }: { stats: MatchDetail["stats"]; homeName: string; awayName: string }) {
  if (!stats.home && !stats.away) return null;
  const h = stats.home;
  const a = stats.away;

  const rows = [
    { label: "경기당 득점", home: h?.goalsPerGame?.toFixed(1) ?? "-", away: a?.goalsPerGame?.toFixed(1) ?? "-" },
    { label: "경기당 실점", home: h?.concededPerGame?.toFixed(1) ?? "-", away: a?.concededPerGame?.toFixed(1) ?? "-" },
    { label: "클린시트", home: h ? `${h.cleanSheetPct}%` : "-", away: a ? `${a.cleanSheetPct}%` : "-" },
  ];

  return (
    <div>
      <SectionHeader emoji="⚡" title="핵심 스탯 비교" />
      <div style={{ overflowX: "auto", ...WRAP }}>
        <table style={{ width: "100%", minWidth: "340px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #1E2D47" }}>
              <th style={TH}>지표</th>
              <th style={{ ...TH, textAlign: "center" }}>{homeName}</th>
              <th style={{ ...TH, textAlign: "center" }}>{awayName}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} style={{ background: rowBg(i), borderBottom: "1px solid #1E2D4766" }}>
                <td style={TD}>{r.label}</td>
                <td style={{ ...TD_NUM, textAlign: "center" }}>{r.home}</td>
                <td style={{ ...TD_NUM, textAlign: "center" }}>{r.away}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 3. H2H Table ──

export function H2HTable({ h2h, homeName, awayName }: { h2h: H2HData; homeName: string; awayName: string }) {
  if (h2h.total === 0) return null;

  return (
    <div>
      <SectionHeader emoji="🔄" title="상대 전적 (H2H)" />

      {/* Summary bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        {[
          { label: `${homeName} 승`, value: h2h.homeWins, color: "#10B981" },
          { label: "무승부", value: h2h.draws, color: "#F59E0B" },
          { label: `${awayName} 승`, value: h2h.awayWins, color: "#3B82F6" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", background: "#0F172A", border: "1px solid #1E2D47", borderRadius: "10px", padding: "10px 8px" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#8494A7", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent matches */}
      {h2h.recentMatches.length > 0 && (
        <div style={WRAP}>
          <table style={{ width: "100%", minWidth: "340px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #1E2D47" }}>
                <th style={TH}>날짜</th>
                <th style={{ ...TH, textAlign: "center" }}>홈</th>
                <th style={{ ...TH, textAlign: "center" }}>스코어</th>
                <th style={{ ...TH, textAlign: "center" }}>원정</th>
              </tr>
            </thead>
            <tbody>
              {h2h.recentMatches.map((m, i) => (
                <tr key={i} style={{ background: rowBg(i), borderBottom: "1px solid #1E2D4766" }}>
                  <td style={{ ...TD, fontSize: "12px", color: "#8494A7" }}>{m.date}</td>
                  <td style={{ ...TD, textAlign: "center", fontSize: "12px" }}>{m.homeTeam}</td>
                  <td style={{ ...TD_NUM, textAlign: "center" }}>{m.homeGoals} - {m.awayGoals}</td>
                  <td style={{ ...TD, textAlign: "center", fontSize: "12px" }}>{m.awayTeam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── 4. Injuries List ──

export function InjuriesList({ injuries }: { injuries: InjuryData[] }) {
  const [expanded, setExpanded] = useState(false);

  if (injuries.length === 0) return null;

  const canCollapse = injuries.length > 3;
  const visible = canCollapse && !expanded ? injuries.slice(0, 3) : injuries;
  const remaining = injuries.length - 3;

  return (
    <div>
      <SectionHeader emoji="🏥" title={`부상/출장정지 ${injuries.length}명`} />
      <div style={{ ...WRAP, overflow: "hidden" }}>
        <table style={{ width: "100%", minWidth: "300px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #1E2D47" }}>
              <th style={TH}>선수</th>
              <th style={TH}>팀</th>
              <th style={TH}>유형</th>
              <th style={TH}>사유</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((inj, i) => (
              <tr key={i} style={{ background: rowBg(i), borderBottom: "1px solid #1E2D4766" }}>
                <td style={{ ...TD, fontWeight: 600 }}>{inj.player}</td>
                <td style={{ ...TD, fontSize: "12px", color: "#8494A7" }}>{inj.team}</td>
                <td style={TD}>{inj.type}</td>
                <td style={{ ...TD, fontSize: "12px", color: "#8494A7" }}>{inj.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {canCollapse && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="cursor-pointer"
            style={{ width: "100%", padding: "10px", background: "#0A1121", border: "none", borderTop: "1px solid #1E2D47", color: "#10B981", fontSize: "12px", fontWeight: 600 }}
          >
            {expanded ? "▲ 접기" : `▼ 더보기 (${remaining}명 더)`}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ──

export function MatchDetailSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse" style={{ ...WRAP, padding: "20px" }}>
          <div style={{ height: "16px", width: "120px", borderRadius: "6px", background: "#1A2332", marginBottom: "12px" }} />
          <div style={{ height: "80px", borderRadius: "8px", background: "#1A2332" }} />
        </div>
      ))}
    </div>
  );
}
