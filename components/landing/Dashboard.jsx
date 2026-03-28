"use client";

import { useState } from "react";
import FadeSection from "@/lib/FadeSection";

const TABS = ["7일", "30일", "전체"];

const STATS = [
  { value: "47.5%", label: "전체 적중률" },
  { value: "56.1%", label: "4성+ 적중률" },
  { value: "500+", label: "누적 경기" },
];

const CONF_BARS = [
  { label: "5성", rate: 62.5, color: "green" },
  { label: "4성", rate: 56.1, color: "green" },
  { label: "3성", rate: 48.2, color: "yellow" },
  { label: "2성", rate: 41, color: "yellow" },
  { label: "1성", rate: 35.7, color: "red" },
];

const LEAGUE_BARS = [
  { label: "라리가", rate: 58.3, color: "blue" },
  { label: "세리에A", rate: 54.2, color: "blue" },
  { label: "분데스", rate: 52.1, color: "blue" },
  { label: "리그앙", rate: 50, color: "blue" },
  { label: "EPL", rate: 18.2, color: "red" },
];

const BAR_COLORS = {
  green: "bg-gradient-to-r from-[#22c55e] to-[#16a34a]",
  yellow: "bg-gradient-to-r from-[#facc15] to-[#eab308]",
  red: "bg-gradient-to-r from-[#f87171] to-[#ef4444]",
  blue: "bg-gradient-to-r from-[#60a5fa] to-[#2563eb]",
};

function BarRow({ label, rate, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 text-[13px] font-semibold text-right shrink-0">{label}</div>
      <div className="flex-1 h-7 bg-[#f3f4f6] rounded-md overflow-hidden">
        <div
          className={`h-full rounded-md flex items-center justify-end pr-2.5 text-xs font-bold text-white transition-[width] duration-600 ${BAR_COLORS[color]}`}
          style={{ width: `${rate}%` }}
        >
          {rate}%
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("7일");

  return (
    <FadeSection id="dashboard">
      <section className="py-20 px-6">
        <h2 className="text-[32px] font-[800] text-center mb-12 tracking-[-0.02em]">
          적중률 투명 공개
        </h2>
        <div className="max-w-[900px] mx-auto">
          <p className="text-center text-ml-sub -mt-8 mb-8 text-[15px]">
            모든 예측과 결과를 기록합니다. 숨기지 않습니다.
          </p>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                  tab === t
                    ? "bg-ml-accent text-white border border-ml-accent"
                    : "bg-white border border-ml-border text-ml-sub"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {STATS.map((s) => (
              <div key={s.label} className="bg-ml-surface border border-ml-border rounded-[14px] p-5 text-center">
                <div className="text-4xl font-[900] text-ml-accent tracking-[-0.03em]">{s.value}</div>
                <div className="text-[13px] text-ml-sub mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bar Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-ml-surface border border-ml-border rounded-2xl p-7">
              <div className="text-base font-bold mb-5">확신도별 적중률</div>
              <div className="flex flex-col gap-2.5">
                {CONF_BARS.map((b) => (
                  <BarRow key={b.label} {...b} />
                ))}
              </div>
            </div>
            <div className="bg-ml-surface border border-ml-border rounded-2xl p-7">
              <div className="text-base font-bold mb-5">리그별 적중률</div>
              <div className="flex flex-col gap-2.5">
                {LEAGUE_BARS.map((b) => (
                  <BarRow key={b.label} {...b} />
                ))}
              </div>
            </div>
          </div>

          <p className="text-center mt-4 text-[13px] text-ml-accent cursor-pointer">
            <a href="https://notion.so" target="_blank" rel="noopener noreferrer">
              Notion DB에서 전체 기록 확인 →
            </a>
          </p>
        </div>
      </section>
    </FadeSection>
  );
}
