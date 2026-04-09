"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import FadeSection from "@/lib/FadeSection";
import { LEAGUE_CONFIG } from "@/lib/constants";

function splitTeams(match) {
  const sep = match.includes(" vs ") ? " vs " : "vs";
  const parts = match.split(sep);
  return [parts[0]?.trim() ?? match, parts[1]?.trim() ?? ""];
}

/* ────────────────────────────────────────────
   Dummy fallback data
   ──────────────────────────────────────────── */
const DUMMY_MATCHES = [
  {
    id: "d1",
    match: "아스널 vs 첼시",
    league: "프리미어리그",
    date: new Date().toISOString().split("T")[0],
    prediction: "아스널 승",
    confidence: 4,
    confidenceLabel: "4성급",
    probability: 72,
    reason: "홈 최근 8경기 6승, 상대 전적 우위",
    isProOnly: false,
    homeTeamId: "42",
    awayTeamId: "49",
  },
  {
    id: "d2",
    match: "바르셀로나 vs 세비야",
    league: "라리가",
    date: new Date().toISOString().split("T")[0],
    prediction: "오버 2.5",
    confidence: 3,
    confidenceLabel: "3성급",
    probability: 65,
    reason: "양팀 최근 5경기 평균 3.2골",
    isProOnly: false,
    homeTeamId: "529",
    awayTeamId: "536",
  },
  {
    id: "d3",
    match: "인테르 vs 유벤투스",
    league: "세리에A",
    date: new Date().toISOString().split("T")[0],
    prediction: "인테르 승",
    confidence: 5,
    confidenceLabel: "5성급",
    probability: 78,
    reason: "리그 1위 홈 무패 행진 중",
    isProOnly: true,
    homeTeamId: "505",
    awayTeamId: "496",
  },
];

const FAQS = [
  {
    q: "MATCHLAB은 뭔가요?",
    a: "매일 유럽 축구 경기를 4종 앙상블 AI 모델로 분석하고, 확신도별로 분류해 제공하는 데이터 분석 서비스입니다.",
  },
  {
    q: "무료로도 쓸 수 있나요?",
    a: "네, 가입만 하면 전경기 AI 예측을 무료로 볼 수 있고, 적중률 대시보드도 열람 가능합니다.",
  },
  {
    q: "Pro는 언제든 해지할 수 있나요?",
    a: "네, 위약금 없이 언제든 해지 가능합니다. 해지 시 남은 기간까지는 이용 가능합니다.",
  },
  {
    q: "적중률은 어떻게 검증하나요?",
    a: "모든 예측은 경기 시작 전 자동으로 기록됩니다. 사후 수정이 불가능한 시스템이며, 누구나 기록을 열람할 수 있습니다.",
  },
];


/* ────────────────────────────────────────────
   PhoneMockup — simplified (no model grid)
   ────────────────────────────────────────────── */
