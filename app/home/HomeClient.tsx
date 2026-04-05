"use client";

import { useEffect, useState } from "react";
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
    <>
      <GreetingSection userName={userName} plan={plan} />
      <TodaySummary predictions={predictions} loading={predLoading} isPro={isPro} />
      <TopPick predictions={predictions} loading={predLoading} isPro={isPro} />
      <WeeklyAccuracy dashboard={dashboard} loading={dashLoading} />
      <MatchList predictions={predictions} loading={predLoading} isPro={isPro} />
      {!isPro && <ProUpgradeBanner dashboard={dashboard} loading={dashLoading} />}
      <RecentResults />
      <KakaoBanner />
    </>
  );
}
