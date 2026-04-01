interface WeeklyTrend {
  week_label: string;
  overall: { hit_rate: number; correct: number; total: number };
  high_confidence: { hit_rate: number; correct: number; total: number };
}

interface DashboardData {
  overall: { hitRate: number; correct: number; total: number };
  highConfidence: { hitRate: number; correct: number; total: number };
  weekly_trend: WeeklyTrend[];
}

interface Props {
  dashboard: DashboardData | null;
  loading: boolean;
}

export default function WeeklyAccuracy({ dashboard, loading }: Props) {
  if (loading) {
    return (
      <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px]">📈</span>
            <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>이번 주 적중률</span>
          </div>
        </div>
        <div className="flex gap-3 mb-3">
          {[1, 2].map(i => (
            <div key={i} className="flex-1 rounded-xl p-3 animate-pulse" style={{ background: "#1a1a1a", border: "1px solid #262626" }}>
              <div className="h-7 rounded w-16 mx-auto mb-2" style={{ background: "#262626" }} />
              <div className="h-3 rounded w-20 mx-auto" style={{ background: "#262626" }} />
            </div>
          ))}
        </div>
        <div className="rounded-lg p-3 animate-pulse" style={{ background: "#1a1a1a", border: "1px solid #262626", height: 60 }} />
      </section>
    );
  }

  if (!dashboard || dashboard.overall.total === 0) {
    return (
      <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[16px]">📈</span>
          <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>이번 주 적중률</span>
        </div>
        <div className="text-center py-6 text-[14px]" style={{ color: "#64748B" }}>
          아직 충분한 데이터가 없습니다
        </div>
      </section>
    );
  }

  const { overall, highConfidence, weekly_trend } = dashboard;
  const bars = weekly_trend.slice(-8);
  const maxRate = Math.max(...bars.map(b => b.overall.hit_rate), 1);

  return (
    <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[16px]">📈</span>
          <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>이번 주 적중률</span>
        </div>
        <a href="#" className="text-[12px] font-semibold" style={{ color: "#10B981" }}>상세 →</a>
      </div>

      {/* Summary boxes */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1 rounded-xl p-3 text-center" style={{ background: "#1a1a1a", border: "1px solid #262626" }}>
          <div className="font-mono-data text-[24px] font-bold" style={{ color: "#10B981" }}>
            {overall.hitRate}%
          </div>
          <div className="text-[11px] mt-1" style={{ color: "#737373" }}>
            전체 ({overall.correct}/{overall.total})
          </div>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={{ background: "#1a1a1a", border: "1px solid #262626" }}>
          <div className="font-mono-data text-[24px] font-bold" style={{ color: "#FBBF24" }}>
            {highConfidence.total > 0 ? `${highConfidence.hitRate}%` : "—"}
          </div>
          <div className="text-[11px] mt-1" style={{ color: "#737373" }}>
            ⭐4+ ({highConfidence.correct}/{highConfidence.total})
          </div>
        </div>
      </div>

      {/* Mini bar chart */}
      {bars.length > 0 && (
        <div className="rounded-lg p-3" style={{ background: "#1a1a1a", border: "1px solid #262626", height: 60 }}>
          <div className="flex items-end gap-1 h-full">
            {bars.map((b, i) => {
              const height = Math.max((b.overall.hit_rate / maxRate) * 100, 8);
              const isLast = i === bars.length - 1;
              return (
                <div
                  key={b.week_label}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${height}%`,
                    backgroundColor: "#10B981",
                    opacity: isLast ? 1 : 0.7,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
