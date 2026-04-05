"use client";
import { useEffect, useState } from "react";
import FadeSection from "@/lib/FadeSection";

export default function FomoBanner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard?period=7d")
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Hide if no high-confidence data
  if (!loading && (!data?.highConfidence || data.highConfidence.total === 0)) return null;

  return (
    <FadeSection>
      <div className="border-t border-[#152035]" />
      <section className="bg-bg-900 py-6 px-6">
        <div className="max-w-[700px] mx-auto">
          {loading ? (
            <div className="bg-[#111827] rounded-[14px] p-4 border-l-[3px] border-gold-400 animate-pulse">
              <div className="h-4 bg-[#1E2D47] rounded w-48 mb-2" />
              <div className="h-6 bg-[#1E2D47] rounded w-32 mb-2" />
              <div className="h-4 bg-[#1E2D47] rounded w-40" />
            </div>
          ) : (
            <div className="bg-[#111827] rounded-[14px] p-4 border-l-[3px] border-gold-400">
              <div className="text-[#8494A7] text-[14px] mb-1">🔒 지난 7일 유료 전용 고확신 경기</div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono-data font-bold text-[20px] text-gold-400">
                  {data.highConfidence.correct} / {data.highConfidence.total}
                </span>
                <span className="font-mono-data font-bold text-[14px]">적중</span>
                <span className="font-mono-data font-bold text-[20px] text-emerald-500">
                  ({data.highConfidence.hitRate}%)
                </span>
              </div>
              <div className="text-[#8494A7] text-[14px]">이 결과를 매일 받아보세요</div>
            </div>
          )}
        </div>
      </section>
    </FadeSection>
  );
}
