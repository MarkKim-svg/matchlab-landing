"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import GreetingSection from "./sections/GreetingSection";
import TodaySummary from "./sections/TodaySummary";
import TopPick from "./sections/TopPick";
import WeeklyAccuracy from "./sections/WeeklyAccuracy";
import MatchList from "./sections/MatchList";
import ProUpgradeBanner from "./sections/ProUpgradeBanner";
import RecentResults from "./sections/RecentResults";
import KakaoBanner from "./sections/KakaoBanner";

interface MatchPrediction {
  id: string;
  match: string;
  date: string;
  league: string;
  prediction: string;
  confidence: number;
  confidenceLabel: string;
  isProOnly: boolean;
  poisson: { home: string; away: string };
  elo: { home: string; away: string };
  odds: { home: string; away: string };
  xg: { home: string; away: string };
  ensemble: { home: string; away: string; draw: string };
  aiAdjustment: string;
  modelAgreement: string;
  scorePrediction: string;
  result: string;
  isCorrect: string;
  fixtureId: string;
  homeTeamId: string;
  awayTeamId: string;
}

interface DashboardData {
  overall: { hitRate: number; correct: number; total: number };
  highConfidence: { hitRate: number; correct: number; total: number };
  weekly_trend: Array<{
    week_label: string;
    overall: { hit_rate: number; correct: number; total: number };
    high_confidence: { hit_rate: number; correct: number; total: number };
  }>;
  recentPredictions?: Array<{
    date: string;
    match: string;
    league: string;
    prediction: string;
    confidence: number;
    result: string;
    isCorrect: boolean | null;
    homeTeamId?: string;
    awayTeamId?: string;
  }>;
}

interface PredictionsResponse {
  matches: MatchPrediction[];
  totalCount: number;
  proCount: number;
}

function FadeInCard({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-bg-card rounded-[14px] border border-bg-border p-5 transition-all duration-200 hover:border-emerald-500/30 ${className ?? ""}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, border-color 0.2s`,
      }}
    >
      {children}
    </div>
  );
}

export default function HomeClient({ userName, plan }: { userName: string; plan: string }) {
  const [predictions, setPredictions] = useState<PredictionsResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [predLoading, setPredLoading] = useState(true);
  const [dashLoading, setDashLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/predictions/${today}`)
      .then(r => r.json())
      .then(d => { setPredictions(d); setPredLoading(false); })
      .catch(() => setPredLoading(false));

    fetch("/api/dashboard?period=7d")
      .then(r => r.json())
      .then(d => { setDashboard(d); setDashLoading(false); })
      .catch(() => setDashLoading(false));
  }, []);

  const isPro = plan === "pro";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-6">
      {/* 인사 + 오늘 요약 (풀와이드) */}
      <FadeInCard className="md:col-span-2">
        <GreetingSection userName={userName} plan={plan} />
        <TodaySummary predictions={predictions} loading={predLoading} isPro={isPro} />
      </FadeInCard>

      {/* TopPick (좌) */}
      <FadeInCard delay={100}>
        <TopPick predictions={predictions} loading={predLoading} isPro={isPro} />
      </FadeInCard>

      {/* 적중률 요약 (우) */}
      <FadeInCard delay={200}>
        <WeeklyAccuracy dashboard={dashboard} loading={dashLoading} />
      </FadeInCard>

      {/* 전체경기 (좌) */}
      <FadeInCard delay={100}>
        <MatchList predictions={predictions} loading={predLoading} isPro={isPro} />
      </FadeInCard>

      {/* 최근결과 (우) */}
      <FadeInCard delay={200}>
        <RecentResults />
      </FadeInCard>

      {/* Pro배너/CTA + 카카오 (풀와이드) */}
      <FadeInCard className="md:col-span-2 flex flex-col gap-4">
        {!isPro && <ProUpgradeBanner dashboard={dashboard} loading={dashLoading} />}
        <KakaoBanner />
      </FadeInCard>
    </div>
  );
}
