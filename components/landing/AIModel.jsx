import FadeSection from "@/lib/FadeSection";

const MODELS = [
  { name: "Poisson", desc: "과거 득실 데이터로 예상 골 수 분포를 계산", icon: "λ" },
  { name: "ELO Rating", desc: "팀 상대 전력을 동적으로 평가하는 레이팅", icon: "Δ" },
  { name: "xG Model", desc: "슈팅 위치·각도 기반 기대 득점을 산출", icon: "xG" },
  { name: "시장 지표", desc: "시장 데이터의 집단 지성에서 확률을 추출", icon: "%" },
];

export default function AIModel() {
  return (
    <FadeSection>
      <section className="bg-bg-900 py-20 px-6">
        <div className="text-center mb-12">
          <div className="text-emerald-500 text-xs font-mono-data tracking-[0.2em] uppercase mb-2">AI MODEL</div>
          <h2 className="text-[32px] font-bold tracking-[-0.02em] text-[#E1E7EF]">
            4개의 모델이 실험합니다
          </h2>
        </div>

        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {MODELS.map((m) => (
              <div key={m.name} className="bg-bg-800 border border-bg-700 rounded-[14px] p-5 text-center card-hover">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-400 font-mono-data font-bold text-lg">{m.icon}</span>
                </div>
                <h3 className="text-sm font-bold text-[#E1E7EF] mb-1">{m.name}</h3>
                <p className="text-[11px] text-[#8494A7] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Ensemble arrow */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-px h-8 border-l border-dashed border-bg-700" />
            <div className="bg-bg-800 border border-emerald-500/30 rounded-[14px] px-6 py-3 text-center">
              <div className="text-xs text-[#566378] mb-1">앙상블 조합</div>
              <div className="text-sm font-bold text-emerald-400">Claude AI가 최종 확신도를 결정</div>
            </div>
            <div className="w-px h-8 border-l border-dashed border-bg-700" />
            <div className="text-[13px] text-[#8494A7]">→ 카카오톡으로 발송</div>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
