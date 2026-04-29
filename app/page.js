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
    confidenceLabel: "⭐⭐⭐⭐",
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
    confidenceLabel: "⭐⭐⭐",
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
    confidenceLabel: "⭐⭐⭐⭐⭐",
    probability: 78,
    reason: "리그 1위 홈 무패 행진 중",
    isProOnly: true,
    homeTeamId: "505",
    awayTeamId: "496",
  },
];

const LEAGUES_PILLS = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "UCL"];

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
   PhoneMockup
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
            <span className="inline-flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="10" height="10" viewBox="0 0 20 20" fill={i <= 4 ? "#FBBF24" : "#334155"}>
                  <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.69l5.34-.78z" />
                </svg>
              ))}
            </span>
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
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg, #059669, #10B981)" }}>
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
                  <div className="h-full rounded-full" style={{ width: `${b.val}%`, background: b.highlight ? "#10B981" : "#475569" }} />
                </div>
                <span className={`w-8 text-[9px] font-mono-data font-medium shrink-0 ${b.highlight ? "text-emerald-400" : "text-text-muted"}`}>{b.val}%</span>
              </div>
            ))}
          </div>

          {/* Model data sub-card */}
          <div className="rounded-lg p-2.5 space-y-1" style={{ background: "#0F172A", border: "1px solid #1E2D47" }}>
            <div className="text-[9px] font-semibold text-text-secondary mb-1">모델별 분석</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "푸아송", home: "68%", away: "12%" },
                { label: "ELO", home: "71%", away: "11%" },
                { label: "xG 기반", home: "74%", away: "9%" },
                { label: "시장 지표", home: "70%", away: "13%" },
              ].map(m => (
                <div key={m.label} className="rounded py-1 px-1.5 text-center" style={{ background: "#1A2332" }}>
                  <div className="text-[8px] text-text-muted">{m.label}</div>
                  <div className="font-mono-data text-[9px] text-bg-200">{m.home} : {m.away}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key reason */}
          <div className="text-[10px] text-text-secondary leading-relaxed font-body border-t border-bg-border-subtle pt-2">
            홈 최근 8경기 6승, 상대 전적 우위. 4개 모델 모두 홈승 예측 일치.
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-text-muted mt-3 font-body">가입하면 매일 이렇게 보입니다</p>
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
          stroke="#10B981" strokeWidth={14} strokeLinecap="round"
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
        <span className="text-emerald-500 text-xl font-normal ml-4 shrink-0">{open ? "−" : "+"}</span>
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
   GoldStars
   ──────────────────────────────────────────── */
function GoldStars({ count }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={i < count ? "#FBBF24" : "#334155"}>
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.69l5.34-.78z" />
        </svg>
      ))}
    </span>
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
   MatchPreviewCard — /home TopPick 스타일
   ──────────────────────────────────────────── */
