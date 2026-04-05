interface DonutProps {
  percent: number | null;
  color: string;
  label?: string;
  sub?: string;
  size?: number;
  textSize?: number;
  trackColor?: string;
}

export default function Donut({
  percent,
  color,
  label,
  sub,
  size = 108,
  textSize = 22,
  trackColor = "#1E2D47",
}: DonutProps) {
  const r = 42;
  const C = 2 * Math.PI * r;
  const p = percent ?? 0;
  const filled = (p / 100) * C;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke={trackColor} strokeWidth="11" />
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
          <span className="font-mono-data font-bold" style={{ color, fontSize: textSize }}>
            {percent === null ? "—" : `${Math.round(p)}%`}
          </span>
        </div>
      </div>
      {label && (
        <div className="mt-2 text-[12px] font-semibold" style={{ color: "#d4d4d4" }}>
          {label}
        </div>
      )}
      {sub && (
        <div className="text-[11px] mt-0.5" style={{ color: "#737373" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
