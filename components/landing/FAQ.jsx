"use client";
import { useState } from "react";
import FadeSection from "@/lib/FadeSection";

const ITEMS = [
  { q:"MATCHLAB은 뭔가요?", a:"매일 유럽 축구 경기를 통계 모델로 분석하고, 확신도별로 분류해서 카카오톡으로 보내드리는 서비스입니다." },
  { q:"적중률은 어느 정도인가요?", a:"전체 평균 약 47%, 고확신(4성+) 경기는 56%입니다. 모든 기록은 Notion DB에서 투명하게 확인할 수 있습니다." },
  { q:"어떤 리그를 분석하나요?", a:"EPL, 라리가, 세리에A, 분데스리가, 리그앙 5대 리그와 UCL, UEL, FA Cup 등 주요 컵대회 포함 총 20개 리그를 분석합니다." },
  { q:"무료로도 쓸 수 있나요?", a:"네, 카카오톡 채널 추가만 하면 매일 2경기 프리뷰를 무료로 받을 수 있습니다." },
  { q:"Pro는 언제든 해지할 수 있나요?", a:"네, 위약금 없이 언제든 해지 가능합니다. 해지 시 남은 기간까지는 이용 가능합니다." },
  { q:"베팅을 권유하나요?", a:"아닙니다. 데이터 기반 분석 정보를 제공할 뿐, 베팅을 권유하거나 보장하지 않습니다. 건전한 이용을 권장합니다." },
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-bg-800 border border-bg-700 rounded-xl mb-2 overflow-hidden card-hover">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-[18px] text-[15px] font-semibold cursor-pointer flex justify-between items-center text-left bg-transparent border-none text-[#F1F5F9]">
        {q}
        <span className="text-emerald-500 text-xl font-normal ml-4 shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-[#94A3B8] leading-relaxed">{a}</div>}
    </div>
  );
}

export default function FAQ() {
  return (
    <FadeSection>
      <section className="bg-bg-900 py-20 px-6">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-12">
            <div className="font-mono-data font-medium text-[11px] tracking-[0.25em] uppercase text-emerald-500 mb-2">FAQ</div>
            <h2 className="font-body font-bold text-[32px] md:text-[40px] tracking-[-0.5px] text-[#F1F5F9]">자주 묻는 질문</h2>
          </div>
          {ITEMS.map((item) => <Item key={item.q} {...item} />)}
        </div>
      </section>
    </FadeSection>
  );
}
