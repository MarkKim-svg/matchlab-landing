import Link from "next/link";
import { TeamLogo, LeagueBadge, splitTeams } from "@/components/match-ui";

interface MatchPrediction {
  id: string;
  match: string;
  league: string;
  prediction: string;
  confidence: number;
  confidenceLabel: string;
  poisson: { home: string; away: string };
  elo: { home: string; away: string };
  xg: { home: string; away: string };
  aiAdjustment: string;
  homeTeamId?: string;
  awayTeamId?: string;
}

interface Props {
  predictions: { matches: MatchPrediction[] } | null;
  loading: boolean;
  isPro: boolean;
}

function GoldStars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill={i < count ? "#FBBF24" : "#334155"}>
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.69l5.34-.78z" />
        </svg>
      ))}
    </span>
  );
}

export default function TopPick({ predictions, loading, isPro }: Props) {
  const topMatch = predictions?.matches?.[0];

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[16px]">🏆</span>
          <span className="text-[14px] font-bold text-bg-100">오늘의 Top Pick</span>
        </div>
        <div className="rounded-xl p-5 animate-pulse" style={{ background: "#1A2332" }}>
          <div className="h-4 rounded w-16 mb-3" style={{ background: "#263344" }} />
          <div className="h-5 rounded w-48 mb-2" style={{ background: "#263344" }} />
          <div className="h-4 rounded w-32 mb-3" style={{ background: "#263344" }} />
          <div className="h-4 rounded w-40" style={{ background: "#263344" }} />
        </div>
      </section>
    );
  }

  if (!topMatch) return null;

  const [home, away] = splitTeams(topMatch.match);

  return (
    <section>
      <div className="flex items-center gap-1.5 mb-4">
        <span className="text-[16px]">🏆</span>
        <span className="text-[14px] font-bold text-bg-100">오늘의 Top Pick</span>
      </div>

      <div className="rounded-xl overflow-hidden relative" style={{
        background: "linear-gradient(145deg, #1A2332, #1E293B)",
        border: "1px solid #d97706",
      }}>
        {/* Top gold bar */}
        <div className="h-[3px]" style={{
          background: "linear-gradient(90deg, #FBBF24, #F59E0B, #FBBF24)",
        }} />

        <div className="p-5">
          {/* League + Confidence */}
          <div className="flex items-center justify-between mb-4">
            <LeagueBadge league={topMatch.league} />
            <GoldStars count={topMatch.confidence} />
          </div>

          {/* VS Layout */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <TeamLogo teamId={topMatch.homeTeamId ?? ""} teamName={home} size={40} />
              <span className="text-[18px] font-extrabold text-bg-50 text-center leading-tight">{home}</span>
            </div>
            <span className="text-[18px] font-bold text-text-muted px-2">VS</span>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <TeamLogo teamId={topMatch.awayTeamId ?? ""} teamName={away} size={40} />
              <span className="text-[18px] font-extrabold text-bg-50 text-center leading-tight">{away}</span>
            </div>
          </div>

          {isPro ? (
            <>
              {/* AI Prediction pill */}
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[15px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #059669, #10B981)" }}>
                  AI 예측: {topMatch.prediction}
                </span>
              </div>

              {/* Model data sub-card */}
              <div className="rounded-lg p-3 space-y-1.5" style={{ background: "#0F172A" }}>
                <div className="text-[11px] font-semibold text-text-secondary mb-1.5">모델 분석 수치</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "푸아송", home: topMatch.poisson.home, away: topMatch.poisson.away },
                    { label: "ELO", home: topMatch.elo.home, away: topMatch.elo.away },
                    { label: "xG", home: topMatch.xg.home, away: topMatch.xg.away },
                  ].map(m => (
                    <div key={m.label} className="rounded-md py-1.5 px-1" style={{ background: "#1A2332" }}>
                      <div className="text-[10px] text-text-muted mb-0.5">{m.label}</div>
                      <div className="font-mono-data text-[12px] text-bg-200">{m.home} : {m.away}</div>
                    </div>
                  ))}
                </div>
                {topMatch.aiAdjustment && topMatch.aiAdjustment !== "-" && (
                  <div className="text-[11px] text-text-muted pt-1">Claude 조정: {topMatch.aiAdjustment}</div>
                )}
              </div>

              <Link href={`/report/${topMatch.id}`} className="inline-block mt-3 text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                상세 리포트 →
              </Link>
            </>
          ) : (
            <div className="relative">
              <div className="select-none" style={{ filter: "blur(6px)" }}>
                <div className="flex justify-center mb-4">
                  <span className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[15px] font-bold text-white"
                    style={{ background: "#059669" }}>
                    AI 예측: {topMatch.prediction}
                  </span>
                </div>
                <div className="rounded-lg p-3" style={{ background: "#0F172A" }}>
                  <div className="text-[11px] text-text-muted">
                    푸아송 {topMatch.poisson.home} vs {topMatch.poisson.away} · ELO {topMatch.elo.home} vs {topMatch.elo.away}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  href="/#pricing"
                  className="inline-flex items-center gap-1.5 text-white font-bold rounded-lg px-4 py-2 text-sm"
                  style={{
                    background: "linear-gradient(135deg, #d97706, #b45309)",
                    boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
                  }}
                >
                  🔒 Pro에서 보기
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
