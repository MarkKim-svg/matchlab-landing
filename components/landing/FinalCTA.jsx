"use client";
import { useEffect, useState } from "react";
import FadeSection from "@/lib/FadeSection";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";

export default function FinalCTA() {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!started) return;
    const target = 68; let c = 0; const step = target / (1500 / 16);
    const t = setInterval(() => { c += step; if (c >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(c)); }, 16);
    return () => clearInterval(t);
  }, [started]);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    const el = document.getElementById("final-cta");
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <FadeSection>
      <div className="neon-line" />
      <section id="final-cta" className="bg-bg-900 py-20 px-6 text-center relative overflow-hidden">
        <div className="bubble w-[60px] h-[60px] bg-emerald-500/[0.08] top-[20%] left-[15%]" style={{animation:"float1 7s ease-in-out infinite"}} />
        <div className="bubble w-[40px] h-[40px] bg-gold-400/[0.06] top-[50%] right-[20%]" style={{animation:"float2 5s ease-in-out infinite"}} />
        <div className="max-w-[600px] mx-auto relative z-10">
          <div className="font-outfit font-[800] text-[80px] md:text-[96px] leading-none mb-4 tracking-[-2px] gold-shimmer">{count}%</div>
          <h2 className="font-body font-bold text-2xl mb-3 text-[#F1F5F9]">매일 아침, 분석이 카톡으로</h2>
          <p className="text-base text-[#94A3B8] mb-7">채널 추가만 하면 매일 경기 전 분석이 도착합니다</p>
          <a href={KAKAO_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex bg-emerald-500 hover:bg-emerald-700 text-white text-base font-bold px-8 py-3.5 rounded-lg transition-all">무료로 시작하기</a>
          <div className="mt-4 text-[13px] text-[#64748B]">회원가입 필요 없음 · 완전 무료 · 언제든 구독 취소</div>
        </div>
      </section>
    </FadeSection>
  );
}
