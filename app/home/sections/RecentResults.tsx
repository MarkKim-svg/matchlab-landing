"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Match {
  id: string;
  match: string;
  league: string;
  prediction: string;
  result: string;
  isCorrect: string;
}

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export default function RecentResults() {
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
        setResults(judged.slice(0, 6));
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
      <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[16px]">📋</span>
          <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>최근 예측 결과</span>
        </div>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full" style={{ background: "#262626" }} />
              <div className="flex-1">
                <div className="h-4 rounded w-40 mb-1" style={{ background: "#262626" }} />
                <div className="h-3 rounded w-28" style={{ background: "#262626" }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[16px]">📋</span>
          <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>최근 예측 결과</span>
        </div>
        <div className="text-center py-6 text-[14px]" style={{ color: "#64748B" }}>
          아직 결과가 나오지 않았습니다
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[16px]">📋</span>
          <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>최근 예측 결과</span>
        </div>
        <Link href={`/matches/${yesterday}`} className="text-[12px] font-semibold" style={{ color: "#10B981" }}>
          더 보기 →
        </Link>
      </div>

      <div>
        {results.map((r, i) => {
          const isHit = r.isCorrect === "적중";
          const isLast = i === results.length - 1;

          return (
            <div
              key={r.id}
              className="flex items-center gap-2.5 py-2.5"
              style={{ borderBottom: isLast ? "none" : "1px solid #1a1a1a" }}
            >
              {/* Icon */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                style={{
                  background: isHit ? "#052e16" : "#2c0b0b",
                  color: isHit ? "#10B981" : "#EF4444",
                }}
              >
                {isHit ? "✓" : "✗"}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold" style={{ color: "#d4d4d4" }}>{r.match}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "#737373" }}>
                  예측: {r.prediction} → {isHit ? "적중" : "미적중"}
                </div>
              </div>

              {/* Score */}
              {r.result && (
                <span className="font-mono-data text-[13px] ml-auto shrink-0" style={{ color: "#a3a3a3" }}>
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