function ReportPreview() {
  const homeProb = 72;
  const drawProb = 18;
  const awayProb = 10;

  return (
    <div className="relative w-[280px] max-sm:w-[260px] mx-auto shrink-0">
      <div className="relative bg-bg-card border border-bg-border rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40">
        {/* Notch */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-24 h-5 bg-bg-deep rounded-full" />
        </div>

        {/* Inner content — static report preview */}
        <div className="px-4 pb-5 space-y-3">
          {/* Logo */}
          <div className="flex items-center gap-2 border-b border-bg-border-subtle pb-2">
            <img src="/assets/logo/matchlab-logo-dark.svg" alt="MATCHLAB" className="h-4" />
          </div>

          {/* League + confidence */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium text-white/90" style={{ backgroundColor: "#3D195B55" }}>
              <img src="https://media.api-sports.io/football/leagues/39.png" alt="EPL" width={12} height={12} className="rounded-full bg-white p-0.5 object-contain" />
              프리미어리그
            </span>
            <span className="text-[9px] text-[#8494A7] font-semibold">4성급</span>
          </div>

          {/* Teams VS */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="flex flex-col items-center gap-1">
              <img src="https://media.api-sports.io/football/teams/42.png" alt="Arsenal" width={32} height={32} className="object-contain" />
              <span className="text-[13px] font-extrabold text-bg-50 leading-tight">아스널</span>
            </div>
            <span className="text-[12px] font-bold text-text-muted px-1">VS</span>
            <div className="flex flex-col items-center gap-1">
              <img src="https://media.api-sports.io/football/teams/49.png" alt="Chelsea" width={32} height={32} className="object-contain" />
              <span className="text-[13px] font-extrabold text-bg-50 leading-tight">첼시</span>
            </div>
          </div>

          {/* AI prediction pill */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: "#059669" }}>
              AI 예측: 아스널 승
            </span>
          </div>

          {/* Ensemble probability bars */}
          <div className="rounded-lg p-2.5 space-y-1.5" style={{ background: "#0F172A", border: "1px solid #1E2D47" }}>
            <div className="text-[9px] font-semibold text-text-secondary mb-1">4-모델 앙상블 확률</div>
            {[
              { label: "홈승", val: homeProb, highlight: true },
              { label: "무승부", val: drawProb, highlight: false },
              { label: "원정승", val: awayProb, highlight: false },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="w-10 text-right text-[9px] text-text-muted shrink-0">{b.label}</span>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "#1A2332" }}>
                  <div className="h-full rounded-full" style={{ width: `${b.val}%`, background: b.highlight ? "#059669" : "#475569" }} />
                </div>
                <span className={`w-8 text-[9px] font-mono-data font-medium shrink-0 ${b.highlight ? "text-white" : "text-text-muted"}`}>{b.val}%</span>
              </div>
            ))}
          </div>

          {/* Key reason */}
          <div className="text-[10px] text-text-secondary leading-relaxed font-body border-t border-bg-border-subtle pt-2">
            홈 최근 8경기 6승, 상대 전적 우위. 4개 모델 모두 홈승 예측 일치.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   DonutChart
   ──────────────────────────────────────────── */
function DonutChart({ rate, label }) {
  const R = 56;
  const C = R * 2 * Math.PI;
  const dash = C * (rate / 100);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={R} fill="none" stroke="#161F33" strokeWidth={14} />
        <circle
          cx={70} cy={70} r={R} fill="none"
          stroke="#059669" strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${dash} ${C - dash}`}
          transform="rotate(-90 70 70)"
        />
        <text x={70} y={64} textAnchor="middle" fill="#E1E7EF" fontSize={28} fontWeight="bold" fontFamily="'Space Grotesk', sans-serif">
          {rate}%
        </text>
        <text x={70} y={86} textAnchor="middle" fill="#8494A7" fontSize={12}>
          {label}
        </text>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────
   StatCard
   ──────────────────────────────────────────── */
function StatCard({ label, value }) {
  return (
    <div className="bg-bg-card border border-bg-border rounded-[14px] p-5 flex flex-col items-center justify-center text-center hover:border-bg-border transition-colors">
      <span className="text-text-primary font-bold text-xl font-display mb-1">{value}</span>
      <span className="text-text-muted text-xs font-body">{label}</span>
    </div>
  );
}

/* ────────────────────────────────────────────
   FAQ Accordion
   ──────────────────────────────────────────── */
function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-bg-card border border-bg-border-subtle rounded-[14px] mb-2 overflow-hidden hover:border-bg-border transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-[18px] text-[15px] font-semibold cursor-pointer flex justify-between items-center text-left bg-transparent border-none text-text-primary font-body"
      >
        {q}
        <span className="text-[#8494A7] text-xl font-normal ml-4 shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed font-body">{a}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────
   TeamLogoImg — lightweight img with fallback
   ──────────────────────────────────────────── */
function TeamLogoImg({ teamId, name, size = 28 }) {
  if (!teamId) return null;
  return (
    <img
      src={`https://media.api-sports.io/football/teams/${teamId}.png`}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 object-contain"
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}

/* ────────────────────────────────────────────
   LeaguePill (inline version of LeagueBadge)
   ──────────────────────────────────────────── */
function LeaguePill({ league }) {
  const config = LEAGUE_CONFIG[league];
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-600/20 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
        {league || "기타"}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white/90"
      style={{ backgroundColor: config.color + "55" }}
    >
      <img
        src={config.logo}
        alt={league}
        width={14}
        height={14}
        className="rounded-full bg-white p-0.5 object-contain"
        onError={(e) => { e.target.style.display = "none"; }}
      />
      {league}
    </span>
  );
}

