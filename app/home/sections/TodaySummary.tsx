interface Props {
  predictions: { matches: any[]; totalCount: number; proCount: number } | null;
  loading: boolean;
  isPro: boolean;
}

export default function TodaySummary({ predictions, loading, isPro }: Props) {
  const total = predictions?.totalCount ?? 0;
  const highConf = predictions?.matches?.filter((m: any) => m.confidence >= 4).length ?? 0;

  return (
    <section className="px-4 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[16px]">📊</span>
        <span className="text-[14px] font-bold" style={{ color: "#d4d4d4" }}>오늘의 분석 요약</span>
      </div>

      <div className="rounded-xl p-4" style={{ background: "#1a1a1a", border: "1px solid #262626" }}>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 rounded w-40" style={{ background: "#262626" }} />
            <div className="h-5 rounded w-36" style={{ background: "#262626" }} />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-4 text-[14px]" style={{ color: "#64748B" }}>
            오늘은 분석 경기가 없습니다. 내일 다시 확인하세요!
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[13px]" style={{ color: "#a3a3a3" }}>오늘 분석 경기</span>
              <span className="font-mono-data text-[16px] font-bold" style={{ color: "#f5f5f5" }}>{total}건</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[13px]" style={{ color: "#a3a3a3" }}>고확신 ⭐4+</span>
              {isPro ? (
                <button
                  onClick={() => document.getElementById("match-list")?.scrollIntoView({ behavior: "smooth" })}
                  className="font-mono-data text-[16px] font-bold cursor-pointer bg-transparent border-none"
                  style={{ color: "#FBBF24" }}
                >
                  {highConf}건 →
                </button>
              ) : (
                <span className="font-mono-data text-[16px] font-bold" style={{ color: "#FBBF24" }}>🔒 {highConf}건</span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
