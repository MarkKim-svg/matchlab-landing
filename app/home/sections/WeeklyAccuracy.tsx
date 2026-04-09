"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Donut from "@/components/ui/Donut";
import { TeamLogo, splitTeams } from "@/components/match-ui";

interface WeeklyTrend {
  week_label: string;
  overall: { hit_rate: number; correct: number; total: number };
  high_confidence: { hit_rate: number; correct: number; total: number };
}

interface RecentPrediction {
  date: string;
  match: string;
  league: string;
  prediction: string;
  confidence: number;
  result: string;
  isCorrect: boolean | null;
  homeTeamId?: string;
  awayTeamId?: string;
}

interface DashboardData {
  overall: { hitRate: number; correct: number; total: number };
  highConfidence: { hitRate: number; correct: number; total: number };
  weekly_trend: WeeklyTrend[];
  recentPredictions?: RecentPrediction[];
}

interface RecentMatch {
  id: string;
  match: string;
  league: string;
  prediction: string;
  result: string;
  isCorrect: string;
  homeTeamId?: string;
  awayTeamId?: string;
}

interface Props {
  dashboard: DashboardData | null;
  loading: boolean;
}

const EMERALD = "#10B981";
const GOLD = "#F59E0B";

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export default function WeeklyAccuracy({ dashboard, loading }: Props) {
  const [recentResults, setRecentResults] = useState<RecentMatch[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/predictions/${getDateStr(1)}`).then(r => r.json()),
          fetch(`/api/predictions/${getDateStr(2)}`).then(r => r.json()),
        ]);
        const all = [...(res1.matches ?? []), ...(res2.matches ?? [])];
        const judged = all.filter((m: RecentMatch) => m.isCorrect === "적중" || m.isCorrect === "미적중");
        // 적중 우선 정렬
        judged.sort((a: RecentMatch, b: RecentMatch) => {
          if (a.isCorrect === "적중" && b.isCorrect !== "적중") return -1;
          if (a.isCorrect !== "적중" && b.isCorrect === "적중") return 1;
          return 0;
        });
        setRecentResults(judged.slice(0, 3));
      } catch {
        // ignore
      } finally {
        setRecentLoading(false);
      }
    }
    fetchRecent();
  }, []);

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[16px]">📈</span>
          <span className="text-[14px] font-bold text-bg-100">이번 주 적중률</span>
        </div>
        <div className="flex gap-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-[100px] h-[100px] rounded-full" style={{ background: "#1A2332" }} />
              <div className="h-3 w-16 mt-2 rounded" style={{ background: "#263344" }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!dashboard || dashboard.overall.total === 0) {
    return (
      <section>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[16px]">📈</span>
          <span className="text-[14px] font-bold text-bg-100">이번 주 적중률</span>
        </div>
        <div className="text-center py-6 text-[14px] text-text-muted">
          아직 충분한 데이터가 없습니다
        </div>
      </section>
    );
  }

  const { overall, highConfidence } = dashboard;
  const hasHighConf = highConfidence.total > 0;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[16px]">📈</span>
          <span className="text-[14px] font-bold text-bg-100">이번 주 적중률</span>
        </div>
        <Link href="/dashboard" className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
          상세 →
        </Link>
      </div>

      {/* Donuts */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 flex justify-center">
          <Donut
            percent={overall.hitRate}
            color={EMERALD}
            label="전체"
            sub={`${overall.correct}/${overall.total}`}
            size={96}
            textSize={20}
          />
        </div>
        <div className="flex-1 flex justify-center">
          <Donut
            percent={hasHighConf ? highConfidence.hitRate : null}
            color={GOLD}
            label="⭐4+"
            sub={hasHighConf ? `${highConfidence.correct}/${highConfidence.total}` : "데이터 없음"}
            size={96}
            textSize={20}
          />
        </div>
      </div>

      {/* Recent results 3건 (적중 우선) */}
      <div className="border-t border-bg-border pt-3 mt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold text-text-secondary">최근 예측 결과</span>
        </div>

        {recentLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 rounded" style={{ background: "#1A2332" }} />
            ))}
          </div>
        ) : recentResults.length === 0 ? (
          <div className="text-center py-3 text-[12px] text-text-muted">아직 결과 없음</div>
        ) : (
          <div className="space-y-1.5">
            {recentResults.map((r) => {
              const isHit = r.isCorrect === "적중";
              const [home, away] = splitTeams(r.match);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg"
                  style={{ background: "#1A2332", overflow: "hidden" }}
                >
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: isHit ? "#05966920" : "#EF444420",
                      color: isHit ? "#34D399" : "#F87171",
                    }}
                  >
                    {isHit ? "✓" : "✗"}
                  </span>
                  <TeamLogo teamId={r.homeTeamId ?? ""} teamName={home} size={16} />
                  <span className="text-[11px] font-bold text-bg-100 truncate min-w-0">{home}</span>
                  <span className="text-[9px] text-text-muted shrink-0">vs</span>
                  <TeamLogo teamId={r.awayTeamId ?? ""} teamName={away} size={16} />
                  <span className="text-[11px] font-bold text-bg-100 truncate min-w-0">{away}</span>
                  {r.result && (
                    <span className="ml-auto shrink-0 font-mono-data text-[11px] font-bold text-bg-50">
                      {r.result}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Link
          href="/dashboard"
          className="block text-center mt-3 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          전체 결과 보기 →
        </Link>
      </div>
    </section>
  );
}
