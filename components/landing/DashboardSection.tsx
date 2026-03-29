"use client";
import { useState, useEffect } from "react";
import FadeSection from "@/lib/FadeSection";

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
}

const BIG5 = ["프리미어리그", "라리가", "세리에A", "분데스리가", "리그1"];

function getBarColor(hitRate: number): string {
  if (hitRate >= 55) return "bg-emerald-500";
  if (hitRate >= 45) return "bg-yellow-500";
  return "bg-red-500";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function BarRow({ label, hitRate, correct, total, labelWidth = "w-24" }: {
  label: string; hitRate: number; correct: number; total: number; labelWidth?: string;
}) {
  const isSampleLow = total < 3;
  return (
    <div className={`flex items-center gap-3 ${isSampleLow ? "opacity-50" : ""}`}>
      <div className={`${labelWidth} flex-shrink-0 text-sm text-[#94A3B8] text-right font-body`}>{label}</div>
      <div className="flex-1 bg-[#334155]/50 rounded-full h-8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(hitRate)}`}
          style={{ width: `${Math.max(hitRate, 2)}%` }}
        />
      </div>
      <div className="w-36 text-right text-sm text-[#94A3B8] font-body whitespace-nowrap">
        {hitRate}% ({correct}/{total})
        {isSampleLow && <span className="text-xs text-[#64748B] ml-1">(표본 부족)</span>}
      </div>
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
      <div className="space-y-3 mt-8 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 bg-[#334155] rounded w-20" />
            <div className="flex-1 h-8 bg-[#334155] rounded-full" />
            <div className="h-4 bg-[#334155] rounded w-24" />
          </div>
        ))}
      </div>
      <div className="space-y-2 mt-8 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-12 bg-[#334155]/50 rounded" />
        ))}
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
                <div className="bg-[#1E293B]/50 backdrop-blur border border-[#334155]/50 rounded-xl p-6 text-center neon-card card-hover">
                  <div className="text-sm text-[#94A3B8] mb-2 font-body">전체 적중률</div>
                  <div className="text-3xl font-bold text-[#F1F5F9] font-display">{data.overall.hitRate}%</div>
                  <div className="text-sm text-[#64748B] mt-1 font-body">{data.overall.correct}/{data.overall.total}</div>
                </div>
                <div className="bg-[#1E293B]/50 backdrop-blur border border-[#334155]/50 rounded-xl p-6 text-center neon-card card-hover">
                  <div className="text-sm text-[#94A3B8] mb-2 font-body">⭐⭐⭐⭐+ 적중률</div>
                  <div className="text-3xl font-bold font-display gold-shimmer">{data.highConfidence.hitRate}%</div>
                  <div className="text-sm text-[#64748B] mt-1 font-body">{data.highConfidence.correct}/{data.highConfidence.total}</div>
                </div>
                <div className="bg-[#1E293B]/50 backdrop-blur border border-[#334155]/50 rounded-xl p-6 text-center neon-card card-hover">
                  <div className="text-sm text-[#94A3B8] mb-2 font-body">경기 분석</div>
                  <div className="text-3xl font-bold text-emerald-400 font-display">{data.overall.total}경기</div>
                  <div className="text-sm text-[#64748B] mt-1 font-body">판정 완료</div>
                </div>
              </div>

              {/* Confidence Bar Chart */}
              <div className="bg-[#1E293B]/50 backdrop-blur border border-[#334155]/50 rounded-xl p-6 mb-4 neon-card">
                <div className="font-body font-semibold text-lg mb-4 text-[#F1F5F9]">확신도별 적중률</div>
                <div className="flex flex-col gap-3">
                  {data.byConfidence.map(c => (
                    <BarRow key={c.stars} label={c.label} hitRate={c.hitRate} correct={c.correct} total={c.total} />
                  ))}
                </div>
              </div>

              {/* League Bar Charts */}
              <div className="bg-[#1E293B]/50 backdrop-blur border border-[#334155]/50 rounded-xl p-6 mb-4 neon-card">
                <div className="font-body font-semibold text-lg mb-4 text-[#F1F5F9]">5대 리그</div>
                <div className="flex flex-col gap-3">
                  {leagues.sort((a, b) => b.total - a.total).map(l => (
                    <BarRow key={l.league} label={l.league} hitRate={l.hitRate} correct={l.correct} total={l.total} labelWidth="w-28" />
                  ))}
                </div>

                {cups.length > 0 && (
                  <>
                    <div className="font-body font-semibold text-lg mb-4 mt-8 text-[#F1F5F9]">컵 &amp; 기타</div>
                    <div className="flex flex-col gap-3">
                      {cups.sort((a, b) => b.total - a.total).map(l => (
                        <BarRow key={l.league} label={l.league} hitRate={l.hitRate} correct={l.correct} total={l.total} labelWidth="w-28" />
                      ))}
                    </div>
                  </>
                )}
              </div>

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
