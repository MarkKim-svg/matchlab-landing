import FadeSection from "@/lib/FadeSection";

const MATCHES = [
  {
    conf: 5,
    confLabel: "★5",
    confClass: "bg-gradient-to-br from-[#16a34a] to-[#22c55e]",
    teams: "나폴리 vs 유벤투스",
    meta: "세리에A · 04:00 · 확신도 최고",
    pred: "나폴리 승 (78.2%)",
    stats: [
      { label: "xG", value: "2.31 vs 0.87" },
      { label: "ELO", value: "+127" },
      { label: "배당", value: "1.65 → 1.58 ↓" },
    ],
    blurred: false,
  },
  {
    conf: 4,
    confLabel: "★4",
    confClass: "bg-gradient-to-br from-[#2563eb] to-[#60a5fa]",
    teams: "아스널 vs 첼시",
    meta: "EPL · 04:00 · 높은 확신",
    pred: "아스널 승 (62.3%)",
    stats: [
      { label: "xG", value: "1.82 vs 1.14" },
      { label: "ELO", value: "+89" },
      { label: "배당", value: "1.85 → 1.80 ↓" },
    ],
    blurred: false,
  },
  {
    conf: 4,
    confLabel: "★4",
    confClass: "bg-gradient-to-br from-[#2563eb] to-[#60a5fa]",
    teams: "레알 마드리드 vs 아틀레티코",
    meta: "라리가 · 05:00 · 높은 확신",
    pred: "홈 승 (65.1%)",
    stats: [
      { label: "xG", value: "2.05 vs 0.92" },
      { label: "ELO", value: "+102" },
      { label: "배당", value: "1.72 → 1.68 ↓" },
    ],
    blurred: true,
  },
  {
    conf: 3,
    confLabel: "★3",
    confClass: "bg-gradient-to-br from-[#eab308] to-[#facc15] text-[#1a1a1a]",
    teams: "도르트문트 vs 바이에른",
    meta: "분데스리가 · 04:30 · 보통",
    pred: "오버 2.5 (68.4%)",
    stats: [
      { label: "xG", value: "1.65 vs 2.10" },
      { label: "ELO", value: "-45" },
      { label: "배당", value: "1.55 → 1.52 ↓" },
    ],
    blurred: true,
  },
];

function MatchCard({ match }) {
  return (
    <div
      className={`border border-ml-border rounded-xl px-5 py-[18px] mb-3 grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto] gap-4 items-center hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow ${
        match.blurred ? "blur-[4px] select-none pointer-events-none opacity-60" : ""
      }`}
    >
      {/* Confidence Badge */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center font-[800] text-sm text-white shrink-0 ${match.confClass}`}
      >
        {match.confLabel}
      </div>

      {/* Match Info */}
      <div className="min-w-0">
        <div className="text-[15px] font-bold mb-0.5">{match.teams}</div>
        <div className="text-xs text-ml-muted">{match.meta}</div>
        <div className="text-[13px] mt-1.5 text-ml-sub">
          AI 예측: <strong className="text-ml-accent">{match.pred}</strong>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-0.5 text-right shrink-0 max-md:flex-row max-md:gap-2 max-md:col-span-full max-md:text-left max-md:flex-wrap">
        {match.stats.map((s) => (
          <div key={s.label} className="text-[11px] text-ml-muted">
            {s.label} <span className="font-semibold text-ml-sub">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProReportPreview() {
  return (
    <FadeSection>
      <section className="bg-ml-surface py-20 px-6">
        <h2 className="text-[32px] md:text-[32px] font-[800] text-center mb-12 tracking-[-0.02em]">
          Pro 리포트 미리보기
        </h2>
        <div className="max-w-[800px] mx-auto">
          {/* Browser Top Bar */}
          <div className="bg-[#fafbfc] border border-ml-border border-b-0 rounded-t-2xl px-5 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5">
            <div className="bg-[#f0f2f5] rounded-lg px-3.5 py-1.5 text-xs text-ml-muted font-mono">
              matchlab-landing.vercel.app/pro/2026-03-28
            </div>
            <div className="text-[13px] font-semibold text-ml-sub">3월 28일 (토) 분석</div>
          </div>

          {/* Browser Frame */}
          <div className="bg-white rounded-b-2xl border border-ml-border border-t-0 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <div className="text-lg font-[800]">오늘의 전경기 AI 분석</div>
                <div className="bg-ml-accent text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  Pro 전용
                </div>
              </div>

              {/* Match Cards */}
              {MATCHES.map((m) => (
                <MatchCard key={m.teams} match={m} />
              ))}

              {/* Unlock Overlay */}
              <div className="text-center py-5 -mt-2">
                <div className="text-[15px] font-semibold mb-3">
                  오늘 분석 12경기 중 2경기만 공개 중
                </div>
                <div className="text-[13px] text-ml-sub mb-4">
                  Pro 구독으로 고확신 경기 + 전경기 분석을 확인하세요
                </div>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-1.5 bg-ml-accent hover:bg-ml-accent-hover text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
                >
                  Pro 시작하기 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
