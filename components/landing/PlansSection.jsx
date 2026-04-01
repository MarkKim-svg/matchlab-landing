import FadeSection from "@/lib/FadeSection";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";

const FREE_ITEMS = [
  { ok: true, text: "매일 오전 카톡 알림" },
  { ok: true, text: "무료 프리뷰 2경기" },
  { ok: true, text: "적중률 리포트 (전체 공개)" },
  { ok: false, text: "고확신 ⭐4+ 경기" },
  { ok: false, text: "전경기 상세 분석" },
  { ok: false, text: "배당 이동 분석" },
];

const PRO_ITEMS = [
  { text: "Free의 모든 것 +" },
  { text: "고확신 ⭐4+⭐5 경기", highlight: true },
  { text: "전경기 상세 분석 (매일 10~30경기)" },
  { text: "배당 이동 분석" },
  { text: "웹 대시보드 열람" },
];

export default function PlansSection() {
  return (
    <FadeSection id="pricing">
      <section className="bg-bg-900 py-20 px-6">
        <div className="text-center mb-12">
          <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] leading-[1.2] text-[#F1F5F9]">
            매일 아침, AI가 고른 최고의 경기<br />
            카톡으로 — 월 9,900원
          </h2>
          <p className="text-[#94A3B8] text-[14px] mt-3 font-body">커피 2잔 값으로 매일 AI 분석</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Pro Card (모바일에서 먼저) ── */}
          <div className="relative rounded-2xl px-7 py-9 card-hover order-first md:order-last"
            style={{ background: "linear-gradient(135deg, #1c1308, #2a1a08)", border: "1px solid #d97706" }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full font-body"
              style={{ backgroundColor: "#d97706" }}>
              얼리버드
            </div>
            <div className="font-body font-bold text-xl mb-1 text-gold-400">Pro</div>
            <div className="text-[14px] text-[#64748B] line-through font-body">정가 ₩14,900</div>
            <div className="font-display font-bold text-[28px] tracking-[-1px] text-gold-400 mb-1">월 ₩9,900</div>
            <ul className="mt-5 mb-6 space-y-2">
              {PRO_ITEMS.map(item => (
                <li key={item.text} className="text-sm flex items-start gap-2 font-body">
                  <span className="text-emerald-500 font-bold shrink-0">✅</span>
                  <span className={item.highlight ? "text-gold-400 font-semibold" : "text-[#94A3B8]"}>{item.text}</span>
                </li>
              ))}
            </ul>
            <a href="/login"
              className="block w-full py-3.5 rounded-xl text-[15px] font-bold text-center text-white transition-all font-body"
              style={{ background: "linear-gradient(135deg, #d97706, #b45309)", boxShadow: "0 4px 20px rgba(217,119,6,0.3)" }}>
              Pro 시작하기
            </a>
          </div>

          {/* ── Free Card ── */}
          <div className="bg-bg-800 border border-bg-700 rounded-2xl px-7 py-9 card-hover order-last md:order-first">
            <div className="font-body font-bold text-xl mb-1 text-emerald-500">Free</div>
            <div className="font-display font-bold text-[28px] tracking-[-1px] text-[#F1F5F9] mb-1">₩0</div>
            <ul className="mt-5 mb-6 space-y-2">
              {FREE_ITEMS.map(item => (
                <li key={item.text} className="text-sm flex items-start gap-2 font-body">
                  <span className={`font-bold shrink-0 ${item.ok ? "text-emerald-500" : "text-error"}`}>
                    {item.ok ? "✅" : "❌"}
                  </span>
                  <span className="text-[#94A3B8]">{item.text}</span>
                </li>
              ))}
            </ul>
            <a href="/login"
              className="block w-full py-3.5 rounded-xl text-[15px] font-bold text-center bg-emerald-500 hover:bg-emerald-700 text-white transition-all font-body">
              무료로 시작하기
            </a>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
