import FadeSection from "@/lib/FadeSection";
import { KAKAO_CHANNEL_URL, EARLYBIRD_PRICE } from "@/lib/constants";

const COMPARE_ROWS = [
  { feature: "카톡 분석", free: "3성 이하 중 2경기", pro: "전경기 (10~30경기)", proCheck: true },
  { feature: "고확신 경기", free: "—", freeIsDash: true, pro: "4성~5성 공개", proCheck: true },
  { feature: "배당 분석", free: "—", freeIsDash: true, pro: "스마트 머니 분석", proCheck: true },
  { feature: "적중률 리포트", free: "✓", freeCheck: true, pro: "✓", proCheck: true },
];

const FREE_FEATURES = [
  "매일 2경기 프리뷰",
  "적중률 리포트",
  "기본 알림",
];

const PRO_FEATURES = [
  "전경기 AI 분석",
  "고확신 경기 (4성+)",
  "배당 괴리 분석",
];

export default function PlansSection() {
  return (
    <FadeSection id="pricing">
      <section className="bg-ml-surface py-20 px-6">
        <h2 className="text-[32px] font-[800] text-center mb-12 tracking-[-0.02em]">
          무료로 시작하고, 확신이 생기면 Pro로
        </h2>
        <div className="max-w-[800px] mx-auto">
          {/* Compare Table */}
          <div className="overflow-hidden rounded-2xl border border-ml-border bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="bg-[#f9fafb] border-b border-ml-border py-3.5 px-5 text-left font-bold"></th>
                  <th className="bg-[#f9fafb] border-b border-ml-border py-3.5 px-5 text-center font-bold">무료</th>
                  <th className="bg-ml-accent border-b border-ml-accent py-3.5 px-5 text-center font-bold text-white">Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((r) => (
                  <tr key={r.feature} className="border-b border-ml-border last:border-b-0">
                    <td className="py-3.5 px-5 text-left font-semibold">{r.feature}</td>
                    <td className={`py-3.5 px-5 text-center ${r.freeIsDash ? "text-ml-muted" : r.freeCheck ? "text-ml-accent font-bold" : ""}`}>
                      {r.free}
                    </td>
                    <td className={`py-3.5 px-5 text-center ${r.proCheck ? "text-ml-accent font-bold" : ""}`}>
                      {r.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center mt-3 text-[13px] text-ml-muted">
            유료 전용 경기는 결과만 다음날 공개됩니다
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-[780px] mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-white border border-ml-border rounded-[20px] px-7 py-9">
            <div className="text-xl font-[800] mb-1">Free</div>
            <div className="text-[42px] font-[900] tracking-[-0.03em]">
              0<small className="text-base font-medium text-ml-sub">원/월</small>
            </div>
            <div className="text-sm text-ml-sub mt-1">카톡 채널 추가만 하면</div>
            <ul className="mt-5 mb-6 space-y-1.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="text-sm flex items-center gap-2">
                  <span className="text-ml-accent font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href={KAKAO_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 rounded-xl text-[15px] font-bold text-center border border-ml-border text-ml-text hover:border-ml-accent hover:text-ml-accent transition-all"
            >
              무료로 시작하기
            </a>
          </div>

          {/* Pro */}
          <div className="relative bg-white border-2 border-ml-accent rounded-[20px] px-7 py-9 shadow-[0_8px_32px_rgba(37,99,235,0.08)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-ml-accent text-white text-xs font-bold px-4 py-1 rounded-full">
              추천
            </div>
            <div className="text-xl font-[800] mb-1">Pro</div>
            <div className="text-sm text-ml-muted line-through">14,900원</div>
            <div className="text-[42px] font-[900] tracking-[-0.03em]">
              {EARLYBIRD_PRICE.toLocaleString()}<small className="text-base font-medium text-ml-sub">원/월</small>
            </div>
            <div className="text-[13px] text-ml-accent mt-1.5 mb-5">
              얼리버드 — 커피 3잔 가격으로 매일 분석
            </div>
            <ul className="mb-6 space-y-1.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="text-sm flex items-center gap-2">
                  <span className="text-ml-accent font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href="/login?redirect=/pricing"
              className="block w-full py-3.5 rounded-xl text-[15px] font-bold text-center bg-ml-accent hover:bg-ml-accent-hover text-white transition-colors"
            >
              Pro 시작하기
            </a>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
