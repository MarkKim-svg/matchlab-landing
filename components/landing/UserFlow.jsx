"use client";
import { useEffect, useRef, useState } from "react";
import FadeSection from "@/lib/FadeSection";

const STEPS = [
  {
    step: "STEP 1",
    title: "매일 아침 카톡 도착",
    desc: "오전 10시, 오늘의 무료 프리뷰 2경기가 카톡으로 도착합니다",
    mock: (
      <div className="bg-bg-800 border border-bg-700 rounded-lg p-3 text-sm mt-4">
        <div className="font-bold text-[#F1F5F9] text-xs mb-1.5">MATCHLAB AI 분석</div>
        <div className="text-[#F1F5F9] text-xs font-semibold">아스널 vs 첼시</div>
        <div className="text-[11px] text-[#94A3B8] mt-0.5">
          AI 예측: <span className="text-emerald-400 font-semibold">아스널 승 (62.3%)</span>{" "}
          <span className="text-emerald-500 text-[10px]">★★★</span>
        </div>
        <div className="text-[10px] text-gold-400 mt-1.5 font-semibold">유료 전용 4경기 →</div>
      </div>
    ),
  },
  {
    step: "STEP 2",
    title: "링크 클릭 → 웹 리포트",
    desc: "Pro 구독자는 '전경기 보기' 링크를 눌러 웹에서 전체 분석을 확인합니다",
    mock: (
      <div className="bg-bg-800 border border-bg-700 rounded-lg p-3 text-sm font-mono-data mt-4">
        <div className="text-[10px] text-[#64748B] mb-1.5 truncate">matchlab.vercel.app/pro/2026-03-28</div>
        <div className="border-t border-bg-700 pt-1.5">
          <div className="text-[11px] text-[#F1F5F9] font-bold mb-1">오늘의 전경기 AI 분석</div>
          <div className="text-[10px] text-gold-400">★5 나폴리 vs 유벤투스 — 78.2%</div>
          <div className="text-[10px] text-gold-500">★4 아스널 vs 첼시 — 62.3%</div>
          <div className="text-[10px] text-[#64748B]">... 외 10경기</div>
        </div>
      </div>
    ),
  },
  {
    step: "STEP 3",
    title: "다음날 결과 확인",
    desc: "예측 결과가 자동으로 업데이트됩니다. 모든 기록은 Notion DB에서 투명하게 공개됩니다",
    mock: (
      <div className="bg-bg-800 border border-bg-700 rounded-lg p-3 text-sm mt-4">
        <div className="text-[11px] text-[#94A3B8] font-semibold mb-1.5">어제 결과</div>
        <div className="text-[10px] text-gold-400">★5 나폴리 승 → 2:0 ✅ 적중</div>
        <div className="text-[10px] text-gold-400">★4 아스널 승 → 1:0 ✅ 적중</div>
        <div className="text-[10px] text-error">★4 바르사 오버 → 1:0 ❌</div>
        <div className="text-[10px] text-[#94A3B8] mt-1.5 font-semibold">골드 경기 2/3 적중 (66.7%)</div>
      </div>
    ),
  },
];

export default function UserFlow() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <FadeSection>
      <section className="bg-bg-900 py-20 px-6">
        <div className="text-center mb-12">
          <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-emerald-500 mb-2">YOUR FLOW</div>
          <h2 className="font-body font-bold text-[32px] md:text-[40px] tracking-[-0.5px] text-[#F1F5F9]">카톡에서 시작, 웹에서 전부 확인</h2>
        </div>
        <div ref={ref} className="max-w-[900px] mx-auto flex flex-col md:flex-row gap-4 items-stretch">
          {STEPS.map((s, i) => (
            <div key={s.step} className="contents">
              <div
                className={`flex-1 bg-bg-800 border border-bg-700 rounded-2xl p-6 flex flex-col card-hover transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-emerald-500 mb-3">{s.step}</div>
                <h3 className="font-body font-bold text-lg text-[#F1F5F9] mb-2">{s.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{s.desc}</p>
                {s.mock}
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex items-center justify-center shrink-0 px-1">
                  <div className="text-bg-700 text-xl">→</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </FadeSection>
  );
}
