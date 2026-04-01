"use client";
import { useEffect, useState } from "react";
import FadeSection from "@/lib/FadeSection";

function stars(n) {
  return "⭐".repeat(n);
}

function MatchCard({ match }) {
  return (
    <div className="bg-bg-800 border border-bg-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-emerald-500 text-sm font-bold">{stars(match.confidence)}</span>
      </div>
      <div className="text-[#F1F5F9] font-bold text-[14px] mb-1">{match.match}</div>
      <div className="text-[#64748B] text-[12px] mb-2">{match.league} · {match.date}</div>
      <div className="text-[12px] text-[#94A3B8] mb-1">AI: <span className="text-[#F1F5F9] font-semibold">{match.prediction}</span></div>
      <div className="font-mono-data font-bold text-emerald-500 text-[15px]">{match.confidenceLabel}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-bg-800 border border-bg-700 rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-bg-700 rounded w-16 mb-3" />
      <div className="h-4 bg-bg-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-bg-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-bg-700 rounded w-2/3 mb-2" />
      <div className="h-5 bg-bg-700 rounded w-12" />
    </div>
  );
}

export default function TodayPreview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/predictions/${today}`)
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const freeMatches = data?.matches?.filter(m => !m.isProOnly && m.confidence <= 3).slice(0, 2) ?? [];
  const proCount = data?.matches?.filter(m => m.confidence >= 4).length ?? 0;
  const totalCount = data?.totalCount ?? 0;

  return (
    <FadeSection>
      <section className="bg-bg-900 py-16 px-6">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-8">
            <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-emerald-500 mb-2">TODAY</div>
            <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-[#F1F5F9]">오늘의 분석 미리보기</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-12 text-[#94A3B8] text-sm">
              오늘은 분석 경기가 없습니다. 내일 다시 확인하세요!
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {freeMatches.map(m => <MatchCard key={m.id} match={m} />)}
                {freeMatches.length === 0 && (
                  <div className="col-span-full text-center py-8 text-[#94A3B8] text-sm">
                    무료 공개 경기가 없습니다
                  </div>
                )}
              </div>

              {proCount > 0 && (
                <div className="bg-bg-800 border border-bg-700 rounded-xl p-4 text-center">
                  <span className="text-[#94A3B8] text-sm">🔒 <span className="font-bold text-gold-400">{proCount}건</span>의 고확신 경기는 Pro에서만</span>
                </div>
              )}

              <div className="text-center mt-6">
                <a href="/login"
                  className="text-sm text-emerald-400 underline hover:text-emerald-300 transition-colors font-body">
                  전체 분석 보기 →
                </a>
              </div>
            </>
          )}
        </div>
      </section>
    </FadeSection>
  );
}
