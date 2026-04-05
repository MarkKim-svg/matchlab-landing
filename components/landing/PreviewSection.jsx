"use client";
import { useEffect, useRef, useState } from "react";
import FadeSection from "@/lib/FadeSection";
import KakaoMockup from "./KakaoMockup";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";

const MATCHES = [
  { confLabel:"★5", confClass:"bg-gold-400 text-bg-900 ", teams:"나폴리 vs 유벤투스", meta:"세리에A · 04:00",
    pred:"나폴리 승 (78.2%)", stats:[{label:"xG",value:"2.31 vs 0.87"},{label:"ELO",value:"+127"},{label:"배당",value:"1.65 → 1.58 ↓"}], locked:false },
  { confLabel:"★4", confClass:"bg-gold-500 text-white", teams:"아스널 vs 첼시", meta:"EPL · 04:00",
    pred:"아스널 승 (62.3%)", stats:[{label:"xG",value:"1.82 vs 1.14"},{label:"ELO",value:"+89"},{label:"배당",value:"1.85 → 1.80 ↓"}], locked:false },
  { confLabel:"★4", confClass:"bg-gold-500 text-white", teams:"레알 마드리드 vs 아틀레티코", meta:"라리가 · 05:00", locked:true },
];

function MatchCard({ match }) {
  return (
    <div className="border border-bg-700 rounded-lg px-3 py-2.5 mb-2 flex gap-3 items-center card-hover bg-bg-800">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-[800] text-[11px] shrink-0 ${match.confClass}`}>{match.confLabel}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold text-[#E1E7EF]">{match.teams}</div>
        <div className="text-[10px] text-[#566378]">{match.meta}</div>
        {match.locked
          ? <div className="text-[11px] mt-0.5 text-pro font-semibold">Pro 전용</div>
          : <div className="text-[11px] mt-0.5 text-[#8494A7]">AI: <strong className="text-emerald-400">{match.pred}</strong></div>}
      </div>
      {!match.locked && match.stats && (
        <div className="hidden md:flex flex-col gap-px text-right shrink-0">
          {match.stats.map((s) => <div key={s.label} className="text-[9px] text-[#566378] font-mono-data">{s.label} <span className="font-semibold text-[#8494A7]">{s.value}</span></div>)}
        </div>
      )}
    </div>
  );
}

export default function PreviewSection() {
  return (
    <FadeSection>
      <div className="border-t border-[#152035]" />
      <section className="bg-bg-900 py-20 px-6">
        <div className="text-center mb-12">
          <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-emerald-500 mb-2">PREVIEW</div>
          <h2 className="font-body font-bold text-[32px] md:text-[40px] tracking-[-0.5px] text-[#E1E7EF]">매일 아침 이런 분석이 도착합니다</h2>
        </div>
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-[#8494A7] mb-3 text-center">무료 카톡 프리뷰</div>
            <div className="flex justify-center"><KakaoMockup /></div>
          </div>
          <div>
            <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-gold-400 mb-3 text-center">Pro 전경기 분석</div>
            <div className="bg-bg-800 border border-bg-700 border-b-0 rounded-t-[14px] px-4 py-2.5 flex justify-between items-center">
              <div className="bg-bg-900 rounded-md px-3 py-1 text-[10px] text-[#566378] font-mono-data">matchlab.vercel.app/pro</div>
              <div className="bg-pro text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">Pro 전용</div>
            </div>
            <div className="bg-bg-800 rounded-b-[14px] border border-bg-700 border-t-0 p-4">
              <div className="font-body font-bold text-[15px] text-[#E1E7EF] mb-3">오늘의 전경기 AI 분석</div>
              {MATCHES.map((m) => <MatchCard key={m.teams} match={m} />)}
              <div className="text-center pt-3 pb-1">
                <p className="text-[13px] text-[#8494A7] mb-3">오늘 분석 12경기 중 2경기만 공개 중</p>
                <a href={KAKAO_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex bg-emerald-500 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors">카톡으로 구독 문의 →</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
