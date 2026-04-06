import Link from "next/link";

interface DashboardData {
  highConfidence: { hitRate: number; correct: number; total: number };
}

interface Props {
  dashboard: DashboardData | null;
  loading: boolean;
}

export default function ProUpgradeBanner({ dashboard, loading }: Props) {
  const hc = dashboard?.highConfidence;
  const hasData = hc && hc.total > 0;

  if (loading) {
    return (
      <div className="mx-4 my-4 rounded-2xl p-5 animate-pulse" style={{ background: "#1c1308", border: "1px solid #d97706" }}>
        <div className="h-5 rounded w-48 mx-auto mb-3" style={{ background: "#2a1a08" }} />
        <div className="h-7 rounded w-24 mx-auto mb-3" style={{ background: "#2a1a08" }} />
        <div className="h-4 rounded w-40 mx-auto" style={{ background: "#2a1a08" }} />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{
        background: "linear-gradient(135deg, #1c1308, #2a1a08)",
        border: "1px solid #d97706",
      }}
    >
      <div className="text-[15px] font-bold mb-2" style={{ color: "#FBBF24" }}>
        🔓 고확신 경기를 놓치고 있어요
      </div>

      {hasData ? (
        <div className="font-mono-data text-[20px] font-bold mb-2" style={{ color: "#FBBF24" }}>
          {hc.correct}/{hc.total} 적중
        </div>
      ) : (
        <div className="text-[13px] mb-2" style={{ color: "#d4a373" }}>
          고확신 경기를 받아보세요
        </div>
      )}

      <div className="text-[12px] mb-3 leading-[1.5]" style={{ color: "#d4a373" }}>
        {hasData ? "이번 주 유료 전용 고확신 경기" : ""}
        <br />
        월 9,900원 · 커피 2잔 값
      </div>

      <Link
        href="/#pricing"
        className="inline-block text-white font-bold rounded-lg px-4 py-2 text-sm"
        style={{
          background: "linear-gradient(135deg, #d97706, #b45309)",
          boxShadow: "0 4px 12px rgba(217,119,6,0.25)",
        }}
      >
        Pro 시작하기 →
      </Link>
    </div>
  );
}