function MatchPreviewCard({ match, variant }) {
  const [home, away] = splitTeams(match.match);
  // API has no probability field — use dummy probability if present, otherwise show confidenceLabel
  const prob = match.probability ?? 0;

  if (variant === "pro") {
    return (
      <div className="relative rounded-xl overflow-hidden" style={{ background: "linear-gradient(145deg, #1A2332, #1E293B)", border: "1px solid #152035" }}>
        <div className="blur-[6px] pointer-events-none select-none p-5">
          <div className="flex items-center justify-between mb-3">
            <LeaguePill league={match.league} />
            <GoldStars count={match.confidence} />
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
          <span className="text-2xl">🔒</span>
          <span className="text-emerald-500 font-bold text-sm font-body">Pro 전용 · 고확신 분석</span>
          <span className="text-gold-400 text-xs font-bold mt-1">어제 고확신 경기: 3전 2승 적중</span>
          <span className="text-text-muted text-xs font-body">가입 후 확인하세요</span>
        </div>
      </div>
    );
  }

  const isTop = variant === "top";
  const borderStyle = isTop
    ? { background: "linear-gradient(145deg, #1A2332, #1E293B)", border: "1px solid #d97706" }
    : { background: "linear-gradient(145deg, #1A2332, #1E293B)", border: "1px solid #152035" };

  return (
    <div className="rounded-xl overflow-hidden relative" style={borderStyle}>
      {/* Gold bar for TOP PICK */}
      {isTop && (
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #FBBF24, #F59E0B, #FBBF24)" }} />
      )}

      <div className="p-5">
        {/* League + badge + stars */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LeaguePill league={match.league} />
            {isTop && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/30 font-mono-data uppercase tracking-wider">
                TOP PICK
              </span>
            )}
          </div>
          <GoldStars count={match.confidence} />
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
            {prob > 0 ? (
              <span className="text-[13px] font-bold text-emerald-400 font-display">{prob}%</span>
            ) : (
              <span className="text-[12px] text-text-muted">확신도 {match.confidenceLabel || `⭐×${match.confidence}`}</span>
            )}
          </div>
          {prob > 0 && (
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#0F172A" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${prob}%`,
                  background: isTop
                    ? "linear-gradient(90deg, #FBBF24, #10B981)"
                    : "#10B981",
                }}
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
        {/* ═══ 2. Hero + PhoneMockup ═══ */}
        <section className="pt-8 pb-20 md:pt-16 md:pb-24 px-5">
          <div className="max-w-[960px] mx-auto flex flex-wrap items-center gap-10 lg:gap-16">
            {/* Left */}
            <div className="flex-1 min-w-[280px]">
              {/* League pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {LEAGUES_PILLS.map((l) => (
                  <span key={l} className="text-[11px] font-semibold px-3 py-1 rounded-full border border-bg-border-subtle text-text-secondary">
                    {l}
                  </span>
                ))}
              </div>

              <h1 className="font-body font-extrabold text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] leading-[1.15] tracking-[-0.5px] text-white mb-2">
                매일 아침,
                <br />
                <span className="text-emerald-400">AI가 쓰는 축구 매거진</span>
              </h1>
              <p className="text-text-secondary text-[15px] md:text-[16px] font-body mb-4">
                AI가 경기를 분석하고, 결과가 증명합니다.
              </p>
              {highConfRate > 0 && (
                <p className="text-emerald-400 text-lg font-display font-bold mb-4">
                  AI가 분석한 고확신 경기 적중 기록 {highConfRate}% · {totalGames}경기 (투명 검증)
                </p>
              )}
              <p className="text-[#6B7280] text-[14px] md:text-[15px] mb-8 max-w-md leading-relaxed font-body break-keep">
                4개 통계 모델이 매일 경기를 분석해 매거진으로 발행합니다. 경기 전 예측·경기 후 전술 분석·주간 매거진까지 한곳에서 받아보세요.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-2">
                <a
                  href="/login"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-[14px] text-lg transition-all font-body"
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

        {/* ═══ 매거진 3섹션 배너 — 한 매거진의 3개 정기 코너 ═══ */}
        <div className="mx-auto max-w-[960px] px-4 py-6">
          <div className="rounded-2xl border border-bg-border-subtle bg-bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-bg-border-subtle flex items-center justify-between">
              <span className="text-[11px] tracking-[0.2em] text-text-muted font-display font-bold uppercase">
                MATCHLAB Magazine
              </span>
              <span className="text-[11px] text-text-muted font-body">매일 아침 발행</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-bg-border-subtle">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold tracking-wider">운영 중</span>
                </div>
                <h3 className="font-body font-bold text-[15px] text-text-primary mb-1">경기 전 AI 예측</h3>
                <p className="text-[13px] text-text-secondary font-body leading-relaxed">매일 아침 4모델 앙상블이 분석한 고확신 경기</p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-raised text-text-secondary font-bold tracking-wider">이번 주 오픈</span>
                </div>
                <h3 className="font-body font-bold text-[15px] text-text-primary mb-1">경기 후 전술 분석</h3>
                <p className="text-[13px] text-text-secondary font-body leading-relaxed">Claude AI가 쓰는 800자 전술 리뷰 + 핵심 변수</p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-raised text-text-secondary font-bold tracking-wider">다음 주 오픈</span>
                </div>
                <h3 className="font-body font-bold text-[15px] text-text-primary mb-1">주간 매거진</h3>
                <p className="text-[13px] text-text-secondary font-body leading-relaxed">AI 파워 랭킹 + 리그 흐름 + 주말 관전 가이드</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 빅매치 배너 ═══ */}
        {bigMatches.length > 0 && (
          <div className="mx-auto max-w-2xl px-4 py-3">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-orange-500/10 border border-orange-500/30 px-4 py-2.5">
              <span className="text-orange-400 text-sm font-bold animate-pulse">🔥</span>
              <p className="text-sm text-[#F1F5F9]">
                오늘의 빅매치: <span className="font-semibold text-orange-400">{splitTeams(bigMatches[0].match).join(' vs ')}</span>
                {bigMatches.length > 1 && <span className="text-[#94A3B8]"> 외 {bigMatches.length - 1}건</span>}
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-semibold">Pro 전용</span>
            </div>
          </div>
        )}

        {/* ═══ 3. 오늘의 분석 미리보기 ═══ */}
        <FadeSection>
          <SectionWrap id="preview">
            <div className="text-center mb-10">
              <span className="section-label mb-3">TODAY</span>
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary mt-3">
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
                {/* TOP PICK */}
                {topPick && <MatchPreviewCard match={topPick} variant="top" />}

                {/* Normal */}
                {normalPick && <MatchPreviewCard match={normalPick} variant="normal" />}

                {/* Pro locked */}
                {proPick && <MatchPreviewCard match={proPick} variant="pro" />}
              </div>
            )}

            {/* Preview CTA */}
            <div className="text-center mt-6">
              <p className="text-sm text-text-secondary mb-4">오늘의 고확신 경기, 지금 확인하세요</p>
              <a
                href="/login"
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-[14px] text-sm transition-all font-body"
              >
                전체 분석 보기 →
              </a>
              <p className="text-xs text-text-muted mt-2">무료 가입으로 전경기 예측 열람</p>
            </div>
          </SectionWrap>
        </FadeSection>

        {/* ═══ 4. 적중률 라이브 트래커 ═══ */}
        <FadeSection id="accuracy">
          <SectionWrap>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                <span className="section-label" style={{ border: "none", padding: 0 }}>LIVE DATA</span>
              </div>
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary">
                적중률 라이브 트래커
              </h2>
              <p className="text-text-secondary mt-2 text-sm font-body">검증 가능한 기록이 자동 공개됩니다</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Donut — row-span-2, 고확신 적중률 */}
              <div className="bg-bg-card border border-bg-border rounded-[14px] p-6 flex items-center justify-center row-span-2">
                {highConfRate > 0 ? (
                  <DonutChart rate={highConfRate} label="고확신 ⭐4+" />
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
                className="text-sm text-emerald-400 underline hover:text-emerald-300 transition-colors font-body"
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

        {/* ═══ 5. Pro 비교 ═══ */}
        <FadeSection>
          <SectionWrap>
            <div className="text-center mb-10">
              <span className="section-label mb-3">PRO</span>
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary mt-3">
                Pro 구독자는 매일 이런 분석을 받습니다
              </h2>
              <p className="text-text-secondary text-sm mt-2 font-body">무료는 맛보기, Pro는 매일 전체 분석</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 max-w-[720px] mx-auto">
              {/* Free card + blurred mockup */}
              <div className="bg-bg-card border border-bg-border-subtle rounded-[14px] p-6">
                <div className="font-body font-bold text-lg mb-4 text-emerald-500">Free</div>
                <ul className="space-y-3 text-sm font-body mb-5">
                  <li className="flex items-start gap-2 text-text-secondary">
                    <span className="text-emerald-500 shrink-0">✅</span>
                    전경기 AI 예측 열람
                  </li>
                  <li className="flex items-start gap-2 text-text-secondary">
                    <span className="text-emerald-500 shrink-0">✅</span>
                    확신도 ⭐~⭐⭐⭐
                  </li>
                  <li className="flex items-start gap-2 text-text-secondary">
                    <span className="text-emerald-500 shrink-0">✅</span>
                    예측 결과 + 확률
                  </li>
                  <li className="flex items-start gap-2 text-text-secondary">
                    <span className="text-emerald-500 shrink-0">✅</span>
                    핵심 근거 3줄
                  </li>
                </ul>
                {/* Mini report — blurred/locked */}
                <div className="rounded-xl overflow-hidden border border-bg-border-subtle relative" style={{ background: "#0F172A" }}>
                  <div className="p-3 space-y-2 blur-[4px] pointer-events-none select-none">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-medium text-white/80" style={{ backgroundColor: "#3D195B55" }}>EPL</span>
                      <span className="text-[8px] text-text-muted ml-auto">⭐⭐⭐⭐</span>
                    </div>
                    <div className="text-center text-[11px] font-bold text-bg-50">아스널 vs 첼시</div>
                    <div className="flex justify-center">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">AI 예측: 아스널 승</span>
                    </div>
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
                    <div className="rounded-lg p-2 space-y-1" style={{ background: "#1A2332" }}>
                      <div className="text-[7px] text-text-muted">모델별 분석</div>
                      <div className="grid grid-cols-2 gap-1">
                        {["푸아송", "ELO", "xG", "시장"].map(m => (
                          <div key={m} className="rounded py-0.5 px-1 text-center" style={{ background: "#0F172A" }}>
                            <div className="text-[6px] text-text-muted">{m}</div>
                            <div className="text-[7px] text-bg-200">--% : --%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl" style={{ background: "rgba(6,11,20,0.6)" }}>
                    <span className="text-xl">🔒</span>
                    <span className="text-text-muted text-[10px] font-bold">상세 근거 잠김</span>
                  </div>
                </div>
              </div>

              {/* Pro card + open mockup */}
              <div className="rounded-[14px] p-6" style={{ background: "linear-gradient(145deg, #1A2332, #1E293B)", border: "2px solid #d97706" }}>
                <div className="font-body font-bold text-lg mb-4 text-gold-400">Pro</div>
                <ul className="space-y-3 text-sm font-body mb-5">
                  <li className="flex items-start gap-2 text-gold-400 font-semibold">
                    <span className="text-emerald-500 shrink-0">✅</span>
                    고확신 ⭐4+⭐5 경기
                  </li>
                  <li className="flex items-start gap-2 text-orange-400 font-semibold">
                    <span className="text-emerald-500 shrink-0">✅</span>
                    🔥 빅매치 전경기 분석
                  </li>
                  <li className="flex items-start gap-2 text-text-secondary">
                    <span className="text-emerald-500 shrink-0">✅</span>
                    상세 분석 리포트 전체 열람
                  </li>
                  <li className="flex items-start gap-2 text-text-secondary">
                    <span className="text-emerald-500 shrink-0">✅</span>
                    시장 지표 분석
                  </li>
                  <li className="flex items-start gap-2 text-text-secondary">
                    <span className="text-emerald-500 shrink-0">✅</span>
                    전술 분석 · 핵심 변수
                  </li>
                </ul>
                {/* Mini report — fully open */}
                <div className="rounded-xl overflow-hidden border border-bg-border" style={{ background: "#0F172A" }}>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-medium text-white/80" style={{ backgroundColor: "#3D195B55" }}>EPL</span>
                      <span className="text-[8px] text-gold-400 ml-auto">⭐⭐⭐⭐</span>
                    </div>
                    <div className="text-center text-[11px] font-bold text-bg-50">아스널 vs 첼시</div>
                    <div className="flex justify-center">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "linear-gradient(135deg, #059669, #10B981)" }}>AI 예측: 아스널 승</span>
                    </div>
                    <div className="space-y-1">
                      {[{ l: "홈승", w: 72, h: true }, { l: "무", w: 18, h: false }, { l: "원정", w: 10, h: false }].map(b => (
                        <div key={b.l} className="flex items-center gap-1">
                          <span className="w-7 text-[7px] text-text-muted text-right">{b.l}</span>
                          <div className="flex-1 h-2 rounded-full" style={{ background: "#1A2332" }}>
                            <div className="h-full rounded-full" style={{ width: `${b.w}%`, background: b.h ? "#10B981" : "#475569" }} />
                          </div>
                          <span className={`text-[7px] w-6 font-mono-data ${b.h ? "text-emerald-400" : "text-text-muted"}`}>{b.w}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg p-2 space-y-1" style={{ background: "#1A2332" }}>
                      <div className="text-[7px] text-text-secondary font-semibold">모델별 분석</div>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { m: "푸아송", h: "68%", a: "12%" },
                          { m: "ELO", h: "71%", a: "11%" },
                          { m: "xG", h: "74%", a: "9%" },
                          { m: "시장", h: "70%", a: "13%" },
                        ].map(d => (
                          <div key={d.m} className="rounded py-0.5 px-1 text-center" style={{ background: "#0F172A" }}>
                            <div className="text-[6px] text-text-muted">{d.m}</div>
                            <div className="text-[7px] text-bg-200 font-mono-data">{d.h} : {d.a}</div>
                          </div>
                        ))}
                      </div>
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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-2">🔥 빅매치</span>
                <div className="blur-sm pointer-events-none select-none">
                  <p className="text-[13px] font-bold text-[#E1E7EF]">바르셀로나 vs 레알 마드리드</p>
                  <p className="text-[11px] text-[#94A3B8] mt-1">AI 예측: ████ (██.█%)</p>
                  <p className="text-[11px] text-[#FBBF24] mt-1">확신도: ⭐⭐⭐⭐⭐</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.6)" }}>
                  <span className="text-xs font-semibold text-[#94A3B8]">🔒 Pro 전용</span>
                </div>
              </div>
              {/* Pro */}
              <div className="rounded-xl p-4 border-2 border-[#10B981] bg-[#1E293B]/50">
                <div className="flex gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">🔥 빅매치</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">PRO</span>
                </div>
                <p className="text-[13px] font-bold text-[#F1F5F9]">바르셀로나 vs 레알 마드리드</p>
                <p className="text-[11px] text-[#10B981] font-semibold mt-1">AI 예측: 바르셀로나 승 (64.2%)</p>
                <p className="text-[11px] text-[#FBBF24] mt-1">확신도: ⭐⭐⭐⭐⭐</p>
                <p className="text-[10px] text-[#64748B] mt-1">ELO +142 | xG 2.31 vs 0.94</p>
              </div>
            </div>
            <p className="text-center text-[11px] text-[#64748B] mt-3">빅매치 분석은 Pro에서만 열람 가능합니다</p>

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

        {/* ═══ 6. Pricing ═══ */}
        <FadeSection id="pricing">
          <SectionWrap>
            <div className="text-center mb-10">
              <span className="section-label mb-3">PRICING</span>
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary mt-3">
                AI 축구 매거진 Pro 구독
                <br />
                — 월 9,900원
              </h2>
              <p className="text-text-secondary text-sm mt-2 font-body">커피 2잔 값으로 매일 AI 분석</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 max-w-[640px] mx-auto">
              {/* Free */}
              <div className="bg-bg-card border border-bg-border-subtle rounded-[14px] px-7 py-9 hover:border-bg-border transition-colors order-last sm:order-first">
                <div className="font-body font-bold text-xl mb-1 text-emerald-500">Free</div>
                <div className="font-display font-bold text-[28px] tracking-[-1px] text-text-primary mb-1">₩0</div>
                <ul className="mt-5 mb-6 space-y-2">
                  {[
                    { ok: true, text: "전경기 AI 예측 열람" },
                    { ok: true, text: "확신도 ⭐~⭐⭐⭐ 경기" },
                    { ok: true, text: "적중률 리포트 (전체 공개)" },
                    { ok: false, text: "고확신 ⭐4+ 경기" },
                    { ok: false, text: "🔥 빅매치 분석" },
                    { ok: false, text: "상세 분석 근거" },
                    { ok: false, text: "시장 지표 분석" },
                  ].map((item) => (
                    <li key={item.text} className="text-sm flex items-start gap-2 font-body">
                      <span className={`font-bold shrink-0 ${item.ok ? "text-emerald-500" : "text-error"}`}>
                        {item.ok ? "✅" : "❌"}
                      </span>
                      <span className="text-text-secondary">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/login"
                  className="block w-full py-3.5 rounded-[14px] text-[15px] font-bold text-center bg-emerald-500 hover:bg-emerald-400 text-white transition-all font-body"
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
                <div className="font-body font-bold text-xl mb-1 text-gold-400">Pro</div>
                <p className="text-[11px] text-gold-400/70 mt-1 font-body">얼리버드 가격은 곧 종료됩니다</p>
                <div className="text-[14px] text-text-muted line-through font-body">정가 ₩14,900</div>
                <div className="font-display font-bold text-[28px] tracking-[-1px] text-gold-400 mb-1">월 ₩9,900</div>
                <p className="text-emerald-400 text-xs mb-4 font-body">
                  매일 아침 발행되는 매거진 + 고확신 경기 분석을 받고 싶은 분께
                </p>
                <ul className="mt-3 mb-6 space-y-2">
                  {[
                    { text: "Free의 모든 것 +", highlight: false },
                    { text: "고확신 ⭐4+⭐5 경기 (AI가 가장 자신 있는 경기)", highlight: true },
                    { text: "🔥 빅매치 전경기 분석 (챔스·더비·엘클라시코)", highlight: true },
                    { text: "4개 모델 상세 근거 · 확률", highlight: false },
                    { text: "시장 지표 분석", highlight: false },
                    { text: "웹 대시보드 열람", highlight: false },
                  ].map((item) => (
                    <li key={item.text} className="text-sm flex items-start gap-2 font-body">
                      <span className="text-emerald-500 font-bold shrink-0">✅</span>
                      <span className={item.highlight ? "text-gold-400 font-semibold" : "text-text-secondary"}>
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
                  <p className="text-[11px] text-emerald-400 text-center mt-3 font-body">
                    어제 고확신 경기 결과: {dashData.highConfidence.correct}/{dashData.highConfidence.total} 적중 ✅
                  </p>
                )}
              </div>
            </div>
          </SectionWrap>
        </FadeSection>

        {/* ═══ HOW IT WORKS ═══ */}
        <FadeSection>
          <SectionWrap>
            <div className="text-center mb-10">
              <span className="section-label mb-3">HOW IT WORKS</span>
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary mt-3">
                3단계로 시작하세요
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  step: "①",
                  title: "무료 가입",
                  desc: "30초, 카드 불필요",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                  ),
                },
                {
                  step: "②",
                  title: "매일 분석 확인",
                  desc: "웹에서 오늘의 경기 확인. 고확신 경기는 Pro에서",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  ),
                },
                {
                  step: "③",
                  title: "투명한 검증",
                  desc: "모든 예측은 자동 기록. 적중률 투명 공개",
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="bg-bg-card border border-bg-border-subtle rounded-[14px] p-6 text-center hover:border-bg-border transition-colors">
                  <div className="flex justify-center mb-3">{item.icon}</div>
                  <div className="text-text-primary font-bold text-base mb-1 font-body">{item.step} {item.title}</div>
                  <p className="text-text-secondary text-sm font-body">{item.desc}</p>
                </div>
              ))}
            </div>
          </SectionWrap>
        </FadeSection>

        {/* ═══ 7. FAQ ═══ */}
        <FadeSection>
          <SectionWrap id="faq">
            <div className="text-center mb-10">
              <span className="section-label mb-3">FAQ</span>
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary mt-3">
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
              매일 아침, AI 축구 매거진을 받아보세요
            </h2>
            <p className="text-text-secondary text-sm mt-3">경기 전 예측부터 경기 후 전술 분석까지, 무료로 시작하세요.</p>
            <a
              href="/login"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-[14px] text-[15px] transition-all font-body mt-6"
            >
              무료로 시작하기
            </a>
            <p className="text-xs text-text-muted mt-3">30초 가입 · 카드 불필요</p>
          </div>
        </section>
      </main>

      {/* ═══ 8. Footer ═══ */}
      <Footer />
    </>
  );
}
