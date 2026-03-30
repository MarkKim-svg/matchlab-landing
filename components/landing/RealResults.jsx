"use client";
import { useEffect, useRef, useState } from "react";
import FadeSection from "@/lib/FadeSection";

const RESULTS = [
  { stars:5, badge:"★5", badgeClass:"bg-gold-400 text-bg-900 star-glow", teams:"나폴리 vs 유벤투스", league:"세리에A · 03.27",
    pred:"나폴리 승 (78.2%)", data:[{label:"xG",value:"2.31 vs 0.87"},{label:"ELO",value:"+127"},{label:"배당",value:"1.65 → 1.58 ↓"}],
    score:"2 : 0", hit:true, cardBorder:"border-gold-400/30 shadow-[0_0_20px_rgba(251,191,36,0.15)]" },
  { stars:4, badge:"★4", badgeClass:"bg-gold-500 text-bg-900", teams:"아스널 vs 첼시", league:"EPL · 03.27",
    pred:"아스널 승 (62.3%)", data:[{label:"xG",value:"1.82 vs 1.14"},{label:"ELO",value:"+89"},{label:"배당",value:"1.85 → 1.80 ↓"}],
    score:"1 : 0", hit:true, cardBorder:"border-gold-500/30" },
  { stars:4, badge:"★4", badgeClass:"bg-gold-500 text-bg-900", teams:"바르셀로나 vs 비야레알", league:"라리가 · 03.27",
    pred:"오버 2.5 (71.8%)", data:[{label:"xG",value:"1.95 vs 1.22"},{label:"ELO",value:"+65"},{label:"배당",value:"1.72 → 1.70 ↓"}],
    score:"1 : 0", hit:false, cardBorder:"border-bg-700", note:"틀린 예측도 숨기지 않습니다" },
];

function ResultCard({ r, index, visible }) {
  return (
    <div className={`bg-bg-800 border ${r.cardBorder} rounded-2xl p-6 card-hover transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{transitionDelay:`${index*150}ms`}}>
      <div className="flex items-center gap-2 mb-4">
        <span className={`${r.badgeClass} font-bold rounded-full px-3 py-1 text-sm font-display`}>{r.badge}</span>
        {r.hit && <span className="text-gold-400 text-xs font-bold gold-shimmer">적중</span>}
      </div>
      <h3 className="font-body font-bold text-lg text-[#F1F5F9] mb-1 tracking-[-0.3px]">{r.teams}</h3>
      <div className="text-sm text-[#64748B] mb-3 font-body">{r.league}</div>
      <div className="text-sm font-bold mb-3 font-body">AI 예측: <span className="text-emerald-400 font-display tracking-[-0.5px]">{r.pred}</span></div>
      <div className="flex flex-col gap-1 mb-4">
        {r.data.map((d) => <div key={d.label} className="text-xs text-[#94A3B8] font-mono-data">{d.label} <span className="font-medium">{d.value}</span></div>)}
      </div>
      <div className="font-display font-bold text-[28px] tracking-[-1px] text-[#F1F5F9] mb-2">{r.score}</div>
      {r.hit ? <div className="text-gold-400 font-bold gold-shimmer">✅ 적중</div> : (
        <><div className="text-error font-bold">❌ 미적중</div>{r.note && <div className="text-[#64748B] text-xs italic mt-1">{r.note}</div>}</>
      )}
    </div>
  );
}

export default function RealResults() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <FadeSection>
      <div className="neon-line" />
      <section className="bg-bg-900 py-20 px-6">
        <div className="text-center mb-12">
          <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-emerald-500 mb-2">REAL RESULTS</div>
          <h2 className="font-body font-bold text-[28px] md:text-[36px] tracking-[-0.5px] leading-[1.2] text-[#F1F5F9]">어제 AI는 이렇게 맞췄습니다</h2>
          <p className="text-[#94A3B8] mt-2 text-[15px] font-body">실제 예측과 결과입니다. 모든 기록은 Notion DB에서 검증 가능합니다</p>
        </div>
        <div ref={ref} className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {RESULTS.map((r, i) => <ResultCard key={r.teams} r={r} index={i} visible={visible} />)}
        </div>
        <div className="text-center mt-8">
          <span className="font-mono-data font-medium text-sm gold-shimmer">3월 4주차: 고확신(★4+) 경기 8건 중 6건 적중 — 75.0%</span>
        </div>
      </section>
    </FadeSection>
  );
}
