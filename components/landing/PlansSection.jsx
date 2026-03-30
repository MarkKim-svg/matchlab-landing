import FadeSection from "@/lib/FadeSection";
import { KAKAO_CHANNEL_URL, EARLYBIRD_PRICE } from "@/lib/constants";

const COMPARE_ROWS = [
  { feature:"카톡 분석", free:"3성 이하 중 2경기", pro:"전경기 (10~30경기)", proCheck:true },
  { feature:"고확신 경기", free:"—", freeIsDash:true, pro:"4성~5성 공개", proCheck:true },
  { feature:"배당 분석", free:"—", freeIsDash:true, pro:"스마트 머니 분석", proCheck:true },
  { feature:"적중률 리포트", free:"✓", freeCheck:true, pro:"✓", proCheck:true },
];
const FREE_FEATURES = ["매일 2경기 프리뷰","적중률 리포트","기본 알림"];
const PRO_FEATURES = ["전경기 AI 분석","고확신 경기 (4성+)","배당 괴리 분석"];

export default function PlansSection() {
  return (
    <FadeSection id="pricing">
      <div className="neon-line" />
      <section className="bg-bg-900 py-20 px-6">
        <div className="text-center mb-12">
          <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-emerald-500 mb-2">PRICING</div>
          <h2 className="font-body font-bold text-[28px] md:text-[36px] tracking-[-0.5px] leading-[1.2] text-[#F1F5F9]">무료로 시작하고, 확신이 생기면 Pro로</h2>
        </div>
        <div className="max-w-[800px] mx-auto">
          <div className="overflow-hidden rounded-2xl border border-bg-700 bg-bg-800">
            <table className="w-full border-collapse text-sm font-body">
              <thead><tr>
                <th className="bg-bg-800 border-b border-bg-700 py-3.5 px-5 text-left font-bold text-[#F1F5F9]"></th>
                <th className="bg-bg-800 border-b border-bg-700 py-3.5 px-5 text-center font-bold text-[#94A3B8]">무료</th>
                <th className="bg-emerald-500 border-b border-emerald-500 py-3.5 px-5 text-center font-bold text-white">Pro</th>
              </tr></thead>
              <tbody>{COMPARE_ROWS.map((r) => (
                <tr key={r.feature} className="border-b border-bg-700 last:border-b-0">
                  <td className="py-3.5 px-5 text-left font-semibold text-[#F1F5F9]">{r.feature}</td>
                  <td className={`py-3.5 px-5 text-center ${r.freeIsDash ? "text-[#64748B]" : r.freeCheck ? "text-emerald-500 font-bold" : "text-[#F1F5F9]"}`}>{r.free}</td>
                  <td className={`py-3.5 px-5 text-center ${r.proCheck ? "text-emerald-500 font-bold" : "text-[#F1F5F9]"}`}>{r.pro}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p className="text-center mt-3 text-[13px] text-[#64748B] font-body">유료 전용 경기는 결과만 다음날 공개됩니다</p>
        </div>
        <div className="max-w-[780px] mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg-800 border border-bg-700 rounded-2xl px-7 py-9 card-hover">
            <div className="font-body font-bold text-xl mb-1 text-[#F1F5F9]">Free</div>
            <div className="font-display font-bold text-[42px] tracking-[-2px] text-[#F1F5F9]">0<small className="text-base font-normal text-[#94A3B8] font-body tracking-normal">원/월</small></div>
            <div className="text-sm text-[#94A3B8] mt-1 font-body">카톡 채널 추가만 하면</div>
            <ul className="mt-5 mb-6 space-y-1.5">{FREE_FEATURES.map((f) => <li key={f} className="text-sm flex items-center gap-2 text-[#94A3B8] font-body"><span className="text-emerald-500 font-bold">✓</span> {f}</li>)}</ul>
            <a href={KAKAO_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="block w-full py-3.5 rounded-lg text-[15px] font-bold text-center bg-transparent border border-bg-700 text-[#94A3B8] hover:border-emerald-500 hover:text-emerald-500 transition-all font-body">무료로 시작하기</a>
          </div>
          <div className="relative bg-bg-800 border-2 border-emerald-500 rounded-2xl px-7 py-9 neon-card card-hover">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full font-body">추천</div>
            <div className="font-body font-bold text-xl mb-1 text-[#F1F5F9]">Pro</div>
            <div className="text-sm text-[#64748B] line-through font-body">14,900원</div>
            <div className="font-display font-bold text-[48px] tracking-[-3px] gold-shimmer">
              {EARLYBIRD_PRICE.toLocaleString()}<small className="text-base font-normal text-[#94A3B8] font-body tracking-normal" style={{WebkitTextFillColor:"#94A3B8",background:"none"}}>원/월</small>
            </div>
            <div className="inline-block mt-1.5 mb-5 bg-gold-400/10 text-gold-400 border border-gold-400/50 text-[13px] font-semibold px-3 py-1 rounded-full earlybird-glow font-body">얼리버드 — 커피 3잔 가격</div>
            <ul className="mb-6 space-y-1.5">{PRO_FEATURES.map((f) => <li key={f} className="text-sm flex items-center gap-2 text-[#94A3B8] font-body"><span className="text-emerald-500 font-bold">✓</span> {f}</li>)}</ul>
            <a href="/login?redirect=/pricing" className="block w-full py-3.5 rounded-lg text-[15px] font-bold text-center bg-emerald-500 hover:bg-emerald-700 text-white transition-colors font-body">Pro 시작하기</a>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
