"use client";
import { useEffect, useState } from "react";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";

const LEAGUES = ["EPL","La Liga","Serie A","Bundesliga","Ligue 1","UCL","UEL"];

const BUBBLES = [
  { w:"w-64 h-64", bg:"bg-emerald-500/[0.04]", pos:"top-[5%] left-[2%]", anim:"float-slow 12s" },
  { w:"w-40 h-40", bg:"bg-emerald-400/[0.06]", pos:"top-[60%] right-[5%]", anim:"float-medium 8s" },
  { w:"w-20 h-20", bg:"bg-gold-400/[0.08]", pos:"top-[25%] right-[20%]", anim:"float-fast 6s" },
  { w:"w-32 h-32", bg:"bg-emerald-500/[0.05]", pos:"bottom-[10%] left-[15%]", anim:"float-medium 10s" },
  { w:"w-16 h-16", bg:"bg-gold-400/[0.06]", pos:"top-[40%] left-[30%]", anim:"float-slow 14s" },
  { w:"w-24 h-24", bg:"bg-emerald-400/[0.04]", pos:"top-[15%] right-[35%]", anim:"float-fast 9s" },
];

export default function Hero() {
  const [count, setCount] = useState(0);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    const target = 68, step = target / (1500 / 16);
    let c = 0;
    const t = setInterval(() => { c += step; if (c >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(c)); }, 16);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 600);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-bg-900 lab-grid px-6 py-24 md:py-32 relative overflow-hidden">
      {BUBBLES.map((b, i) => (
        <div key={i} className={`bubble ${b.w} ${b.bg} ${b.pos}`} style={{animation:`${b.anim} ease-in-out infinite`}} />
      ))}

      <div className="max-w-[900px] mx-auto text-center relative z-10">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {LEAGUES.map((l) => <span key={l} className="border border-bg-700 text-[#94A3B8] text-[11px] font-semibold px-3 py-1 rounded-full">{l}</span>)}
        </div>

        {/* Headline — font hierarchy */}
        <div className="mb-6">
          <div className="font-body font-normal text-xl text-[#94A3B8] mb-3">매일 아침,</div>
          <div className="font-body font-[800] text-[48px] md:text-[56px] leading-[1.1] tracking-[-1px]">
            <span className="text-emerald-400 emerald-glow">AI가 골라주는</span>{" "}
            <span className="text-[#F1F5F9]">오늘의 경기</span>
          </div>
        </div>

        <p className="font-body font-normal text-base text-[#94A3B8] max-w-[560px] mx-auto mb-10 break-keep leading-[1.7]">
          12개 리그, 매일 30경기를 분석하고 가장 맞출 확률 높은 경기를 카톡으로 보내드립니다
        </p>

        {/* 68% — Outfit 800, shimmer */}
        <div className="flex items-baseline gap-3 justify-center mb-10">
          <span className="font-outfit font-[800] text-[80px] md:text-[96px] leading-none tracking-[-2px] gold-shimmer">{count}%</span>
          <span className="text-[15px] text-[#94A3B8]">고확신 경기 평균 적중률</span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <a href={KAKAO_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-700 text-white text-base font-bold px-8 py-3.5 rounded-lg transition-all">
            무료로 시작하기
          </a>
          <button
            onClick={() => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" })}
            className={`bg-transparent border border-[#F1F5F9]/30 text-[#F1F5F9] text-base font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer ${bouncing ? "animate-[subtle-bounce_0.6s_ease-in-out]" : ""}`}>
            적중률 보기
          </button>
        </div>
        <div className="text-[13px] text-[#64748B]">회원가입 필요 없음 · 완전 무료 · 언제든 구독 취소</div>
      </div>
    </section>
  );
}
