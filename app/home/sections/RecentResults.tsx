"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeamLogo, splitTeams } from "@/components/match-ui";

interface Match {
  id: string;
  match: string;
  league: string;
  prediction: string;
  result: string;
  isCorrect: string;
  homeTeamId?: string;
  awayTeamId?: string;
}

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export default function RecentResults({ maxItems = 6 }: { maxItems?: number }) {
  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const yesterday = getDateStr(1);

  useEffect(() => {
    async function fetchResults() {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/predictions/${getDateStr(1)}`).then(r => r.json()),
          fetch(`/api/predictions/${getDateStr(2)}`).then(r => r.json()),
        ]);
        const all = [...(res1.matches ?? []), ...(res2.matches ?? [])];
        const judged = all.filter((m: Match) => m.isCorrect === "적중" || m.isCorrect === "미적중");
        setResults(judged.slice(0, maxItems));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[16px]">📋</span>
          <span className="text-[14px] font-bold text-bg-100">최근 예측 결과</span>
        </div>
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl p-3" style={{ background: "#1A2332" }}>
              <div className="h-4 rounded w-40 mb-1" style={{ background: "#263344" }} />
              <div className="h-3 rounded w-28" style={{ background: "#263344" }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[16px]">📋</span>
          <span className="text-[14px] font-bold text-bg-100">최근 예측 결과</span>
        </div>
        <div className="text-center py-6 text-[14px] text-text-muted">
          아직 결과가 나오지 않았습니다
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[16px]">📋</span>
          <span className="text-[14px] font-bold text-bg-100">최근 예측 결과</span>
        </div>
        <Link href="/dashboard" className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
          전체 결과 보기 →
        </Link>
      </div>

      <div className="space-y-2">
        {results.map((r) => {
          const isHit = r.isCorrect === "적중";
          const [home, away] = splitTeams(r.match);

          return (
            <div
              key={r.id}
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: "#1A2332", border: "1px solid #263344" }}
            >
              {/* Result badge */}
              <span
                className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-bold"
                style={{
                  background: isHit ? "#05966920" : "#EF444420",
                  color: isHit ? "#34D399" : "#F87171",
                  border: isHit ? "1px solid #05966944" : "1px solid #EF444444",
                }}
              >
                {isHit ? "✓" : "✗"}
              </span>

              {/* Teams + info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <TeamLogo teamId={r.homeTeamId ?? ""} teamName={home} size={18} />
                  <span className="text-[13px] font-semibold text-bg-100 truncate">{home}</span>
                  <span className="text-[10px] text-text-muted">vs</span>
                  <TeamLogo teamId={r.awayTeamId ?? ""} teamName={away} size={18} />
                  <span className="text-[13px] font-semibold text-bg-100 truncate">{away}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-text-muted">예측: {r.prediction}</span>
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: isHit ? "#05966920" : "#EF444420",
                      color: isHit ? "#34D399" : "#F87171",
                    }}
                  >
                    {isHit ? "적중" : "미적중"}
                  </span>
                </div>
              </div>

              {/* Score */}
              {r.result && (
                <span className="shrink-0 font-mono-data text-[16px] font-bold text-bg-50">
                  {r.result}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
