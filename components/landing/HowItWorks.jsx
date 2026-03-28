import FadeSection from "@/lib/FadeSection";

const STEPS = [
  { title: "데이터 수집", desc: "API-Football에서 매일 경기, 통계, 라인업을 자동 수집합니다" },
  { title: "AI 앙상블 분석", desc: "푸아송 + ELO + xG + 배당 모델을 Claude AI가 종합 분석합니다" },
  { title: "카톡으로 발송", desc: "매일 오전 10시, 확신도별 분석이 카카오톡으로 도착합니다" },
];

export default function HowItWorks() {
  return (
    <FadeSection>
      <section className="py-20 px-6">
        <h2 className="text-[32px] font-[800] text-center mb-12 tracking-[-0.02em]">
          이렇게 작동합니다
        </h2>
        <div className="relative max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-5 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-0.5 bg-ml-border" />

          {STEPS.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="relative z-10 w-10 h-10 bg-ml-accent text-white rounded-full inline-flex items-center justify-center font-bold text-base mb-4">
                {i + 1}
              </div>
              <h3 className="text-[17px] font-bold mb-1.5">{s.title}</h3>
              <p className="text-sm text-ml-sub leading-relaxed break-keep">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </FadeSection>
  );
}
