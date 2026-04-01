import Link from "next/link";

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
}

interface Props {
  predictions: { matches: MatchPrediction[] } | null;
  loading: boolean;
  isPro: boolean;
}

function stars(n: number) {
  return "⭐".repeat(n);
}

export default function TopPick({ predictions, loading, isPro }: Props) {
  const topMatch = predictions?.matches?.[0]; // sorted by confidence desc from API

  if (loading) {
    return (
      <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[16px]">🏆</span>
          <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>오늘의 Top Pick</span>
        </div>
        <div className="rounded-xl p-4 animate-pulse" style={{ background: "#1a1a1a", border: "1px solid #262626" }}>
          <div className="h-4 rounded w-16 mb-3" style={{ background: "#262626" }} />
          <div className="h-5 rounded w-48 mb-2" style={{ background: "#262626" }} />
          <div className="h-4 rounded w-32 mb-3" style={{ background: "#262626" }} />
          <div className="h-4 rounded w-40" style={{ background: "#262626" }} />
        </div>
      </section>
    );
  }

  if (!topMatch) return null;

  return (
    <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[16px]">🏆</span>
        <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>오늘의 Top Pick</span>
      </div>

      <div className="rounded-xl p-4 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #1a1a1a, #1f1f1f)",
        border: "1px solid #d97706",
      }}>
        {/* Top gold bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{
          background: "linear-gradient(90deg, #FBBF24, #F59E0B, #FBBF24)",
        }} />

        {/* Confidence */}
        <div className="font-mono-data text-[14px] font-bold mb-2" style={{ color: "#FBBF24" }}>
          {stars(topMatch.confidence)}
        </div>

        {/* Team name */}
        <div className="text-[16px] font-bold mb-1" style={{ color: "#f5f5f5" }}>
          {topMatch.match}
        </div>

        {/* League */}
        <div className="text-[12px] mb-3" style={{ color: "#737373" }}>
          {topMatch.league}
        </div>

        {isPro ? (
          <>
            {/* AI prediction */}
            <div className="font-mono-data text-[14px] font-bold mb-2" style={{ color: "#10B981" }}>
              AI: {topMatch.prediction}
            </div>

            {/* Model basis */}
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid #333" }}>
              <div className="text-[11px] space-y-1" style={{ color: "#737373" }}>
                <div>푸아송 {topMatch.poisson.home} vs {topMatch.poisson.away} · ELO {topMatch.elo.home} vs {topMatch.elo.away} · xG {topMatch.xg.home} vs {topMatch.xg.away}</div>
                {topMatch.aiAdjustment && topMatch.aiAdjustment !== "-" && (
                  <div>Claude 조정: {topMatch.aiAdjustment}</div>
                )}
              </div>
              <Link href={`/report/${topMatch.id}`} className="inline-block mt-2 text-[12px] font-semibold" style={{ color: "#10B981" }}>
                상세 리포트 →
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Blurred prediction for free users */}
            <div className="relative">
              <div className="select-none" style={{ filter: "blur(6px)" }}>
                <div className="font-mono-data text-[14px] font-bold mb-2" style={{ color: "#10B981" }}>
                  AI: {topMatch.prediction}
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid #333" }}>
                  <div className="text-[11px]" style={{ color: "#737373" }}>
                    푸아송 {topMatch.poisson.home} vs {topMatch.poisson.away} · ELO {topMatch.elo.home} vs {topMatch.elo.away}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  href="/login?redirect=/home"
                  className="inline-flex items-center gap-1.5 text-white font-bold rounded-lg px-5 py-2.5 text-[14px]"
                  style={{
                    background: "linear-gradient(135deg, #d97706, #b45309)",
                    boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
                  }}
                >
                  🔒 Pro에서 보기
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
