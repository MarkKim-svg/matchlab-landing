"use client";

import { useEffect, useState, type ReactNode } from "react";
import MatchCarousel from "./sections/MatchCarousel";
import TopPick from "./sections/TopPick";
import WeeklyAccuracy from "./sections/WeeklyAccuracy";
import MatchList from "./sections/MatchList";
import ProUpgradeBanner from "./sections/ProUpgradeBanner";
import HomeSidebar from "./sections/HomeSidebar";
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

function Card({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "#111827",
        border: "1px solid #1E2D47",
        borderRadius: "14px",
        padding: "20px",
        overflow: "hidden",
        minWidth: 0,
        ...style,
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
    <div className="home-layout">
      {/* ── Main content (left) ── */}
      <div className="home-main">
        {/* 캐러셀 */}
        <Card>
          <MatchCarousel predictions={predictions} loading={predLoading} isPro={isPro} />
        </Card>

        {/* TopPick + 적중률 (2열) */}
        <div className="home-2col">
          <Card>
            <TopPick predictions={predictions} loading={predLoading} isPro={isPro} />
          </Card>
          <Card>
            <WeeklyAccuracy dashboard={dashboard} loading={dashLoading} />
          </Card>
        </div>

        {/* 전체경기 */}
        <Card>
          <MatchList predictions={predictions} loading={predLoading} isPro={isPro} />
        </Card>

        {/* Pro배너/CTA + 카카오 */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!isPro && <ProUpgradeBanner dashboard={dashboard} loading={dashLoading} />}
          <KakaoBanner />
        </Card>
      </div>

      {/* ── Sidebar (right, sticky on desktop) ── */}
      <aside className="home-sidebar">
        <HomeSidebar />
      </aside>
    </div>
  );
}
