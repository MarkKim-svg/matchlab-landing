"use client";
import { useState, useEffect } from "react";
import FadeSection from "@/lib/FadeSection";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine, Cell,
} from "recharts";

interface WeeklyTrend {
  week_label: string;
  week_start: string;
  overall: { hit_rate: number; correct: number; total: number };
  high_confidence: { hit_rate: number; correct: number; total: number };
}

interface DashboardData {
  overall: { hitRate: number; correct: number; total: number };
  highConfidence: { hitRate: number; correct: number; total: number };
  byLeague: Array<{ league: string; hitRate: number; correct: number; total: number }>;
  byConfidence: Array<{ stars: number; label: string; hitRate: number; correct: number; total: number }>;
  recentPredictions: Array<{
    date: string;
    match: string;
    league: string;
    prediction: string;
    confidence: number;
    confidenceLabel: string;
    result: string;
    isCorrect: boolean | null;
    isProOnly: boolean;
  }>;
  weekly_trend: WeeklyTrend[];
}

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

function getBarFill(hitRate: number): string {
  if (hitRate >= 55) return "#10B981";
  if (hitRate >= 45) return "#FBBF24";
  return "#EF4444";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8 },
  labelStyle: { color: "#F9FAFB" },
  itemStyle: { color: "#F9FAFB" },
};

/* ── Custom Tooltip for bar charts ── */
function BarTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1F2937] border border-[#374151] rounded-lg px-3 py-2 text-sm">
      <p className="text-[#F9FAFB] font-medium">{d.label ?? d.shortName ?? d.league}</p>
      <p className="text-[#F9FAFB]">
        {d.hitRate}% ({d.correct}/{d.total})
        {d.total < 3 && <span className="text-[#9CA3AF] ml-1">(표본 부족)</span>}
      </p>
    </div>
  );
}

/* ── Custom Tooltip for trend line ── */
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1F2937] border border-[#374151] rounded-lg px-3 py-2 text-sm">
      <p className="text-[#F9FAFB] font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#1E293B]/50 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-[#334155] rounded w-20 mb-3" />
            <div className="h-8 bg-[#334155] rounded w-24 mb-2" />
            <div className="h-3 bg-[#334155] rounded w-16" />
          </div>
        ))}
      </div>
      <div className="mt-8 animate-pulse">
        <div className="h-[300px] bg-[#334155]/30 rounded-xl" />
      </div>
      <div className="mt-4 animate-pulse">
        <div className="h-[300px] bg-[#334155]/30 rounded-xl" />
      </div>
      <div className="mt-4 animate-pulse">
        <div className="h-[300px] bg-[#334155]/30 rounded-xl" />
      </div>
    </>
  );
}

