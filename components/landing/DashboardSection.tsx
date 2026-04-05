"use client";
import { useState, useEffect, useMemo } from "react";
import FadeSection from "@/lib/FadeSection";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine, Cell,
} from "recharts";

/* ── Types ── */
interface WeeklyTrend {
  week_label: string;
  week_start: string;
  overall: { hit_rate: number; correct: number; total: number };
  high_confidence: { hit_rate: number; correct: number; total: number };
}

interface PredictionItem {
  date: string;
  match: string;
  league: string;
  prediction: string;
  confidence: number;
  confidenceLabel: string;
  result: string;
  isCorrect: boolean | null;
  isProOnly: boolean;
}

interface DashboardData {
  overall: { hitRate: number; correct: number; total: number };
  highConfidence: { hitRate: number; correct: number; total: number };
  byLeague: Array<{ league: string; hitRate: number; correct: number; total: number }>;
  byConfidence: Array<{ stars: number; label: string; hitRate: number; correct: number; total: number }>;
  recentPredictions: PredictionItem[];
  weekly_trend: WeeklyTrend[];
}

/* ── Constants ── */
const BIG5 = ["프리미어리그", "라리가", "세리에A", "분데스리가", "리그1"];

const LEAGUE_SHORT: Record<string, string> = {
  "프리미어리그": "EPL",
  "라리가": "LaLiga",
  "세리에A": "Serie A",
  "분데스리가": "BL",
  "리그1": "Ligue 1",
  "챔피언스리그": "UCL",
  "유로파리그": "UEL",
  "컨퍼런스리그": "UECL",
};

type ChartTab = "confidence" | "league" | "trend";
type SortMode = "latest" | "confidence" | "league";

const TAB_LABELS: Record<ChartTab, string> = {
  confidence: "확신도별",
  league: "리그별",
  trend: "트렌드",
};

/* ── Helpers ── */
function getBarFill(hitRate: number): string {
  if (hitRate >= 55) return "#10B981";
  if (hitRate >= 45) return "#FBBF24";
  return "#EF4444";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ── Chart shared props ── */
const GRID = { strokeDasharray: "3 3", stroke: "#111827" } as const;
const AXIS_TICK = { fill: "#8494A7" } as const;
const AXIS_LINE = { stroke: "#111827" } as const;
const REF_LINE = { stroke: "#8494A7", strokeDasharray: "6 4", strokeOpacity: 0.5 } as const;
const CURSOR_STYLE = { fill: "rgba(255,255,255,0.03)" };

/* ── Tooltips ── */
function BarTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#111827] border border-[#1E2D47] rounded-lg px-3 py-2 text-sm">
      <p className="text-[#E1E7EF] font-medium">{d.label ?? d.shortName ?? d.league}</p>
      <p className="text-[#E1E7EF]">
        {d.hitRate}% ({d.correct}/{d.total})
        {d.total < 3 && <span className="text-[#8494A7] ml-1">(표본 부족)</span>}
      </p>
    </div>
  );
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827] border border-[#1E2D47] rounded-lg px-3 py-2 text-sm">
      <p className="text-[#E1E7EF] font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
}

