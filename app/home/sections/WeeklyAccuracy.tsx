interface WeeklyTrend {
  week_label: string;
  overall: { hit_rate: number; correct: number; total: number };
  high_confidence: { hit_rate: number; correct: number; total: number };
}

interface RecentPrediction {
  date: string;
  match: string;
  league: string;
  prediction: string;
  confidence: number;
  result: string;
  isCorrect: boolean | null;
}

interface DashboardData {
  overall: { hitRate: number; correct: number; total: number };
  highConfidence: { hitRate: number; correct: number; total: number };
  weekly_trend: WeeklyTrend[];
  recentPredictions?: RecentPrediction[];
}

interface Props {
  dashboard: DashboardData | null;
  loading: boolean;
}

const TRACK = "#1E2D47";
const EMERALD = "#10B981";
const GOLD = "#F59E0B";

function Donut({
  percent,
  color,
  label,
  sub,
}: {
  percent: number | null;
  color: string;
  label: string;
  sub: string;
}) {
  const r = 42;
  const C = 2 * Math.PI * r;
  const p = percent ?? 0;
  const filled = (p / 100) * C;

  return (
    <div className="flex flex-col items-center flex-1">
      <div className="relative w-[108px] h-[108px]">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke={TRACK} strokeWidth="11" />
          {percent !== null && (
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={color}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${C}`}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono-data text-[22px] font-bold" style={{ color }}>
            {percent === null ? "—" : `${Math.round(p)}%`}
          </span>
        </div>
      </div>
      <div className="mt-2 text-[12px] font-semibold" style={{ color: "#d4d4d4" }}>
        {label}
      </div>
      <div className="text-[11px] mt-0.5" style={{ color: "#737373" }}>
        {sub}
      </div>
    </div>
  );
}

export default function WeeklyAccuracy({ dashboard, loading }: Props) {
  if (loading) {
    return (
      <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[16px]">📈</span>
          <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>
            이번 주 적중률
          </span>
        </div>
        <div className="flex gap-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-[108px] h-[108px] rounded-full" style={{ background: "#1a1a1a" }} />
              <div className="h-3 w-16 mt-2 rounded" style={{ background: "#262626" }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!dashboard || dashboard.overall.total === 0) {
    return (
      <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[16px]">📈</span>
          <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>
            이번 주 적중률
          </span>
        </div>
        <div className="text-center py-6 text-[14px]" style={{ color: "#64748B" }}>
          아직 충분한 데이터가 없습니다
        </div>
      </section>
    );
  }

  const { overall, highConfidence, recentPredictions = [] } = dashboard;
  const hasHighConf = highConfidence.total > 0;

  const recent = recentPredictions
    .filter(r => r.isCorrect !== null)
    .slice(0, 5);

  return (
    <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[16px]">📈</span>
          <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>
            이번 주 적중률
          </span>
        </div>
        <a href="#" className="text-[12px] font-semibold" style={{ color: EMERALD }}>
          상세 →
        </a>
      </div>

      {/* Donuts */}
      <div className="flex gap-4 mb-4">
        <Donut
          percent={overall.hitRate}
          color={EMERALD}
          label="전체"
          sub={`${overall.correct}/${overall.total}`}
        />
        <Donut
          percent={hasHighConf ? highConfidence.hitRate : null}
          color={GOLD}
          label="⭐4+"
          sub={hasHighConf ? `${highConfidence.correct}/${highConfidence.total}` : "데이터 없음"}
        />
      </div>

      {/* Recent mini list */}
      {recent.length > 0 && (
        <div
          className="rounded-lg px-3 py-1"
          style={{ background: "#1a1a1a", border: "1px solid #262626" }}
        >
          {recent.map((r, i) => {
            const isHit = r.isCorrect === true;
            const isLast = i === recent.length - 1;
            return (
              <div
                key={`${r.date}-${r.match}-${i}`}
                className="flex items-center gap-2 py-2"
                style={{ borderBottom: isLast ? "none" : "1px solid #262626" }}
              >
                <span
                  className="text-[13px] font-bold shrink-0 w-4 text-center"
                  style={{ color: isHit ? EMERALD : "#EF4444" }}
                >
                  {isHit ? "✓" : "✗"}
                </span>
                <span
                  className="text-[12px] truncate flex-1"
                  style={{ color: "#d4d4d4" }}
                >
                  {r.match}
                </span>
                <span
                  className="text-[11px] font-mono-data shrink-0"
                  style={{ color: "#737373" }}
                >
                  {"⭐".repeat(r.confidence)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
