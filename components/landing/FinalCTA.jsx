"use client";
import { useEffect, useState } from "react";
import FadeSection from "@/lib/FadeSection";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";
import { useHitRate } from "@/lib/useHitRate";

export default function FinalCTA() {
  const hitRate = useHitRate();
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || hitRate === null) return;
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
  }, [started, hitRate]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    const el = document.getElementById("final-cta");
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const display = hitRate === null ? "—%" : `${count.toFixed(1)}%`;

  return (
    <FadeSection>
      <div className="border-t border-[#152035]" />
      <section id="final-cta" className="bg-bg-900 py-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-[600px] mx-auto relative z-10">
          <div className="font-display font-bold text-[72px] md:text-[96px] leading-[0.9] tracking-[-4px] mb-4 text-gold-400">{display}</div>
          <h2 className="font-body font-bold text-2xl mb-3 text-[#E1E7EF] tracking-[-0.5px]">매일 아침, 분석이 카톡으로</h2>
          <p className="text-[15px] text-[#8494A7] mb-7 font-body">채널 추가만 하면 매일 경기 전 분석이 도착합니다</p>
          <a href={KAKAO_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex bg-emerald-500 hover:bg-emerald-700 text-white text-[15px] font-bold px-8 py-4 rounded-[14px] transition-all font-body">무료로 카톡 받기 →</a>
        </div>
      </section>
    </FadeSection>
  );
}
