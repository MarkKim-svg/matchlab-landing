"use client";
import { useEffect, useRef, useState } from "react";
import FadeSection from "@/lib/FadeSection";

const STEPS = [
  { num:1, title:"데이터 수집", desc:"API-Football에서 매일 경기, 통계, 라인업을 자동 수집합니다", detail:"매일 12개 리그, 30+ 경기 자동 수집" },
  { num:2, title:"AI 앙상블 분석", desc:"푸아송 + ELO + xG + 시장 지표 모델을 Claude AI가 종합 분석합니다", detail:"4가지 모델이 각각 확률을 계산하고, AI가 최종 조정" },
  { num:3, title:"카톡으로 발송", desc:"매일 오전 10시, 확신도별 분석이 카카오톡으로 도착합니다", detail:"오전 10시, 확신도별로 정리된 분석이 도착" },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <FadeSection>
      <section className="bg-bg-900 py-20 md:py-24 px-6">
        <div className="text-center mb-12">
          <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-emerald-500 mb-2">HOW IT WORKS</div>
          <h2 className="font-body font-bold text-[32px] md:text-[40px] tracking-[-0.5px] text-[#E1E7EF]">이렇게 작동합니다</h2>
        </div>
        <div ref={ref} className="max-w-[900px] mx-auto flex flex-col md:flex-row gap-4 items-stretch">
          {STEPS.map((s, i) => (
            <div key={s.title} className="contents">
              <div
                className={`flex-1 bg-bg-800 border border-bg-700 rounded-[14px] p-8 text-center flex flex-col card-hover transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full inline-flex items-center justify-center font-bold text-base mb-4 mx-auto">{s.num}</div>
                <h3 className="font-body font-bold text-lg text-[#E1E7EF] mb-2">{s.title}</h3>
                <p className="text-sm text-[#8494A7] leading-relaxed break-keep mb-3">{s.desc}</p>
                <div className="mt-auto pt-3 border-t border-dashed border-bg-700">
                  <p className="text-xs text-[#566378] font-mono-data">{s.detail}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex items-center justify-center shrink-0 px-1">
                  <div className="w-8 border-t border-dashed border-bg-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </FadeSection>
  );
}
