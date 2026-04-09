"use client";
import { useEffect, useState } from "react";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";
import { useHitRate } from "@/lib/useHitRate";

export default function Hero() {
  const hitRate = useHitRate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (hitRate === null) return;
    const target = hitRate;
    const duration = 1500;
    const step = target / (duration / 16);
    let c = 0;
    const t = setInterval(() => {
      c += step;
      if (c >= target) { setCount(target); clearInterval(t); }
      else setCount(parseFloat(c.toFixed(1)));
    }, 16);
    return () => clearInterval(t);
  }, [hitRate]);

  const display = hitRate === null ? "—%" : `${count.toFixed(1)}%`;

  return (
    <section className="bg-bg-900 lab-grid px-6 py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-[900px] mx-auto text-center relative z-10">
        <h1 className="font-body font-extrabold text-[32px] md:text-[48px] lg:text-[56px] leading-[1.15] tracking-[-0.5px] text-white mb-6">
          매일 아침, AI가 고른 승부 예측
        </h1>

        <p className="font-body font-normal text-[14px] md:text-[15px] text-[#6B7280] max-w-[560px] mx-auto mb-10 break-keep leading-[1.7]">
          지난 4주 고확신 경기 적중률 {display} · 누적 500경기+ 분석
        </p>

        <div className="flex items-baseline gap-3 justify-center mb-10">
          <span className="font-display font-bold text-[72px] md:text-[96px] leading-[0.9] tracking-[-4px] text-white">{display}</span>
          <span className="font-body font-normal text-sm text-[#566378] tracking-[0.5px]">고확신 경기 평균 적중률</span>
        </div>

        <div className="flex flex-col items-center gap-3 mb-6">
          <a href="/login"
            className="bg-[#059669] hover:bg-[#047857] text-white text-lg font-bold px-8 py-4 rounded-[14px] transition-all font-body">
            무료로 시작하기
          </a>
          <a href="/matches/today"
            className="text-sm text-[#8494A7] underline hover:text-white transition-colors font-body">
            분석 데이터 보기 →
          </a>
        </div>
      </div>
    </section>
  );
}
