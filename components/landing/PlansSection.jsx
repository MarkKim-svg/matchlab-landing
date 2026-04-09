import FadeSection from "@/lib/FadeSection";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";

const FREE_ITEMS = [
  { ok: true, text: "전경기 AI 예측 열람" },
  { ok: true, text: "확신도 ⭐~⭐⭐⭐ 경기" },
  { ok: true, text: "예측 결과 + 확률바" },
  { ok: true, text: "적중률 리포트 (전체 공개)" },
  { ok: false, text: "고확신 ⭐4+ 경기" },
  { ok: false, text: "상세 분석 리포트 (전술·핵심변수)" },
  { ok: false, text: "시장 지표 분석" },
];

const PRO_ITEMS = [
  { text: "Free의 모든 것 +" },
  { text: "고확신 ⭐4+⭐5 경기", highlight: true },
  { text: "상세 분석 리포트 전체 열람" },
  { text: "시장 지표 분석" },
  { text: "전술 분석 · 핵심 변수" },
];

export default function PlansSection() {
  return (
    <FadeSection id="pricing">
      <div className="border-t border-[#152035]" />
      <section className="bg-bg-900 py-20 md:py-24 px-6">
        <div className="text-center mb-12">
          <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] leading-[1.2] text-[#E1E7EF]">
            매일 아침, AI가 고른 최고의 경기<br />
            카톡으로 — 월 9,900원
          </h2>
          <p className="text-[#8494A7] text-[14px] mt-3 font-body">커피 2잔 값으로 매일 AI 분석</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Pro Card (모바일에서 먼저) ── */}
          <div className="relative rounded-[14px] px-7 py-9 order-first md:order-last hover:border-[#1E2D47] transition-colors"
            style={{ background: "linear-gradient(135deg, #1c1308, #2a1a08)", border: "2px solid #d97706" }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full font-body"
              style={{ backgroundColor: "#d97706" }}>
              얼리버드
            </div>
            <div className="font-body font-bold text-xl mb-1 text-gold-400">Pro</div>
            <div className="text-[14px] text-[#566378] line-through font-body">정가 ₩14,900</div>
            <div className="font-display font-bold text-[28px] tracking-[-1px] text-gold-400 mb-1">월 ₩9,900</div>
            <ul className="mt-5 mb-6 space-y-2">
              {PRO_ITEMS.map(item => (
                <li key={item.text} className="text-sm flex items-start gap-2 font-body">
                  <span className="text-emerald-500 font-bold shrink-0">✅</span>
                  <span className={item.highlight ? "text-gold-400 font-semibold" : "text-[#8494A7]"}>{item.text}</span>
                </li>
              ))}
            </ul>
            <a href="/login"
              className="block w-full py-3.5 rounded-[14px] text-[15px] font-bold text-center text-white transition-all font-body"
              style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}>
              Pro 시작하기
            </a>
          </div>

          {/* ── Free Card ── */}
          <div className="bg-[#111827] border border-[#152035] rounded-[14px] px-7 py-9 hover:border-[#1E2D47] transition-colors order-last md:order-first">
            <div className="font-body font-bold text-xl mb-1 text-emerald-500">Free</div>
            <div className="font-display font-bold text-[28px] tracking-[-1px] text-[#E1E7EF] mb-1">₩0</div>
            <ul className="mt-5 mb-6 space-y-2">
              {FREE_ITEMS.map(item => (
                <li key={item.text} className="text-sm flex items-start gap-2 font-body">
                  <span className={`font-bold shrink-0 ${item.ok ? "text-emerald-500" : "text-error"}`}>
                    {item.ok ? "✅" : "❌"}
                  </span>
                  <span className="text-[#8494A7]">{item.text}</span>
                </li>
              ))}
            </ul>
            <a href="/login"
              className="block w-full py-3.5 rounded-[14px] text-[15px] font-bold text-center bg-emerald-500 hover:bg-emerald-400 text-white transition-all font-body">
              무료로 시작하기
            </a>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
