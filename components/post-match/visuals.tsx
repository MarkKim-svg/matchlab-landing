/**
 * Phase A — 경기 후 분석 시각화 SVG 컴포넌트.
 * Recharts/satori 미사용. pure SVG로 sharp가 바로 PNG 변환.
 * Vignelli 원칙: 흑(#0A0A0A) + 회(#9CA3AF, #E5E7EB) + 그린 1색(#10B981).
 */

const ACCENT = "#10B981";
const TEXT = "#0A0A0A";
const MUTED = "#9CA3AF";
const TRACK = "#E5E7EB";
const FONT_STACK =
  "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Pretendard', 'Noto Sans KR', sans-serif";

export const VIZ_WIDTH = 960;
export const VIZ_HEIGHT = 480;

export interface TeamStat {
  name: string;
  xg: number;
  possession: number;
  sot: number;
}

export interface VisualProps {
  home: TeamStat;
  away: TeamStat;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

export function XgBar({ home, away }: VisualProps): string {
  const homeName = truncate(home.name, 18);
  const awayName = truncate(away.name, 18);
  const max = Math.max(home.xg, away.xg, 1.0);
  const barMax = 600;
  const homeW = Math.round((home.xg / max) * barMax);
  const awayW = Math.round((away.xg / max) * barMax);
  const labelX = 250;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${VIZ_WIDTH}" height="${VIZ_HEIGHT}" viewBox="0 0 ${VIZ_WIDTH} ${VIZ_HEIGHT}" font-family="${FONT_STACK}">
  <rect width="${VIZ_WIDTH}" height="${VIZ_HEIGHT}" fill="#FFFFFF"/>
  <text x="48" y="72" font-size="32" font-weight="700" fill="${TEXT}">xG (기대 득점)</text>
  <text x="48" y="104" font-size="16" fill="${MUTED}">Expected Goals — 슈팅 질 기반 통계 모델</text>

  <!-- Home row -->
  <text x="48" y="200" font-size="20" font-weight="600" fill="${TEXT}">${homeName}</text>
  <rect x="${labelX}" y="180" width="${barMax}" height="28" fill="${TRACK}" rx="2"/>
  <rect x="${labelX}" y="180" width="${homeW}" height="28" fill="${ACCENT}" rx="2"/>
  <text x="${labelX + homeW + 12}" y="200" font-size="22" font-weight="700" fill="${TEXT}">${home.xg.toFixed(2)}</text>

  <!-- Away row -->
  <text x="48" y="290" font-size="20" font-weight="600" fill="${TEXT}">${awayName}</text>
  <rect x="${labelX}" y="270" width="${barMax}" height="28" fill="${TRACK}" rx="2"/>
  <rect x="${labelX}" y="270" width="${awayW}" height="28" fill="${TEXT}" rx="2"/>
  <text x="${labelX + awayW + 12}" y="290" font-size="22" font-weight="700" fill="${TEXT}">${away.xg.toFixed(2)}</text>

  <!-- Footer -->
  <line x1="48" y1="408" x2="${VIZ_WIDTH - 48}" y2="408" stroke="${TRACK}" stroke-width="1"/>
  <text x="48" y="440" font-size="14" fill="${MUTED}">MATCHLAB AI · 데이터 출처: API-Football</text>
</svg>`.trim();
}

export function PossessionDonut({ home, away }: VisualProps): string {
  const homeName = truncate(home.name, 14);
  const awayName = truncate(away.name, 14);
  const total = home.possession + away.possession || 100;
  const homePct = Math.round((home.possession / total) * 100);
  const awayPct = 100 - homePct;
  const cx = 480;
  const cy = 260;
  const r = 130;
  const circumference = 2 * Math.PI * r;
  const homeStroke = (homePct / 100) * circumference;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${VIZ_WIDTH}" height="${VIZ_HEIGHT}" viewBox="0 0 ${VIZ_WIDTH} ${VIZ_HEIGHT}" font-family="${FONT_STACK}">
  <rect width="${VIZ_WIDTH}" height="${VIZ_HEIGHT}" fill="#FFFFFF"/>
  <text x="48" y="72" font-size="32" font-weight="700" fill="${TEXT}">점유율</text>
  <text x="48" y="104" font-size="16" fill="${MUTED}">Ball Possession</text>

  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${TEXT}" stroke-width="40"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ACCENT}" stroke-width="40"
          stroke-dasharray="${homeStroke} ${circumference}" transform="rotate(-90 ${cx} ${cy})"/>

  <text x="${cx}" y="${cy + 8}" font-size="48" font-weight="800" fill="${TEXT}" text-anchor="middle">${homePct}%</text>

  <!-- Legend -->
  <rect x="160" y="430" width="14" height="14" fill="${ACCENT}"/>
  <text x="184" y="442" font-size="16" fill="${TEXT}">${homeName} ${homePct}%</text>
  <rect x="640" y="430" width="14" height="14" fill="${TEXT}"/>
  <text x="664" y="442" font-size="16" fill="${TEXT}">${awayName} ${awayPct}%</text>
</svg>`.trim();
}

export function SotCompare({ home, away }: VisualProps): string {
  const homeName = truncate(home.name, 18);
  const awayName = truncate(away.name, 18);
  const max = Math.max(home.sot, away.sot, 5);
  const barMaxH = 240;
  const homeH = Math.round((home.sot / max) * barMaxH);
  const awayH = Math.round((away.sot / max) * barMaxH);
  const baseY = 380;
  const homeX = 280;
  const awayX = 600;
  const barW = 80;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${VIZ_WIDTH}" height="${VIZ_HEIGHT}" viewBox="0 0 ${VIZ_WIDTH} ${VIZ_HEIGHT}" font-family="${FONT_STACK}">
  <rect width="${VIZ_WIDTH}" height="${VIZ_HEIGHT}" fill="#FFFFFF"/>
  <text x="48" y="72" font-size="32" font-weight="700" fill="${TEXT}">유효슈팅</text>
  <text x="48" y="104" font-size="16" fill="${MUTED}">Shots on Target</text>

  <!-- Home bar -->
  <rect x="${homeX}" y="${baseY - homeH}" width="${barW}" height="${homeH}" fill="${ACCENT}" rx="2"/>
  <text x="${homeX + barW / 2}" y="${baseY - homeH - 12}" font-size="32" font-weight="800" fill="${TEXT}" text-anchor="middle">${home.sot}</text>
  <text x="${homeX + barW / 2}" y="${baseY + 28}" font-size="16" fill="${TEXT}" text-anchor="middle">${homeName}</text>

  <!-- Away bar -->
  <rect x="${awayX}" y="${baseY - awayH}" width="${barW}" height="${awayH}" fill="${TEXT}" rx="2"/>
  <text x="${awayX + barW / 2}" y="${baseY - awayH - 12}" font-size="32" font-weight="800" fill="${TEXT}" text-anchor="middle">${away.sot}</text>
  <text x="${awayX + barW / 2}" y="${baseY + 28}" font-size="16" fill="${TEXT}" text-anchor="middle">${awayName}</text>

  <!-- Baseline -->
  <line x1="200" y1="${baseY}" x2="760" y2="${baseY}" stroke="${MUTED}" stroke-width="1"/>
</svg>`.trim();
}

export function renderVisualSvg(
  type: "xg_bar" | "possession_donut" | "sot_compare",
  data: VisualProps,
): string {
  switch (type) {
    case "xg_bar":
      return XgBar(data);
    case "possession_donut":
      return PossessionDonut(data);
    case "sot_compare":
      return SotCompare(data);
  }
}
