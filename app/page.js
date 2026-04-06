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
  },
];

const LEAGUES_PILLS = ["EPL", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "UCL"];

const FAQS = [
  {
    q: "MATCHLAB은 뭔가요?",
    a: "매일 유럽 축구 경기를 4종 앙상블 AI 모델로 분석하고, 확신도별로 분류해서 카카오톡으로 보내드리는 데이터 분석 서비스입니다.",
  },
  {
    q: "무료로도 쓸 수 있나요?",
    a: "네, 가입만 하면 매일 2경기 프리뷰를 무료로 볼 수 있고, 적중률 대시보드도 열람 가능합니다.",
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

const TRUST_POINTS = [
  {
    icon: "🧠",
    title: "4중 앙상블 AI",
    desc: "ELO, 폼 분석, 포아송, 오즈 역산 — 4개 모델이 교차 검증해 편향을 줄입니다.",
  },
  {
    icon: "📋",
    title: "투명한 기록",
    desc: "검증 가능한 기록이 자동 공개됩니다. 사후 수정 불가능한 시스템입니다.",
  },
  {
    icon: "🎯",
    title: "확신도 큐레이션",
    desc: "모든 경기를 다 보여주지 않습니다. 확신도가 높은 경기만 엄선해 제공합니다.",
  },
  {
    icon: "💬",
    title: "매일 카톡 배송",
    desc: "Pro 회원은 매일 아침 카카오톡으로 고확신 예측을 받아볼 수 있습니다.",
  },
];

/* ────────────────────────────────────────────
   PhoneMockup
   ────────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div className="relative w-[280px] max-sm:w-[260px] mx-auto shrink-0">
      <div className="relative bg-bg-card border border-bg-border rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40">
        {/* Notch */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-24 h-5 bg-bg-deep rounded-full" />
        </div>

        <iframe
          src="/home"
          className="w-full border-0"
          style={{ height: "480px", pointerEvents: "none" }}
        />
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
            <span className="text-[16px] font-bold text-bg-50">{home}</span>
            <span className="text-[13px] font-bold text-text-muted">VS</span>
            <span className="text-[16px] font-bold text-bg-50">{away}</span>
          </div>
          <div className="text-sm text-text-primary">{match.prediction}</div>
        </div>
        <div className="absolute inset-0 bg-bg-card/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-xl">
          <span className="text-2xl">🔒</span>
          <span className="text-emerald-500 font-bold text-sm font-body">Pro 전용 · 고확신 경기</span>
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
          <span className="text-[18px] font-extrabold text-bg-50 text-center leading-tight">{home}</span>
          <span className="text-[14px] font-bold text-text-muted px-1">VS</span>
          <span className="text-[18px] font-extrabold text-bg-50 text-center leading-tight">{away}</span>
        </div>

        {/* Prediction + progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-semibold text-text-primary font-body">{match.prediction}</span>
            <span className="text-[13px] font-bold text-emerald-400 font-display">{prob}%</span>
          </div>
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
    <section id={id} className={`max-w-[960px] mx-auto py-14 px-5 border-t border-bg-border-subtle ${className}`}>
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
        <section className="pt-8 pb-16 md:pt-16 md:pb-20 px-5">
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

              <h1 className="font-body font-bold text-[24px] sm:text-[32px] md:text-[40px] leading-[1.2] tracking-[-0.5px] text-text-primary mb-4">
                매일 아침, AI가 고른
                <br />
                <span className="text-emerald-400">승부 예측</span>
              </h1>
              <p className="text-text-secondary text-[14px] md:text-[16px] mb-8 max-w-md leading-relaxed font-body break-keep">
                4종 앙상블 AI가 매일 가장 유리한 경기를 선별합니다.
                <br className="hidden sm:block" />
                확신도가 높은 경기만, 근거와 함께.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-8">
                <a
                  href="/login"
                  className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold px-7 py-3.5 rounded-[14px] text-[15px] transition-all font-body"
                >
                  무료로 시작하기
                </a>
                <a
                  href="#accuracy"
                  className="border border-bg-border text-text-secondary hover:text-text-primary font-semibold px-7 py-3.5 rounded-[14px] text-[15px] transition-colors font-body"
                >
                  분석 데이터 보기
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-8 text-sm">
                <div>
                  <span className="text-text-primary font-bold text-lg font-display">
                    {highConfRate > 0 ? `${highConfRate}%` : "—%"}
                  </span>
                  <p className="text-text-muted text-xs font-body">고확신 적중률</p>
                </div>
                <div>
                  <span className="text-text-primary font-bold text-lg font-display">{totalGames}+</span>
                  <p className="text-text-muted text-xs font-body">누적 분석</p>
                </div>
              </div>
            </div>

            {/* Right — Phone Mockup */}
            <PhoneMockup />
          </div>
        </section>

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

            <div className="text-center mt-6">
              <a
                href="/dashboard"
                className="text-sm text-emerald-400 underline hover:text-emerald-300 transition-colors font-body"
              >
                전체 대시보드 보기 →
              </a>
            </div>
          </SectionWrap>
        </FadeSection>

        {/* ═══ 5. WHY MATCHLAB ═══ */}
        <FadeSection>
          <SectionWrap>
            <div className="text-center mb-10">
              <span className="section-label mb-3">WHY MATCHLAB</span>
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary mt-3">
                왜 MATCHLAB인가요?
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {TRUST_POINTS.map((item) => (
                <div key={item.title} className="bg-bg-card border border-bg-border-subtle rounded-[14px] p-6 hover:border-bg-border transition-colors">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h3 className="text-text-primary font-bold text-base mb-2 font-body">{item.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed font-body">{item.desc}</p>
                </div>
              ))}
            </div>
          </SectionWrap>
        </FadeSection>

        {/* ═══ 6. Pricing ═══ */}
        <FadeSection id="pricing">
          <SectionWrap>
            <div className="text-center mb-10">
              <span className="section-label mb-3">PRICING</span>
              <h2 className="font-body font-bold text-[24px] md:text-[32px] tracking-[-0.5px] text-text-primary mt-3">
                매일 아침, AI가 고른 최고의 경기
                <br />
                카톡으로 — 월 9,900원
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
                    { ok: true, text: "매일 오전 카톡 알림" },
                    { ok: true, text: "무료 프리뷰 2경기" },
                    { ok: true, text: "적중률 리포트 (전체 공개)" },
                    { ok: false, text: "고확신 ⭐4+ 경기" },
                    { ok: false, text: "전경기 상세 분석" },
                    { ok: false, text: "배당 이동 분석" },
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
                  className="block w-full py-3.5 rounded-[14px] text-[15px] font-bold text-center bg-emerald-500 hover:bg-emerald-700 text-white transition-all font-body"
                >
                  무료로 시작하기
                </a>
              </div>

              {/* Pro */}
              <div
                className="relative rounded-[14px] px-7 py-9 order-first sm:order-last hover:border-bg-border transition-colors"
                style={{ background: "linear-gradient(135deg, #1c1308, #2a1a08)", border: "1px solid #d97706" }}
              >
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full font-body"
                  style={{ backgroundColor: "#d97706" }}
                >
                  얼리버드
                </div>
                <div className="font-body font-bold text-xl mb-1 text-gold-400">Pro</div>
                <div className="text-[14px] text-text-muted line-through font-body">정가 ₩14,900</div>
                <div className="font-display font-bold text-[28px] tracking-[-1px] text-gold-400 mb-1">월 ₩9,900</div>
                <p className="text-emerald-400 text-xs mb-4 font-body">
                  매일 가장 유리한 경기만 빠르게 받고 싶은 분께
                </p>
                <ul className="mt-3 mb-6 space-y-2">
                  {[
                    { text: "Free의 모든 것 +", highlight: false },
                    { text: "고확신 ⭐4+⭐5 경기", highlight: true },
                    { text: "전경기 상세 분석 (매일 10~30경기)", highlight: false },
                    { text: "배당 이동 분석", highlight: false },
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
              </div>
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
      </main>

      {/* ═══ 8. Footer ═══ */}
      <Footer />
    </>
  );
}
