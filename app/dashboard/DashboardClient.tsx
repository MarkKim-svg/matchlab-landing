"use client";

import { useEffect, useState } from "react";
import Donut from "@/components/ui/Donut";
import { TeamLogo, splitTeams } from "@/components/match-ui";

type Period = "7d" | "30d" | "all";
type Tab = "confidence" | "league" | "trend";

interface WeeklyTrend {
  week_label: string;
  week_start: string;
  overall: { hit_rate: number; correct: number; total: number };
  high_confidence: { hit_rate: number; correct: number; total: number };
}

interface RecentPrediction {
  date: string;
  match: string;
  league: string;
  prediction: string;
  confidence: number;
  confidenceLabel: string;
  result: string;
  isCorrect: boolean | null;
  homeTeamId?: string;
  awayTeamId?: string;
}

interface DashboardData {
  overall: { hitRate: number; correct: number; total: number };
  highConfidence: { hitRate: number; correct: number; total: number };
  byLeague: Array<{ league: string; hitRate: number; correct: number; total: number }>;
  byConfidence: Array<{ stars: number; label: string; hitRate: number; correct: number; total: number }>;
  recentPredictions: RecentPrediction[];
  weekly_trend: WeeklyTrend[];
}

const EMERALD = "#10B981";
const GOLD = "#F59E0B";
const YELLOW = "#EAB308";
const RED = "#EF4444";
const MUTED = "#737373";
const TRACK = "#1E2D47";

function rateColor(rate: number): string {
  if (rate >= 55) return EMERALD;
  if (rate >= 45) return YELLOW;
  return RED;
}

export default function DashboardClient() {
  const [period, setPeriod] = useState<Period>("7d");
  const [tab, setTab] = useState<Tab>("confidence");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const periods: { key: Period; label: string }[] = [
    { key: "7d", label: "7일" },
    { key: "30d", label: "30일" },
    { key: "all", label: "전체" },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: "confidence", label: "확신도별" },
    { key: "league", label: "리그별" },
    { key: "trend", label: "주간 트렌드" },
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <h1 className="text-[20px] font-bold mb-3" style={{ color: "#E1E7EF" }}>
          📊 적중률 대시보드
        </h1>
        {/* Period filter */}
        <div className="flex gap-2">
          {periods.map(p => {
            const active = period === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                style={{
                  background: active ? EMERALD : "#1a1a1a",
                  color: active ? "#0A1121" : "#8494A7",
                  border: `1px solid ${active ? EMERALD : "#262626"}`,
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary cards */}
      <section className="px-4 py-5" style={{ borderBottom: "1px solid #1a1a1a" }}>
        {loading ? (
          <div className="flex flex-col sm:flex-row gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex-1 rounded-xl p-4"
                style={{ background: "#1a1a1a", border: "1px solid #262626", height: 160 }}
              />
            ))}
          </div>
        ) : !data ? (
          <div className="text-center py-8 text-[14px]" style={{ color: "#64748B" }}>
            데이터를 불러오지 못했습니다
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <SummaryCard>
              <Donut
                percent={data.overall.total > 0 ? data.overall.hitRate : null}
                color={EMERALD}
                label="전체 적중률"
                sub={`${data.overall.correct}/${data.overall.total}`}
              />
            </SummaryCard>
            <SummaryCard>
              <Donut
                percent={data.highConfidence.total > 0 ? data.highConfidence.hitRate : null}
                color={GOLD}
                label="⭐4+ 적중률"
                sub={
                  data.highConfidence.total > 0
                    ? `${data.highConfidence.correct}/${data.highConfidence.total}`
                    : "데이터 없음"
                }
              />
            </SummaryCard>
            <SummaryCard>
              <div className="flex flex-col items-center justify-center h-full py-4">
                <div className="font-mono-data font-bold text-[38px]" style={{ color: "#E1E7EF" }}>
                  {data.overall.total}
                </div>
                <div className="text-[12px] font-semibold mt-2" style={{ color: "#d4d4d4" }}>
                  총 분석 경기
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: MUTED }}>
                  판정 완료 기준
                </div>
              </div>
            </SummaryCard>
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="px-4 pt-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="flex gap-1">
          {tabs.map(t => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-3 py-2 text-[13px] font-semibold transition-colors"
                style={{
                  color: active ? EMERALD : "#8494A7",
                  borderBottom: `2px solid ${active ? EMERALD : "transparent"}`,
                  marginBottom: "-1px",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <section className="px-4 py-5" style={{ borderBottom: "1px solid #1a1a1a" }}>
        {loading || !data ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 rounded" style={{ background: "#1a1a1a" }} />
            ))}
          </div>
        ) : tab === "confidence" ? (
          <ConfidenceTab rows={data.byConfidence} />
        ) : tab === "league" ? (
          <LeagueTab rows={data.byLeague} />
        ) : (
          <TrendTab trend={data.weekly_trend} />
        )}
      </section>

      {/* Recent history */}
      <section className="px-4 py-5">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[16px]">📋</span>
          <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>
            최근 예측 히스토리
          </span>
        </div>
        {loading || !data ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 rounded" style={{ background: "#1a1a1a" }} />
            ))}
          </div>
        ) : (
          <HistoryTable rows={data.recentPredictions.slice(0, 20)} />
        )}
      </section>
    </div>
  );
}

function SummaryCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex-1 rounded-xl p-4 flex items-center justify-center"
      style={{ background: "#1a1a1a", border: "1px solid #262626", minHeight: 160 }}
    >
      {children}
    </div>
  );
}

/* ---------- Confidence Tab ---------- */
function ConfidenceTab({ rows }: { rows: Array<{ stars: number; label: string; hitRate: number; correct: number; total: number }> }) {
  if (rows.length === 0) {
    return <EmptyState msg="확신도별 데이터가 없습니다" />;
  }
  return (
    <div className="space-y-3">
      {rows.map(r => {
        const lowSample = r.total < 3;
        const color = rateColor(r.hitRate);
        return (
          <div key={r.stars} style={{ opacity: lowSample ? 0.45 : 1 }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-semibold" style={{ color: "#d4d4d4" }}>
                {r.label}
              </span>
              <span className="text-[11px] font-mono-data" style={{ color: MUTED }}>
                {r.correct}/{r.total}
              </span>
            </div>
            <HBar percent={r.hitRate} color={color} />
          </div>
        );
      })}
      <div className="pt-2 text-[11px]" style={{ color: MUTED }}>
        * 표본 3건 미만은 흐리게 표시됩니다
      </div>
    </div>
  );
}

/* ---------- League Tab ---------- */
function LeagueTab({ rows }: { rows: Array<{ league: string; hitRate: number; correct: number; total: number }> }) {
  if (rows.length === 0) {
    return <EmptyState msg="리그별 데이터가 없습니다" />;
  }
  return (
    <div className="space-y-3">
      {rows.map(r => {
        const lowSample = r.total < 3;
        const color = rateColor(r.hitRate);
        return (
          <div key={r.league} style={{ opacity: lowSample ? 0.45 : 1 }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-semibold truncate" style={{ color: "#d4d4d4" }}>
                {r.league}
              </span>
              <span className="text-[11px] font-mono-data ml-2 shrink-0" style={{ color: MUTED }}>
                {r.correct}/{r.total}
              </span>
            </div>
            <HBar percent={r.hitRate} color={color} />
          </div>
        );
      })}
    </div>
  );
}

/* Horizontal bar with % label on top of bar */
function HBar({ percent, color }: { percent: number; color: string }) {
  const w = Math.max(Math.min(percent, 100), 0);
  return (
    <div className="relative h-6 rounded" style={{ background: TRACK }}>
      <div
        className="h-full rounded transition-all"
        style={{ width: `${w}%`, background: color }}
      />
      <span
        className="absolute top-1/2 -translate-y-1/2 text-[11px] font-mono-data font-bold"
        style={{
          left: w > 15 ? `calc(${w}% - 8px)` : `calc(${w}% + 6px)`,
          transform: w > 15 ? "translate(-100%, -50%)" : "translateY(-50%)",
          color: w > 15 ? "#0A1121" : "#d4d4d4",
        }}
      >
        {Math.round(percent)}%
      </span>
    </div>
  );
}

/* ---------- Trend Tab: SVG line chart ---------- */
function TrendTab({ trend }: { trend: WeeklyTrend[] }) {
  const weeks = trend.slice(-8);
  if (weeks.length === 0) {
    return <EmptyState msg="주간 트렌드 데이터가 없습니다" />;
  }

  const W = 320;
  const H = 180;
  const PAD_L = 28;
  const PAD_R = 10;
  const PAD_T = 10;
  const PAD_B = 28;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const xAt = (i: number) =>
    weeks.length === 1 ? PAD_L + innerW / 2 : PAD_L + (i / (weeks.length - 1)) * innerW;
  const yAt = (rate: number) => PAD_T + innerH - (rate / 100) * innerH;

  const overallPts = weeks.map((w, i) => ({ x: xAt(i), y: yAt(w.overall.hit_rate), r: w.overall.hit_rate, t: w.overall.total }));
  const highPts = weeks.map((w, i) => ({ x: xAt(i), y: yAt(w.high_confidence.hit_rate), r: w.high_confidence.hit_rate, t: w.high_confidence.total }));

  const mkPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 mb-3 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ background: EMERALD }} />
          <span style={{ color: "#d4d4d4" }}>전체</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ background: GOLD }} />
          <span style={{ color: "#d4d4d4" }}>⭐4+</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Y grid */}
        {yTicks.map(t => (
          <g key={t}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={yAt(t)}
              y2={yAt(t)}
              stroke={TRACK}
              strokeWidth="1"
              strokeDasharray={t === 50 ? "3 3" : "0"}
              opacity={t === 50 ? 0.8 : 0.4}
            />
            <text x={PAD_L - 6} y={yAt(t) + 3} textAnchor="end" fontSize="9" fill={MUTED}>
              {t}
            </text>
          </g>
        ))}

        {/* Lines */}
        <path d={mkPath(overallPts)} fill="none" stroke={EMERALD} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={mkPath(highPts)} fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 3" />

        {/* Points */}
        {overallPts.map((p, i) => (
          <circle key={`o-${i}`} cx={p.x} cy={p.y} r="3" fill={EMERALD} />
        ))}
        {highPts.map((p, i) =>
          weeks[i].high_confidence.total > 0 ? (
            <circle key={`h-${i}`} cx={p.x} cy={p.y} r="3" fill={GOLD} />
          ) : null
        )}

        {/* X labels */}
        {weeks.map((w, i) => (
          <text
            key={i}
            x={xAt(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="9"
            fill={MUTED}
          >
            {w.week_label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ---------- History Table ---------- */
function HistoryTable({ rows }: { rows: RecentPrediction[] }) {
  if (rows.length === 0) {
    return <EmptyState msg="최근 예측이 없습니다" />;
  }
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg overflow-hidden" style={{ border: "1px solid #262626" }}>
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: "#1a1a1a", color: MUTED }}>
              <th className="text-left px-3 py-2 font-semibold">날짜</th>
              <th className="text-left px-3 py-2 font-semibold">리그</th>
              <th className="text-left px-3 py-2 font-semibold">경기</th>
              <th className="text-left px-3 py-2 font-semibold">예측</th>
              <th className="text-left px-3 py-2 font-semibold">확신도</th>
              <th className="text-left px-3 py-2 font-semibold">결과</th>
              <th className="text-center px-3 py-2 font-semibold">적중</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const [home, away] = splitTeams(r.match);
              return (
              <tr key={`${r.date}-${r.match}-${i}`} style={{ borderTop: "1px solid #262626", color: "#d4d4d4" }}>
                <td className="px-3 py-2 font-mono-data whitespace-nowrap">{r.date.slice(5)}</td>
                <td className="px-3 py-2 truncate max-w-[100px]">{r.league}</td>
                <td className="px-3 py-2 max-w-[180px]">
                  <div className="flex items-center gap-1 min-w-0">
                    <TeamLogo teamId={r.homeTeamId ?? ""} teamName={home} size={18} />
                    <span className="truncate">{home}</span>
                    <span style={{ color: MUTED }}>vs</span>
                    <TeamLogo teamId={r.awayTeamId ?? ""} teamName={away} size={18} />
                    <span className="truncate">{away}</span>
                  </div>
                </td>
                <td className="px-3 py-2">{r.prediction}</td>
                <td className="px-3 py-2 whitespace-nowrap">{"⭐".repeat(r.confidence)}</td>
                <td className="px-3 py-2 font-mono-data" style={{ color: MUTED }}>{r.result || "—"}</td>
                <td className="px-3 py-2 text-center">
                  {r.isCorrect === true ? (
                    <span style={{ color: EMERALD }}>✓</span>
                  ) : r.isCorrect === false ? (
                    <span style={{ color: RED }}>✗</span>
                  ) : (
                    <span style={{ color: MUTED }}>—</span>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {rows.map((r, i) => {
          const hit = r.isCorrect;
          const color = hit === true ? EMERALD : hit === false ? RED : MUTED;
          const [home, away] = splitTeams(r.match);
          return (
            <div
              key={`${r.date}-${r.match}-${i}`}
              className="rounded-lg p-3"
              style={{ background: "#1a1a1a", border: "1px solid #262626" }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono-data" style={{ color: MUTED }}>
                  {r.date.slice(5)} · {r.league}
                </span>
                <span
                  className="text-[11px] font-bold px-1.5 rounded"
                  style={{
                    color,
                    background: hit === true ? "#052e16" : hit === false ? "#2c0b0b" : "transparent",
                  }}
                >
                  {hit === true ? "적중" : hit === false ? "미적중" : "대기"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[13px] font-semibold min-w-0" style={{ color: "#d4d4d4" }}>
                <TeamLogo teamId={r.homeTeamId ?? ""} teamName={home} size={18} />
                <span className="truncate">{home}</span>
                <span className="text-[11px]" style={{ color: MUTED }}>vs</span>
                <TeamLogo teamId={r.awayTeamId ?? ""} teamName={away} size={18} />
                <span className="truncate">{away}</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px]" style={{ color: MUTED }}>
                <span>
                  예측: <span style={{ color: "#d4d4d4" }}>{r.prediction}</span> {"⭐".repeat(r.confidence)}
                </span>
                <span className="font-mono-data">{r.result || "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="text-center py-6 text-[13px]" style={{ color: "#64748B" }}>
      {msg}
    </div>
  );
}
