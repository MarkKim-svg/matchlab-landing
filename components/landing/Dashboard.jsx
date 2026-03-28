"use client";
import { useState, useEffect, useRef } from "react";
import FadeSection from "@/lib/FadeSection";

const TABS = ["7일","30일","전체"];
const STATS = [
  { value:"47.5%", label:"전체 적중률", shimmer:true },
  { value:"56.1%", label:"4성+ 적중률", shimmer:true },
  { value:"500+", label:"누적 경기", shimmer:false },
];
const CONF_BARS = [
  { label:"5성", rate:62.5, color:"bg-gold-400" },
  { label:"4성", rate:56.1, color:"bg-gold-500" },
  { label:"3성", rate:48.2, color:"bg-emerald-500" },
  { label:"2성", rate:41, color:"bg-[#64748B]" },
  { label:"1성", rate:35.7, color:"bg-error" },
];
const LEAGUE_BARS = [
  { label:"라리가", rate:58.3, color:"bg-blue" },
  { label:"세리에A", rate:54.2, color:"bg-blue" },
  { label:"분데스", rate:52.1, color:"bg-blue" },
  { label:"리그앙", rate:50, color:"bg-blue" },
  { label:"EPL", rate:18.2, color:"bg-error" },
];

function BarRow({ label, rate, color, delay, animate }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 text-[13px] font-semibold text-right shrink-0 text-[#94A3B8]">{label}</div>
      <div className="flex-1 h-7 bg-bg-900 rounded-md overflow-hidden">
        <div
          className={`h-full rounded-md flex items-center justify-end pr-2.5 text-xs font-bold text-white font-mono-data min-w-[36px] ${color} ${animate ? "bar-animate" : ""}`}
          style={{ width: `${rate}%`, animationDelay: `${delay}ms` }}
        >
          {rate}%
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("7일");
  const [barVisible, setBarVisible] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBarVisible(true); }, { threshold: 0.2 });
    if (barRef.current) obs.observe(barRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <FadeSection id="dashboard">
      <div className="neon-line" />
      <section className="bg-bg-900 py-20 px-6">
        <div className="text-center mb-4">
          <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-emerald-500 mb-2">ACCURACY</div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
            <span className="text-emerald-500 text-xs font-mono-data">LIVE DATA · Notion DB 연동</span>
          </div>
          <h2 className="font-body font-bold text-[32px] md:text-[40px] tracking-[-0.5px] text-[#F1F5F9]">적중률 투명 공개</h2>
          <p className="text-[#94A3B8] mt-2 text-[15px]">모든 예측과 결과를 기록합니다. 숨기지 않습니다.</p>
        </div>
        <div className="max-w-[900px] mx-auto">
          <div className="flex justify-center gap-2 mb-8">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-[13px] font-semibold cursor-pointer transition-all ${tab === t ? "bg-emerald-500 text-white" : "bg-bg-800 border border-bg-700 text-[#94A3B8]"}`}>{t}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {STATS.map((s, i) => (
              <div key={s.label} className="bg-bg-800 border border-bg-700 rounded-2xl p-5 text-center card-hover neon-card"
                style={{ transitionDelay: `${i * 150}ms` }}>
                <div className={`text-4xl font-[800] tracking-[-0.03em] font-outfit ${s.shimmer ? "gold-shimmer" : "text-[#F1F5F9]"}`}>{s.value}</div>
                <div className="text-[13px] text-[#94A3B8] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div ref={barRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-800 border border-bg-700 rounded-2xl p-7 neon-card">
              <div className="font-body font-bold text-base mb-5 text-[#F1F5F9]">확신도별 적중률</div>
              <div className="flex flex-col gap-2.5">{CONF_BARS.map((b, i) => <BarRow key={b.label} {...b} delay={i * 150} animate={barVisible} />)}</div>
            </div>
            <div className="bg-bg-800 border border-bg-700 rounded-2xl p-7 neon-card">
              <div className="font-body font-bold text-base mb-5 text-[#F1F5F9]">리그별 적중률</div>
              <div className="flex flex-col gap-2.5">{LEAGUE_BARS.map((b, i) => <BarRow key={b.label} {...b} delay={i * 150} animate={barVisible} />)}</div>
            </div>
          </div>
          <p className="text-center mt-4 text-[13px] text-emerald-500 underline decoration-emerald-500/50 hover:decoration-emerald-500 transition-all cursor-pointer">
            <a href="https://notion.so" target="_blank" rel="noopener noreferrer">Notion DB에서 전체 기록 확인 →</a>
          </p>
        </div>
      </section>
    </FadeSection>
  );
}
