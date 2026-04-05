"use client";
import { useEffect, useState } from "react";
import FadeSection from "@/lib/FadeSection";

function stars(n) {
  return "⭐".repeat(n);
}

function MatchCard({ match }) {
  return (
    <div className="bg-[#111827] border border-[#152035] rounded-[14px] p-4 hover:border-[#1E2D47] transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-emerald-500 text-sm font-bold">{stars(match.confidence)}</span>
      </div>
      <div className="text-[#E1E7EF] font-bold text-[14px] mb-1">{match.match}</div>
      <div className="text-[#566378] text-[12px] mb-2">{match.league} · {match.date}</div>
      <div className="text-[12px] text-[#8494A7] mb-1">AI: <span className="text-[#E1E7EF] font-semibold">{match.prediction}</span></div>
      <div className="font-mono-data font-bold text-emerald-500 text-[15px]">{match.confidenceLabel}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#111827] border border-[#152035] rounded-[14px] p-4 animate-pulse">
      <div className="h-4 bg-[#1E2D47] rounded w-16 mb-3" />
      <div className="h-4 bg-[#1E2D47] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[#1E2D47] rounded w-1/2 mb-2" />
      <div className="h-3 bg-[#1E2D47] rounded w-2/3 mb-2" />
      <div className="h-5 bg-[#1E2D47] rounded w-12" />
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
      <div className="border-t border-[#152035]" />
      <section className="bg-bg-900 py-16 px-6">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-8">
            <span className="section-label mb-3">TODAY</span>
            <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-[#E1E7EF]">오늘의 분석 미리보기</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-12 text-[#8494A7] text-sm">
              오늘은 분석 경기가 없습니다. 내일 다시 확인하세요!
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {freeMatches.map(m => <MatchCard key={m.id} match={m} />)}
                {freeMatches.length === 0 && (
                  <div className="col-span-full text-center py-8 text-[#8494A7] text-sm">
                    무료 공개 경기가 없습니다
                  </div>
                )}
              </div>

              {proCount > 0 && (
                <div className="bg-[#111827] border border-[#152035] rounded-[14px] p-4 text-center">
                  <span className="text-[#8494A7] text-sm">🔒 <span className="font-bold text-gold-400">{proCount}건</span>의 고확신 경기는 Pro에서만</span>
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