export default function DashboardSection() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("all");
  const [showCount, setShowCount] = useState(10);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?period=${period}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
        setShowCount(10);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const leagues = data?.byLeague.filter(l => BIG5.includes(l.league)) ?? [];
  const cups = data?.byLeague.filter(l => !BIG5.includes(l.league)) ?? [];

  // Prepare chart data
  const confData = data?.byConfidence.map(c => ({
    ...c,
    label: c.label,
  })) ?? [];

  const leagueData = (arr: typeof leagues) =>
    arr.sort((a, b) => b.total - a.total).map(l => ({
      ...l,
      shortName: LEAGUE_SHORT[l.league] ?? l.league,
    }));

  const trendData = data?.weekly_trend.map(w => ({
    week: w.week_label,
    overall: w.overall.hit_rate,
    highConf: w.high_confidence.total > 0 ? w.high_confidence.hit_rate : null,
  })) ?? [];

  return (
    <FadeSection id="dashboard">
      <div className="neon-line" />
      <section className="bg-[#0F172A] py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-emerald-500 mb-2">ACCURACY</div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-500 text-xs font-mono-data">LIVE DATA</span>
            </div>
            <h2 className="font-body font-bold text-[28px] md:text-[36px] tracking-[-0.5px] leading-[1.2] text-[#F1F5F9]">
              AI 적중률 라이브 트래커
            </h2>
            <p className="text-[#94A3B8] mt-2 text-sm font-body">모든 예측은 Notion DB에 자동 기록됩니다</p>
          </div>

          {/* Period Filter */}
          <div className="flex justify-center gap-2 mb-8">
            {(["7d", "30d", "all"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition font-body cursor-pointer ${
                  period === p
                    ? "bg-emerald-500 text-white"
                    : "bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]"
                }`}
              >
                {p === "7d" ? "7일" : p === "30d" ? "30일" : "전체"}
              </button>
            ))}
          </div>

          {loading ? <Skeleton /> : data && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1E293B]/50 backdrop-blur border border-emerald-500/20 rounded-xl p-6 text-center neon-card card-hover">
                  <div className="text-sm text-[#94A3B8] mb-2 font-body">전체 적중률</div>
                  <div className="text-3xl font-bold text-[#F1F5F9] font-display">{data.overall.hitRate}%</div>
                  <div className="text-sm text-[#64748B] mt-1 font-body">{data.overall.correct}/{data.overall.total}</div>
                </div>
                <div className="bg-[#1E293B]/50 backdrop-blur border border-emerald-500/20 rounded-xl p-6 text-center neon-card card-hover">
                  <div className="text-sm text-[#94A3B8] mb-2 font-body">⭐⭐⭐⭐+ 적중률</div>
                  <div className="text-3xl font-bold font-display gold-shimmer">{data.highConfidence.hitRate}%</div>
                  <div className="text-sm text-[#64748B] mt-1 font-body">{data.highConfidence.correct}/{data.highConfidence.total}</div>
                </div>
                <div className="bg-[#1E293B]/50 backdrop-blur border border-emerald-500/20 rounded-xl p-6 text-center neon-card card-hover">
                  <div className="text-sm text-[#94A3B8] mb-2 font-body">누적 분석</div>
                  <div className="text-3xl font-bold text-emerald-400 font-display">{data.overall.total}<span className="text-lg ml-1">경기</span></div>
                  <div className="text-sm text-[#64748B] mt-1 font-body">판정 완료</div>
                </div>
              </div>

              {/* 3-1. Confidence Bar Chart */}
              <div className="bg-[#1E293B]/50 backdrop-blur border border-[#334155]/50 rounded-xl p-6 mb-4 neon-card">
                <div className="font-body font-semibold text-lg mb-4 text-[#F1F5F9]">확신도별 적중률</div>
                <ResponsiveContainer width="100%" height={300} className="md:block hidden">
                  <BarChart data={confData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 13 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} tickFormatter={v => `${v}%`} />
                    <ReferenceLine y={50} stroke="#9CA3AF" strokeDasharray="6 4" strokeOpacity={0.5} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="hitRate" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {confData.map((entry, idx) => (
                        <Cell key={idx} fill={getBarFill(entry.hitRate)} fillOpacity={entry.total < 3 ? 0.5 : 1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={250} className="md:hidden block">
                  <BarChart data={confData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} tickFormatter={v => `${v}%`} />
                    <ReferenceLine y={50} stroke="#9CA3AF" strokeDasharray="6 4" strokeOpacity={0.5} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="hitRate" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {confData.map((entry, idx) => (
                        <Cell key={idx} fill={getBarFill(entry.hitRate)} fillOpacity={entry.total < 3 ? 0.5 : 1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 3-2. League Bar Charts */}
              <div className="bg-[#1E293B]/50 backdrop-blur border border-[#334155]/50 rounded-xl p-6 mb-4 neon-card">
                <div className="font-body font-semibold text-lg mb-4 text-[#F1F5F9]">5대 리그</div>
                <ResponsiveContainer width="100%" height={300} className="md:block hidden">
                  <BarChart data={leagueData(leagues)} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="shortName" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} tickFormatter={v => `${v}%`} />
                    <ReferenceLine y={50} stroke="#9CA3AF" strokeDasharray="6 4" strokeOpacity={0.5} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="hitRate" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {leagueData(leagues).map((entry, idx) => (
                        <Cell key={idx} fill={getBarFill(entry.hitRate)} fillOpacity={entry.total < 3 ? 0.5 : 1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={250} className="md:hidden block">
                  <BarChart data={leagueData(leagues)} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="shortName" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} tickFormatter={v => `${v}%`} />
                    <ReferenceLine y={50} stroke="#9CA3AF" strokeDasharray="6 4" strokeOpacity={0.5} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="hitRate" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {leagueData(leagues).map((entry, idx) => (
                        <Cell key={idx} fill={getBarFill(entry.hitRate)} fillOpacity={entry.total < 3 ? 0.5 : 1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {cups.length > 0 && (
                  <>
                    <div className="font-body font-semibold text-lg mb-4 mt-8 text-[#F1F5F9]">컵 &amp; 기타</div>
                    <ResponsiveContainer width="100%" height={300} className="md:block hidden">
                      <BarChart data={leagueData(cups)} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                        <XAxis dataKey="shortName" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} tickFormatter={v => `${v}%`} />
                        <ReferenceLine y={50} stroke="#9CA3AF" strokeDasharray="6 4" strokeOpacity={0.5} />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                        <Bar dataKey="hitRate" radius={[6, 6, 0, 0]} animationDuration={800}>
                          {leagueData(cups).map((entry, idx) => (
                            <Cell key={idx} fill={getBarFill(entry.hitRate)} fillOpacity={entry.total < 3 ? 0.5 : 1} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer width="100%" height={250} className="md:hidden block">
                      <BarChart data={leagueData(cups)} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                        <XAxis dataKey="shortName" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} tickFormatter={v => `${v}%`} />
                        <ReferenceLine y={50} stroke="#9CA3AF" strokeDasharray="6 4" strokeOpacity={0.5} />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                        <Bar dataKey="hitRate" radius={[6, 6, 0, 0]} animationDuration={800}>
                          {leagueData(cups).map((entry, idx) => (
                            <Cell key={idx} fill={getBarFill(entry.hitRate)} fillOpacity={entry.total < 3 ? 0.5 : 1} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>

              {/* 3-3. Trend Line Chart */}
              {trendData.length > 0 && (
                <div className="bg-[#1E293B]/50 backdrop-blur border border-[#334155]/50 rounded-xl p-6 mb-4 neon-card">
                  <div className="font-body font-semibold text-lg mb-4 text-[#F1F5F9]">주간 적중률 트렌드</div>
                  <ResponsiveContainer width="100%" height={300} className="md:block hidden">
                    <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                      <XAxis dataKey="week" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} tickFormatter={v => `${v}%`} />
                      <ReferenceLine y={50} stroke="#9CA3AF" strokeDasharray="6 4" strokeOpacity={0.5} />
                      <Tooltip content={<TrendTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value: string) => <span style={{ color: "#9CA3AF", fontSize: 12 }}>{value}</span>}
                      />
                      <Line type="monotone" dataKey="overall" name="전체" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: "#10B981" }} activeDot={{ r: 6 }} connectNulls />
                      <Line type="monotone" dataKey="highConf" name="⭐4+" stroke="#FBBF24" strokeWidth={2} dot={{ r: 4, fill: "#FBBF24" }} activeDot={{ r: 6 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={250} className="md:hidden block">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                      <XAxis dataKey="week" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} tickFormatter={v => `${v}%`} />
                      <ReferenceLine y={50} stroke="#9CA3AF" strokeDasharray="6 4" strokeOpacity={0.5} />
                      <Tooltip content={<TrendTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value: string) => <span style={{ color: "#9CA3AF", fontSize: 11 }}>{value}</span>}
                      />
                      <Line type="monotone" dataKey="overall" name="전체" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981" }} activeDot={{ r: 5 }} connectNulls />
                      <Line type="monotone" dataKey="highConf" name="⭐4+" stroke="#FBBF24" strokeWidth={2} dot={{ r: 3, fill: "#FBBF24" }} activeDot={{ r: 5 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent Predictions Table - Desktop */}
              <div className="bg-[#1E293B]/50 backdrop-blur border border-[#334155]/50 rounded-xl p-6 neon-card">
                <div className="font-body font-semibold text-lg mb-4 text-[#F1F5F9]">최근 예측 결과</div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="border-b border-[#334155] text-[#94A3B8] text-left">
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
                      {data.recentPredictions.slice(0, showCount).map((pred, i) => (
                        <tr key={i} className="border-b border-[#1E293B] hover:bg-[#1E293B]/50 text-[#E2E8F0]">
                          <td className="py-2.5 pr-3 text-[#94A3B8]">{formatDate(pred.date)}</td>
                          <td className="py-2.5 pr-3">
                            {pred.match}
                            {pred.isProOnly && (
                              <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-[#D4A853]/20 text-[#D4A853]">PRO</span>
                            )}
                          </td>
                          <td className="py-2.5 pr-3 text-[#94A3B8]">{pred.league}</td>
                          <td className="py-2.5 pr-3">{pred.prediction}</td>
                          <td className="py-2.5 pr-3">{pred.confidenceLabel}</td>
                          <td className="py-2.5 pr-3 text-[#94A3B8]">{pred.result || "-"}</td>
                          <td className="py-2.5">
                            {pred.isCorrect === true && <span className="text-emerald-400">✅</span>}
                            {pred.isCorrect === false && <span className="text-red-400">❌</span>}
                            {pred.isCorrect === null && <span className="text-[#64748B]">⏳</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden">
                  {data.recentPredictions.slice(0, showCount).map((pred, i) => (
                    <div key={i} className="bg-[#1E293B]/30 rounded-lg p-4 mb-3 border border-[#334155]/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-white font-medium">{pred.match}</span>
                          {pred.isProOnly && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-[#D4A853]/20 text-[#D4A853]">PRO</span>
                          )}
                        </div>
                        <span>
                          {pred.isCorrect === true && <span className="text-emerald-400">✅</span>}
                          {pred.isCorrect === false && <span className="text-red-400">❌</span>}
                          {pred.isCorrect === null && <span className="text-[#64748B]">⏳</span>}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-[#94A3B8]">
                        <span>{formatDate(pred.date)}</span>
                        <span>{pred.league}</span>
                        <span>{pred.prediction}</span>
                        <span>{pred.confidenceLabel}</span>
                      </div>
                      {pred.result && <div className="text-xs text-[#64748B] mt-1">결과: {pred.result}</div>}
                    </div>
                  ))}
                </div>

                {/* Load More */}
                {showCount < (data.recentPredictions.length ?? 0) && (
                  <button
                    onClick={() => setShowCount(prev => prev + 10)}
                    className="w-full mt-4 py-3 text-sm text-[#94A3B8] bg-[#1E293B]/50 hover:bg-[#334155]/50 rounded-lg border border-[#334155]/50 transition cursor-pointer font-body"
                  >
                    더보기 ({data.recentPredictions.length - showCount}건 남음)
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="text-center mt-6">
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
