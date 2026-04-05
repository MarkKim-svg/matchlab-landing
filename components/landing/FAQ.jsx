"use client";
import { useState } from "react";
import FadeSection from "@/lib/FadeSection";

const ITEMS = [
  { q: "MATCHLAB은 뭔가요?", a: "매일 유럽 축구 경기를 통계 모델로 분석하고, 확신도별로 분류해서 카카오톡으로 보내드리는 데이터 분석 서비스입니다." },
  { q: "무료로도 쓸 수 있나요?", a: "네, 카카오톡 채널 추가만 하면 매일 2경기 프리뷰를 무료로 받을 수 있습니다." },
  { q: "Pro는 언제든 해지할 수 있나요?", a: "네, 위약금 없이 언제든 해지 가능합니다. 해지 시 남은 기간까지는 이용 가능합니다." },
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#111827] border border-[#152035] rounded-[14px] mb-2 overflow-hidden hover:border-[#1E2D47] transition-colors">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-[18px] text-[15px] font-semibold cursor-pointer flex justify-between items-center text-left bg-transparent border-none text-[#E1E7EF]">
        {q}
        <span className="text-emerald-500 text-xl font-normal ml-4 shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-[#8494A7] leading-relaxed">{a}</div>}
    </div>
  );
}

export default function FAQ() {
  return (
    <FadeSection>
      <div className="border-t border-[#152035]" />
      <section className="bg-bg-900 py-20 px-6">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-12">
            <span className="section-label mb-3">FAQ</span>
            <h2 className="font-body font-bold text-[28px] md:text-[36px] tracking-[-0.5px] text-[#E1E7EF]">자주 묻는 질문</h2>
          </div>
          {ITEMS.map((item) => <Item key={item.q} {...item} />)}
        </div>
      </section>
    </FadeSection>
  );
}