/* ── Reusable bar chart renderer ── */
function RenderBarChart({ data, xKey }: { data: any[]; xKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={300} className="hidden md:block">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey={xKey} interval={0} tick={{ ...AXIS_TICK, fontSize: 12 }} axisLine={AXIS_LINE} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ ...AXIS_TICK, fontSize: 12 }} axisLine={AXIS_LINE} tickLine={false} tickFormatter={v => `${v}%`} />
        <ReferenceLine y={50} {...REF_LINE} />
        <Tooltip content={<BarTooltip />} cursor={CURSOR_STYLE} />
        <Bar dataKey="hitRate" radius={[6, 6, 0, 0]} animationDuration={800}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={getBarFill(entry.hitRate)} fillOpacity={entry.total < 3 ? 0.5 : 1} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function RenderBarChartMobile({ data, xKey }: { data: any[]; xKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={250} className="block md:hidden">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey={xKey} interval={0} tick={{ ...AXIS_TICK, fontSize: 10 }} axisLine={AXIS_LINE} tickLine={false} angle={-45} textAnchor="end" />
        <YAxis domain={[0, 100]} tick={{ ...AXIS_TICK, fontSize: 11 }} axisLine={AXIS_LINE} tickLine={false} tickFormatter={v => `${v}%`} />
        <ReferenceLine y={50} {...REF_LINE} />
        <Tooltip content={<BarTooltip />} cursor={CURSOR_STYLE} />
        <Bar dataKey="hitRate" radius={[6, 6, 0, 0]} animationDuration={800}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={getBarFill(entry.hitRate)} fillOpacity={entry.total < 3 ? 0.5 : 1} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#111827]/50 rounded-[14px] p-6 animate-pulse">
            <div className="h-4 bg-[#1E2D47] rounded w-20 mb-3 mx-auto" />
            <div className="h-8 bg-[#1E2D47] rounded w-24 mb-2 mx-auto" />
            <div className="h-3 bg-[#1E2D47] rounded w-16 mx-auto" />
          </div>
        ))}
      </div>
      {/* Tab skeleton */}
      <div className="bg-[#111827]/50 rounded-[14px] p-4 md:p-6 animate-pulse">
        <div className="flex gap-0 mb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-11 bg-[#1E2D47]/50 rounded-t" />
          ))}
        </div>
        <div className="h-[250px] md:h-[300px] bg-[#1E2D47]/30 rounded-[14px]" />
      </div>
      {/* Filter pills skeleton */}
      <div className="bg-[#111827]/50 rounded-[14px] p-4 md:p-6 animate-pulse">
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-[#1E2D47] rounded-full w-16" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-[72px] bg-[#1E2D47]/30 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Pill Button ── */
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition min-h-[34px] cursor-pointer border ${
        active
          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
          : "bg-[#111827] text-[#8494A7] border-[#1E2D47] hover:text-[#E1E7EF]"
      }`}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════ */
export default function DashboardSection() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("all");

  // Chart tab
  const [chartTab, setChartTab] = useState<ChartTab>("confidence");

  // Table filters
  const [filterLeague, setFilterLeague] = useState("전체");
  const [filterConf, setFilterConf] = useState(0); // 0 = all
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [showCount, setShowCount] = useState(10);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?period=${period}`)
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  // Reset table pagination on filter change
  useEffect(() => { setShowCount(10); }, [filterLeague, filterConf, sortMode, period]);

  /* ── Prepare chart data ── */
  const confData = data?.byConfidence ?? [];

  const allLeagueData = useMemo(() => {
    if (!data) return [];
    return [...data.byLeague]
      .sort((a, b) => {
        const aIsBig5 = BIG5.includes(a.league) ? 0 : 1;
        const bIsBig5 = BIG5.includes(b.league) ? 0 : 1;
        if (aIsBig5 !== bIsBig5) return aIsBig5 - bIsBig5;
        return b.total - a.total;
      })
      .map(l => ({ ...l, shortName: LEAGUE_SHORT[l.league] ?? l.league }));
  }, [data]);

  const trendData = useMemo(() =>
    data?.weekly_trend.map(w => ({
      week: w.week_label,
      overall: w.overall.hit_rate,
      highConf: w.high_confidence.total > 0 ? w.high_confidence.hit_rate : null,
    })) ?? []
  , [data]);

  /* ── Filter + sort predictions ── */
  const availableLeagues = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.recentPredictions.map(p => p.league).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const filteredPredictions = useMemo(() => {
    if (!data) return [];
    let preds = [...data.recentPredictions];

    if (filterLeague !== "전체") {
      const fullName = Object.entries(LEAGUE_SHORT).find(([, v]) => v === filterLeague)?.[0] ?? filterLeague;
      preds = preds.filter(p => p.league === fullName || p.league === filterLeague);
    }
    if (filterConf > 0) {
      preds = preds.filter(p => p.confidence === filterConf);
    }

    switch (sortMode) {
      case "confidence":
        preds.sort((a, b) => b.confidence - a.confidence || b.date.localeCompare(a.date));
        break;
      case "league":
        preds.sort((a, b) => a.league.localeCompare(b.league) || b.date.localeCompare(a.date));
        break;
      default: // latest
        preds.sort((a, b) => b.date.localeCompare(a.date));
    }

    return preds;
  }, [data, filterLeague, filterConf, sortMode]);

  const leaguePills = useMemo(() => {
    const shorts = availableLeagues.map(l => LEAGUE_SHORT[l] ?? l);
    return ["전체", ...shorts];
  }, [availableLeagues]);

  return (
    <FadeSection id="dashboard">
      <div className="border-t border-[#152035]" />
      <section className="bg-[#060B14] py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-[900px] mx-auto space-y-6 md:space-y-8">

          {/* ── Header ── */}
          <div className="text-center">
            <span className="section-label mb-3">ACCURACY</span>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="section-label" style={{border:'none',padding:0}}>LIVE DATA</span>
            </div>
            <h2 className="font-body font-bold text-[28px] md:text-[36px] tracking-[-0.5px] leading-[1.2] text-[#E1E7EF]">
              AI 적중률 라이브 트래커
            </h2>
            <p className="text-[#8494A7] mt-2 text-sm font-body">모든 예측은 Notion DB에 자동 기록됩니다</p>
          </div>

          {/* ── Period Filter ── */}
          <div className="flex justify-center gap-2">
            {(["7d", "30d", "all"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition font-body cursor-pointer min-h-[44px] ${
                  period === p
                    ? "bg-emerald-500 text-white"
                    : "bg-[#111827] text-[#8494A7] hover:bg-[#1E2D47]"
                }`}
              >
                {p === "7d" ? "7일" : p === "30d" ? "30일" : "전체"}
              </button>
            ))}
          </div>

          {loading ? <Skeleton /> : data && (
            <>
              {/* ── Summary Cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111827] border border-[#152035] rounded-[14px] p-5 md:p-6 text-center hover:border-[#1E2D47] transition-colors">
                  <div className="text-sm text-[#8494A7] mb-2 font-body">전체 적중률</div>
                  <div className="text-3xl font-bold text-[#E1E7EF] font-display">{data.overall.hitRate}%</div>
                  <div className="text-sm text-[#566378] mt-1 font-body">{data.overall.correct}/{data.overall.total}</div>
                </div>
                <div className="bg-[#111827] border border-[#152035] rounded-[14px] p-5 md:p-6 text-center hover:border-[#1E2D47] transition-colors">
                  <div className="text-sm text-[#8494A7] mb-2 font-body">⭐⭐⭐⭐+ 적중률</div>
                  <div className="text-3xl font-bold font-display text-gold-400">{data.highConfidence.hitRate}%</div>
                  <div className="text-sm text-[#566378] mt-1 font-body">{data.highConfidence.correct}/{data.highConfidence.total}</div>
                </div>
                <div className="bg-[#111827] border border-[#152035] rounded-[14px] p-5 md:p-6 text-center hover:border-[#1E2D47] transition-colors">
                  <div className="text-sm text-[#8494A7] mb-2 font-body">누적 분석</div>
                  <div className="text-3xl font-bold text-emerald-400 font-display">{data.overall.total}<span className="text-lg ml-1">경기</span></div>
                  <div className="text-sm text-[#566378] mt-1 font-body">판정 완료</div>
                </div>
              </div>

              {/* ── Chart Tabs ── */}
              <div className="bg-[#111827] border border-[#152035] rounded-[14px] overflow-hidden hover:border-[#1E2D47] transition-colors">
                {/* Tab buttons */}
                <div className="flex border-b border-[#152035]">
                  {(["confidence", "league", "trend"] as ChartTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setChartTab(tab)}
                      className={`flex-1 min-h-[44px] text-sm font-medium font-body transition cursor-pointer ${
                        chartTab === tab
                          ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5"
                          : "text-[#566378] hover:text-[#E1E7EF]"
                      }`}
                    >
                      {TAB_LABELS[tab]}
                    </button>
                  ))}
                </div>

                {/* Chart content with fade */}
                <div className="p-4 md:p-6">
                  <div key={chartTab} className="animate-[fadeIn_200ms_ease-in]">
                    {chartTab === "confidence" && (
                      <>
                        <RenderBarChart data={confData} xKey="label" />
                        <RenderBarChartMobile data={confData} xKey="label" />
                      </>
                    )}

                    {chartTab === "league" && (
                      <>
                        <RenderBarChart data={allLeagueData} xKey="shortName" />
                        <RenderBarChartMobile data={allLeagueData} xKey="shortName" />
                      </>
                    )}

                    {chartTab === "trend" && trendData.length > 0 && (
                      <>
                        {/* Desktop */}
                        <ResponsiveContainer width="100%" height={300} className="hidden md:block">
                          <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid {...GRID} />
                            <XAxis dataKey="week" tick={{ ...AXIS_TICK, fontSize: 12 }} axisLine={AXIS_LINE} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ ...AXIS_TICK, fontSize: 12 }} axisLine={AXIS_LINE} tickLine={false} tickFormatter={v => `${v}%`} />
                            <ReferenceLine y={50} {...REF_LINE} />
                            <Tooltip content={<TrendTooltip />} />
                            <Legend verticalAlign="bottom" iconType="circle" formatter={(v: string) => <span style={{ color: "#8494A7", fontSize: 12 }}>{v}</span>} />
                            <Line type="monotone" dataKey="overall" name="전체" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: "#10B981" }} activeDot={{ r: 6 }} connectNulls />
                            <Line type="monotone" dataKey="highConf" name="⭐4+" stroke="#FBBF24" strokeWidth={2} dot={{ r: 4, fill: "#FBBF24" }} activeDot={{ r: 6 }} connectNulls />
                          </LineChart>
                        </ResponsiveContainer>
                        {/* Mobile */}
                        <ResponsiveContainer width="100%" height={250} className="block md:hidden">
                          <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                            <CartesianGrid {...GRID} />
                            <XAxis dataKey="week" tick={{ ...AXIS_TICK, fontSize: 10 }} axisLine={AXIS_LINE} tickLine={false} angle={-30} textAnchor="end" />
                            <YAxis domain={[0, 100]} tick={{ ...AXIS_TICK, fontSize: 11 }} axisLine={AXIS_LINE} tickLine={false} tickFormatter={v => `${v}%`} />
                            <ReferenceLine y={50} {...REF_LINE} />
                            <Tooltip content={<TrendTooltip />} />
                            <Legend verticalAlign="bottom" iconType="circle" formatter={(v: string) => <span style={{ color: "#8494A7", fontSize: 11 }}>{v}</span>} />
                            <Line type="monotone" dataKey="overall" name="전체" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981" }} activeDot={{ r: 5 }} connectNulls />
                            <Line type="monotone" dataKey="highConf" name="⭐4+" stroke="#FBBF24" strokeWidth={2} dot={{ r: 3, fill: "#FBBF24" }} activeDot={{ r: 5 }} connectNulls />
                          </LineChart>
                        </ResponsiveContainer>
                      </>
                    )}

                    {chartTab === "trend" && trendData.length === 0 && (
                      <div className="h-[250px] flex items-center justify-center text-[#566378] text-sm">
                        트렌드 데이터가 아직 없습니다
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Predictions Section ── */}
              <div className="bg-[#111827] border border-[#152035] rounded-[14px] p-4 md:p-6 hover:border-[#1E2D47] transition-colors">
                <div className="font-body font-semibold text-lg mb-4 text-[#E1E7EF]">최근 예측 결과</div>

                {/* Filters */}
                <div className="space-y-3 mb-4">
                  {/* League pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {leaguePills.map(l => (
                      <Pill key={l} active={filterLeague === l} onClick={() => setFilterLeague(l)}>
                        {l}
                      </Pill>
                    ))}
                  </div>
                  {/* Confidence pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <Pill active={filterConf === 0} onClick={() => setFilterConf(0)}>전체</Pill>
                    {[1, 2, 3, 4, 5].map(n => (
                      <Pill key={n} active={filterConf === n} onClick={() => setFilterConf(n)}>
                        {"⭐".repeat(n)}
                      </Pill>
                    ))}
                  </div>
                  {/* Sort */}
                  <div className="flex gap-2">
                    {([["latest", "최신순"], ["confidence", "확신도순"], ["league", "리그순"]] as [SortMode, string][]).map(([mode, label]) => (
                      <Pill key={mode} active={sortMode === mode} onClick={() => setSortMode(mode)}>
                        {label}
                      </Pill>
                    ))}
                  </div>
                </div>

                {/* Desktop Table (md+) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="border-b border-[#1E2D47] text-[#8494A7] text-left">
                        <th className="py-2 pr-3">날짜</th>
                        <th className="py-2 pr-3">경기</th>
                        <th className="py-2 pr-3">리그</th>
                        <th className="py-2 pr-3">예측</th>
                        <th className="py-2 pr-3">확신도</th>
                        <th className="py-2 pr-3">결과</th>
                        <th className="py-2">적중</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPredictions.slice(0, showCount).map((pred, i) => (
                        <tr key={i} className="border-b border-[#152035] hover:bg-[#111827]/50 text-[#E1E7EF]">
                          <td className="py-2.5 pr-3 text-[#8494A7]">{formatDate(pred.date)}</td>
                          <td className="py-2.5 pr-3">
                            {pred.match}
                            {pred.isProOnly && (
                              <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-[#D4A853]/20 text-[#D4A853]">PRO</span>
                            )}
                          </td>
                          <td className="py-2.5 pr-3 text-[#8494A7]">{pred.league}</td>
                          <td className="py-2.5 pr-3">{pred.prediction}</td>
                          <td className="py-2.5 pr-3">{pred.confidenceLabel}</td>
                          <td className="py-2.5 pr-3 text-[#8494A7]">{pred.result || "-"}</td>
                          <td className="py-2.5">
                            {pred.isCorrect === true && <span className="text-emerald-400">✅</span>}
                            {pred.isCorrect === false && <span className="text-red-400">❌</span>}
                            {pred.isCorrect === null && <span className="text-[#566378]">⏳</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPredictions.length === 0 && (
                    <div className="text-center py-8 text-[#566378] text-sm">필터 조건에 맞는 결과가 없습니다</div>
                  )}
                </div>

                {/* Mobile Cards (< md) */}
                <div className="md:hidden space-y-3">
                  {filteredPredictions.slice(0, showCount).map((pred, i) => (
                    <div key={i} className="bg-[#060B14]/50 rounded-lg p-4 border border-[#152035]">
                      {/* Row 1: date, league, confidence */}
                      <div className="flex items-center gap-2 text-xs text-[#8494A7] mb-2">
                        <span>{formatDate(pred.date)}</span>
                        <span className="text-[#1E2D47]">|</span>
                        <span>{LEAGUE_SHORT[pred.league] ?? pred.league}</span>
                        <span className="text-[#1E2D47]">|</span>
                        <span>{pred.confidenceLabel}</span>
                        {pred.isProOnly && (
                          <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-[#D4A853]/20 text-[#D4A853] font-medium">PRO</span>
                        )}
                      </div>
                      {/* Row 2: match name */}
                      <div className="text-[#E1E7EF] font-medium text-sm mb-1.5">{pred.match}</div>
                      {/* Row 3: prediction */}
                      <div className="text-xs text-[#8494A7] mb-1">예측: {pred.prediction}</div>
                      {/* Row 4: result + icon */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#566378]">
                          {pred.result ? `결과: ${pred.result}` : "결과 대기 중"}
                        </span>
                        <span className="text-base">
                          {pred.isCorrect === true && <span className="text-emerald-400">✅</span>}
                          {pred.isCorrect === false && <span className="text-red-400">❌</span>}
                          {pred.isCorrect === null && <span className="text-[#566378]">⏳</span>}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredPredictions.length === 0 && (
                    <div className="text-center py-8 text-[#566378] text-sm">필터 조건에 맞는 결과가 없습니다</div>
                  )}
                </div>

                {/* Load More */}
                {showCount < filteredPredictions.length && (
                  <button
                    onClick={() => setShowCount(prev => prev + 10)}
                    className="w-full mt-4 py-3 text-sm text-[#8494A7] bg-[#111827]/50 hover:bg-[#1E2D47]/50 rounded-lg border border-[#152035] transition cursor-pointer font-body min-h-[44px]"
                  >
                    더보기 ({filteredPredictions.length - showCount}건 남음)
                  </button>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="text-center">
                <a
                  href="https://www.notion.so/c451c2a04e6b4a7d85d0b8771e278d05"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/50 hover:decoration-emerald-400 transition font-body"
                >
                  Notion에서 전 기록 검증 →
                </a>
              </div>
            </>
          )}
        </div>
      </section>
    </FadeSection>
  );
}