/* ────────────────────────────────────────────
   MatchPreviewCard
   ──────────────────────────────────────────── */
function MatchPreviewCard({ match, variant }) {
  const [home, away] = splitTeams(match.match);
  const prob = match.probability ?? 0;

  if (variant === "pro") {
    return (
      <div className="relative rounded-xl overflow-hidden" style={{ background: "linear-gradient(145deg, #1A2332, #1E293B)", border: "1px solid #152035" }}>
        <div className="blur-[6px] pointer-events-none select-none p-5">
          <div className="flex items-center justify-between mb-3">
            <LeaguePill league={match.league} />
            <span className="text-[11px] text-[#8494A7] font-semibold">{match.confidence}성급</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex flex-col items-center gap-1">
              <TeamLogoImg teamId={match.homeTeamId} name={home} />
              <span className="text-[14px] font-bold text-bg-50">{home}</span>
            </div>
            <span className="text-[13px] font-bold text-text-muted">VS</span>
            <div className="flex flex-col items-center gap-1">
              <TeamLogoImg teamId={match.awayTeamId} name={away} />
              <span className="text-[14px] font-bold text-bg-50">{away}</span>
            </div>
          </div>
          <div className="text-sm text-text-primary">{match.prediction}</div>
        </div>
        <div className="absolute inset-0 bg-bg-card/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8494A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="text-white font-bold text-sm font-body">Pro 전용 · 고확신 경기</span>
          <span className="text-[#8494A7] text-xs font-body">가입 후 확인하세요</span>
        </div>
      </div>
    );
  }

  const isTop = variant === "top";
  const borderStyle = isTop
    ? { background: "linear-gradient(145deg, #1A2332, #1E293B)", border: "1px solid #334155" }
    : { background: "linear-gradient(145deg, #1A2332, #1E293B)", border: "1px solid #152035" };

  return (
    <div className={`rounded-xl overflow-hidden relative ${isTop ? "md:col-span-2" : ""}`} style={borderStyle}>
      <div className="p-5">
        {/* League + confidence */}
        <div className="flex items-center justify-between mb-3">
          <LeaguePill league={match.league} />
          <span className="text-[11px] text-[#8494A7] font-semibold">{match.confidence}성급</span>
        </div>

        {/* VS layout */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <TeamLogoImg teamId={match.homeTeamId} name={home} size={36} />
            <span className="text-[16px] font-extrabold text-bg-50 text-center leading-tight">{home}</span>
          </div>
          <span className="text-[14px] font-bold text-text-muted px-1">VS</span>
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <TeamLogoImg teamId={match.awayTeamId} name={away} size={36} />
            <span className="text-[16px] font-extrabold text-bg-50 text-center leading-tight">{away}</span>
          </div>
        </div>

        {/* Prediction + confidence bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-semibold text-text-primary font-body">{match.prediction}</span>
            {prob > 0 && (
              <span className="text-[13px] font-bold text-white font-display">{prob}%</span>
            )}
          </div>
          {prob > 0 && (
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#0F172A" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${prob}%`, background: "#059669" }}
              />
            </div>
          )}
        </div>

        {/* Reason */}
        {match.reason && (
          <p className="text-[11px] text-text-secondary border-t border-bg-border-subtle pt-2.5 font-body leading-relaxed">
            {match.reason}
          </p>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Section wrapper
   ════════════════════════════════════════════ */
function SectionWrap({ children, id, className = "" }) {
  return (
    <section id={id} className={`max-w-[960px] mx-auto py-20 md:py-24 px-5 border-t border-bg-border-subtle ${className}`}>
      {children}
    </section>
  );
}

/* ════════════════════════════════════════════
   Home (Landing Page)
   ════════════════════════════════════════════ */
export default function Home() {
  const [matches, setMatches] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    // Predictions
    fetch(`/api/predictions/${today}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        const list = json?.matches;
        if (Array.isArray(list) && list.length > 0) setMatches(list);
        else setMatches(DUMMY_MATCHES);
      })
      .catch(() => setMatches(DUMMY_MATCHES))
      .finally(() => setLoading(false));

    // Dashboard
    fetch("/api/dashboard?period=all")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => setDashData(json))
      .catch(() => {});
  }, []);

  /* Big match check */
  const BIG_MATCH_TEAMS = [
    ['Barcelona', 'Real Madrid'], ['Manchester United', 'Manchester City'],
    ['Liverpool', 'Manchester United'], ['Arsenal', 'Tottenham'],
    ['AC Milan', 'Inter'], ['Juventus', 'AC Milan'],
    ['Bayern Munich', 'Borussia Dortmund'], ['PSG', 'Marseille'],
    ['Atletico Madrid', 'Real Madrid'], ['Barcelona', 'Atletico Madrid'],
  ];
  function checkBigMatch(p) {
    if (p.isBigMatch) return true;
    if (p.league?.includes('챔피언스리그') || p.league?.includes('Champions League') || p.league?.includes('유로파')) return true;
    const [h, a] = splitTeams(p.match);
    return BIG_MATCH_TEAMS.some(([t1, t2]) =>
      (h.includes(t1) && a.includes(t2)) || (h.includes(t2) && a.includes(t1))
    );
  }
  const bigMatches = matches.filter(checkBigMatch);

  /* Derive cards */
  const topPick = matches.find((m) => m.confidence >= 4) ?? matches[0];
  const normalPick = matches.find((m) => m.confidence <= 3) ?? matches[1];
  const proPick = matches.find((m) => m.confidence >= 5) ?? matches[2];

  /* Dashboard stats */
  const overallRate = dashData?.overall?.hitRate ?? dashData?.overall?.hit_rate ?? 68;
  const totalGames = dashData?.overall?.total ?? 500;
  const highConfRate = dashData?.highConfidence?.hitRate ?? dashData?.high_confidence?.hit_rate ?? 0;
  const weeklyRate = dashData?.weekly_trend?.at(-1)?.overall?.hit_rate ?? 0;
  const recentStreak = dashData?.recentStreak ?? 0;

  return (
    <>
      <Navbar />
      <main className="bg-bg-deep">
        {/* ═══ Hero + PhoneMockup ═══ */}
        <section className="pt-8 pb-20 md:pt-16 md:pb-24 px-5">
          <div className="max-w-[960px] mx-auto flex flex-wrap items-center gap-10 lg:gap-16">
            {/* Left */}
            <div className="flex-1 min-w-[280px]">
              <h1 className="font-body font-extrabold text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] leading-[1.15] tracking-[-0.5px] text-white mb-2">
                매일 업데이트되는
                <br />
                <span className="text-[#E1E7EF]">AI 축구 분석 리포트</span>
              </h1>
              {highConfRate > 0 && (
                <p className="text-white text-lg font-display font-bold mb-4">
                  고확신(4성급 이상) 적중률 {highConfRate}% · {totalGames}경기 검증
                </p>
              )}
              <p className="text-[#6B7280] text-[14px] md:text-[15px] mb-8 max-w-md leading-relaxed font-body break-keep">
                4개 통계 모델이 매일 수십 경기를 분석합니다. 가장 적중 확률 높은 경기만 골라, 근거와 함께 제공합니다.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-2">
                <a
                  href="/login"
                  className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-8 py-4 rounded-[14px] text-lg transition-all font-body"
                >
                  무료로 시작하기
                </a>
                <a
                  href="#pricing"
                  className="border border-bg-border text-text-secondary hover:text-text-primary font-semibold px-7 py-3.5 rounded-[14px] text-[15px] transition-colors font-body"
                >
                  Pro 상품 보기
                </a>
              </div>
              <p className="text-xs text-text-muted font-body mb-8">30초 가입 · 카드 불필요</p>
            </div>

            {/* Right — Report Preview */}
            <ReportPreview />
          </div>
        </section>

        {/* ═══ 빅매치 배너 (단순화) ═══ */}
        {bigMatches.length > 0 && (
          <div className="mx-auto max-w-2xl px-4 py-3">
            <div className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "#161F33" }}>
              <p className="text-sm text-[#E1E7EF]">
                오늘의 빅매치: <span className="font-semibold text-white">{splitTeams(bigMatches[0].match).join(' vs ')}</span>
                {bigMatches.length > 1 && <span className="text-[#8494A7]"> 외 {bigMatches.length - 1}건</span>}
              </p>
              <span className="text-[10px] text-[#8494A7] font-semibold ml-1">Pro 전용</span>
            </div>
          </div>
        )}

        {/* ═══ 오늘의 분석 미리보기 ═══ */}
        <FadeSection>
          <SectionWrap id="preview">
            <div className="text-center mb-10">
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary">
                오늘의 분석 미리보기
              </h2>
              <p className="text-text-secondary text-sm mt-2 font-body">매일 아침 업데이트되는 AI 예측을 확인하세요</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-bg-card border border-bg-border-subtle rounded-[14px] p-5 animate-pulse">
                    <div className="h-4 bg-bg-raised rounded w-20 mb-3" />
                    <div className="h-4 bg-bg-raised rounded w-3/4 mb-2" />
                    <div className="h-3 bg-bg-raised rounded w-1/2 mb-2" />
                    <div className="h-5 bg-bg-raised rounded w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* TOP PICK — spans 2 cols on desktop */}
                {topPick && <MatchPreviewCard match={topPick} variant="top" />}

                {/* Normal + Pro stacked */}
                <div className="flex flex-col gap-4">
                  {normalPick && <MatchPreviewCard match={normalPick} variant="normal" />}
                  {proPick && <MatchPreviewCard match={proPick} variant="pro" />}
                </div>
              </div>
            )}

            {/* Preview CTA */}
            <div className="text-center mt-6">
              <p className="text-sm text-text-secondary mb-4">오늘의 고확신 경기, 지금 확인하세요</p>
              <a
                href="/login"
                className="inline-block bg-[#059669] hover:bg-[#047857] text-white font-bold px-6 py-3 rounded-[14px] text-sm transition-all font-body"
              >
                전체 분석 보기 →
              </a>
              <p className="text-xs text-text-muted mt-2">무료 가입으로 전경기 예측 열람</p>
            </div>
          </SectionWrap>
        </FadeSection>

        {/* ═══ 적중률 라이브 트래커 ═══ */}
        <FadeSection id="accuracy">
          <SectionWrap>
            <div className="text-center mb-10">
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary">
                적중률 라이브 트래커
              </h2>
              <p className="text-text-secondary mt-2 text-sm font-body">검증 가능한 기록이 자동 공개됩니다</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Donut — row-span-2, 고확신 적중률 */}
              <div className="bg-bg-card border border-bg-border rounded-[14px] p-6 flex items-center justify-center row-span-2">
                {highConfRate > 0 ? (
                  <DonutChart rate={highConfRate} label="고확신 4성급+" />
                ) : (
                  <div className="text-center">
                    <div className="text-text-muted text-sm font-body">데이터 수집중</div>
                  </div>
                )}
              </div>

              <StatCard label="전체 적중률" value={overallRate > 0 ? `${overallRate}%` : "—%"} />
              <StatCard label="이번 주" value={weeklyRate > 0 ? `${weeklyRate}%` : "—%"} />
              <StatCard label="누적 분석 경기" value={`${totalGames}+`} />
              <StatCard label="최근 적중 연속" value={recentStreak > 0 ? `${recentStreak}연속` : "—"} />
            </div>

            <div className="text-center mt-6 space-y-3">
              <a
                href="/dashboard"
                className="text-sm text-[#8494A7] underline hover:text-white transition-colors font-body"
              >
                전체 대시보드 보기 →
              </a>
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 border border-bg-border-subtle rounded-full px-4 py-1.5 text-xs text-text-muted">
                  모든 예측은 경기 시작 전 기록 · 사후 수정 불가
                </span>
              </div>
            </div>
          </SectionWrap>
        </FadeSection>

        {/* ═══ Pro 비교 ═══ */}
        <FadeSection>
          <SectionWrap>
            <div className="text-center mb-10">
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary">
                Pro 구독자는 매일 이런 분석을 받습니다
              </h2>
              <p className="text-text-secondary text-sm mt-2 font-body">무료는 맛보기, Pro는 매일 전체 분석</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 max-w-[720px] mx-auto">
              {/* Free card */}
              <div className="bg-bg-card border border-bg-border-subtle rounded-[14px] p-6">
                <div className="font-body font-bold text-lg mb-4 text-[#E1E7EF]">Free</div>
                <ul className="space-y-3 text-sm font-body mb-5">
                  {["전경기 예측 열람", "1~3성급 경기", "예측 결과 + 확률", "핵심 근거 3줄"].map(text => (
                    <li key={text} className="flex items-start gap-2 text-text-secondary">
                      <span className="text-[#8494A7] shrink-0">•</span>
                      {text}
                    </li>
                  ))}
                </ul>
                {/* Mini report — blurred/locked */}
                <div className="rounded-xl overflow-hidden border border-bg-border-subtle relative" style={{ background: "#0F172A" }}>
                  <div className="p-3 space-y-2 blur-[4px] pointer-events-none select-none">
                    <div className="text-center text-[11px] font-bold text-bg-50">아스널 vs 첼시</div>
                    <div className="space-y-1">
                      {[{ l: "홈승", w: 72 }, { l: "무", w: 18 }, { l: "원정", w: 10 }].map(b => (
                        <div key={b.l} className="flex items-center gap-1">
                          <span className="w-7 text-[7px] text-text-muted text-right">{b.l}</span>
                          <div className="flex-1 h-2 rounded-full" style={{ background: "#1A2332" }}>
                            <div className="h-full rounded-full bg-slate-500" style={{ width: `${b.w}%` }} />
                          </div>
                          <span className="text-[7px] text-text-muted w-6">{b.w}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl" style={{ background: "rgba(6,11,20,0.6)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8494A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span className="text-text-muted text-[10px] font-bold">상세 근거 잠김</span>
                  </div>
                </div>
              </div>

              {/* Pro card */}
              <div className="rounded-[14px] p-6" style={{ background: "linear-gradient(145deg, #1A2332, #1E293B)", border: "1px solid #334155" }}>
                <div className="font-body font-bold text-lg mb-4 text-[#E1E7EF]">Pro</div>
                <ul className="space-y-3 text-sm font-body mb-5">
                  {[
                    { text: "고확신 4~5성급 경기", highlight: true },
                    { text: "빅매치 전경기 분석", highlight: true },
                    { text: "상세 분석 리포트 전체 열람", highlight: false },
                    { text: "시장 지표 분석", highlight: false },
                    { text: "전술 분석 · 핵심 변수", highlight: false },
                  ].map(item => (
                    <li key={item.text} className={`flex items-start gap-2 ${item.highlight ? "text-white font-semibold" : "text-text-secondary"}`}>
                      <span className="text-[#8494A7] shrink-0">•</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
                {/* Mini report — fully open */}
                <div className="rounded-xl overflow-hidden border border-bg-border" style={{ background: "#0F172A" }}>
                  <div className="p-3 space-y-2">
                    <div className="text-center text-[11px] font-bold text-bg-50">아스널 vs 첼시</div>
                    <div className="flex justify-center">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#059669" }}>AI 예측: 아스널 승</span>
                    </div>
                    <div className="space-y-1">
                      {[{ l: "홈승", w: 72, h: true }, { l: "무", w: 18, h: false }, { l: "원정", w: 10, h: false }].map(b => (
                        <div key={b.l} className="flex items-center gap-1">
                          <span className="w-7 text-[7px] text-text-muted text-right">{b.l}</span>
                          <div className="flex-1 h-2 rounded-full" style={{ background: "#1A2332" }}>
                            <div className="h-full rounded-full" style={{ width: `${b.w}%`, background: b.h ? "#059669" : "#475569" }} />
                          </div>
                          <span className={`text-[7px] w-6 font-mono-data ${b.h ? "text-white" : "text-text-muted"}`}>{b.w}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[8px] text-text-secondary border-t border-bg-border-subtle pt-1.5">
                      홈 최근 8경기 6승, 상대 전적 우위. 4개 모델 모두 홈승 일치.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 빅매치 비주얼 비교 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-lg mx-auto">
              {/* Free */}
              <div className="rounded-xl p-4 border border-[#334155] bg-[#1E293B]/50 relative overflow-hidden">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#8494A7] border border-[#334155] mb-2">빅매치</span>
                <div className="blur-sm pointer-events-none select-none">
                  <p className="text-[13px] font-bold text-[#E1E7EF]">바르셀로나 vs 레알 마드리드</p>
                  <p className="text-[11px] text-[#94A3B8] mt-1">AI 예측: ████ (██.█%)</p>
                  <p className="text-[11px] text-[#8494A7] mt-1">확신도: 5성급</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.6)" }}>
                  <span className="text-xs font-semibold text-[#8494A7]">Pro 전용</span>
                </div>
              </div>
              {/* Pro */}
              <div className="rounded-xl p-4 border border-[#334155] bg-[#1E293B]/50">
                <div className="flex gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#8494A7] border border-[#334155]">빅매치</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-[#8494A7] border border-[#334155]">PRO</span>
                </div>
                <p className="text-[13px] font-bold text-[#E1E7EF]">바르셀로나 vs 레알 마드리드</p>
                <p className="text-[11px] text-white font-semibold mt-1">AI 예측: 바르셀로나 승 (64.2%)</p>
                <p className="text-[11px] text-[#8494A7] mt-1">확신도: 5성급</p>
                <p className="text-[10px] text-[#566378] mt-1">ELO +142 | xG 2.31 vs 0.94</p>
              </div>
            </div>
            <p className="text-center text-[11px] text-[#566378] mt-3">빅매치 분석은 Pro에서만 열람 가능합니다</p>

            <div className="text-center mt-8">
              <a
                href="/login"
                className="inline-block py-3.5 px-8 rounded-[14px] text-[15px] font-bold text-white transition-all font-body"
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
              >
                Pro 시작하기 →
              </a>
            </div>
          </SectionWrap>
        </FadeSection>

        {/* ═══ Pricing ═══ */}
        <FadeSection id="pricing">
          <SectionWrap>
            <div className="text-center mb-10">
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary">
                AI 축구 분석 리포트 구독
                <br />
                — 월 9,900원
              </h2>
              <p className="text-text-secondary text-sm mt-2 font-body">커피 2잔 값으로 매일 AI 분석</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 max-w-[640px] mx-auto">
              {/* Free */}
              <div className="bg-bg-card border border-bg-border-subtle rounded-[14px] px-7 py-9 hover:border-bg-border transition-colors order-last sm:order-first">
                <div className="font-body font-bold text-xl mb-1 text-[#E1E7EF]">Free</div>
                <div className="font-display font-bold text-[28px] tracking-[-1px] text-text-primary mb-1">₩0</div>
                <ul className="mt-5 mb-6 space-y-2">
                  {[
                    "전경기 예측 열람",
                    "1~3성급 경기",
                    "적중률 리포트 (전체 공개)",
                  ].map((text) => (
                    <li key={text} className="text-sm flex items-start gap-2 font-body">
                      <span className="text-[#8494A7] shrink-0">•</span>
                      <span className="text-text-secondary">{text}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/login"
                  className="block w-full py-3.5 rounded-[14px] text-[15px] font-bold text-center bg-[#059669] hover:bg-[#047857] text-white transition-all font-body"
                >
                  무료로 시작하기
                </a>
              </div>

              {/* Pro */}
              <div
                className="relative rounded-[14px] px-7 py-9 order-first sm:order-last hover:border-bg-border transition-colors"
                style={{ background: "linear-gradient(135deg, #1c1308, #2a1a08)", border: "2px solid #d97706" }}
              >
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full font-body"
                  style={{ backgroundColor: "#d97706" }}
                >
                  얼리버드
                </div>
                <div className="font-body font-bold text-xl mb-1 text-[#E1E7EF]">Pro</div>
                <p className="text-[11px] text-[#8494A7] mt-1 font-body">얼리버드 가격은 곧 종료됩니다</p>
                <div className="text-[14px] text-text-muted line-through font-body">정가 ₩14,900</div>
                <div className="font-display font-bold text-[28px] tracking-[-1px] text-gold-400 mb-1">월 ₩9,900</div>
                <p className="text-[#8494A7] text-xs mb-4 font-body">
                  매일 가장 유리한 경기만 빠르게 받고 싶은 분께
                </p>
                <ul className="mt-3 mb-6 space-y-2">
                  {[
                    { text: "Free의 모든 것 +", highlight: false },
                    { text: "고확신 4~5성급 경기 (AI가 가장 자신 있는 경기)", highlight: true },
                    { text: "빅매치 전경기 분석 (챔스·더비·엘클라시코)", highlight: true },
                    { text: "4개 모델 상세 근거 · 확률", highlight: false },
                    { text: "시장 지표 분석", highlight: false },
                    { text: "웹 대시보드 열람", highlight: false },
                  ].map((item) => (
                    <li key={item.text} className="text-sm flex items-start gap-2 font-body">
                      <span className="text-[#8494A7] shrink-0">•</span>
                      <span className={item.highlight ? "text-white font-semibold" : "text-text-secondary"}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/login"
                  className="block w-full py-3.5 rounded-[14px] text-[15px] font-bold text-center text-white transition-all font-body"
                  style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
                >
                  Pro 시작하기
                </a>
                {dashData?.highConfidence && dashData.highConfidence.total > 0 && (
                  <p className="text-[11px] text-[#8494A7] text-center mt-3 font-body">
                    어제 고확신 경기 결과: {dashData.highConfidence.correct}/{dashData.highConfidence.total} 적중
                  </p>
                )}
              </div>
            </div>
          </SectionWrap>
        </FadeSection>

        {/* ═══ FAQ ═══ */}
        <FadeSection>
          <SectionWrap id="faq">
            <div className="text-center mb-10">
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary">
                자주 묻는 질문
              </h2>
            </div>
            <div className="max-w-[700px] mx-auto">
              {FAQS.map((faq) => (
                <AccordionItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </SectionWrap>
        </FadeSection>

        {/* ═══ Final CTA ═══ */}
        <section className="py-20 px-5">
          <div className="max-w-[960px] mx-auto text-center">
            <h2 className="font-body font-bold text-[24px] md:text-[32px] text-text-primary">
              매일 경기 분석, 아직 직접 하세요?
            </h2>
            <p className="text-text-secondary text-sm mt-3">AI가 매일 골라주는 경기, 무료로 시작하세요.</p>
            <a
              href="/login"
              className="inline-block bg-[#059669] hover:bg-[#047857] text-white font-bold px-8 py-4 rounded-[14px] text-[15px] transition-all font-body mt-6"
            >
              무료로 시작하기
            </a>
            <p className="text-xs text-text-muted mt-3">30초 가입 · 카드 불필요</p>
          </div>
        </section>
      </main>

      {/* ═══ Footer ═══ */}
      <Footer />
    </>
  );
}
