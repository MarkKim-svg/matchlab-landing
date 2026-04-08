// ── Derby list (API-Football team names) ──

const DERBIES: { teams: [string, string]; name: string }[] = [
  // EPL
  { teams: ["Manchester City", "Manchester United"], name: "맨체스터 더비" },
  { teams: ["Arsenal", "Tottenham"], name: "북런던 더비" },
  { teams: ["Liverpool", "Everton"], name: "머지사이드 더비" },
  { teams: ["Chelsea", "Tottenham"], name: "런던 더비" },
  { teams: ["Chelsea", "Arsenal"], name: "런던 더비" },
  { teams: ["Manchester United", "Liverpool"], name: "노스웨스트 더비" },
  { teams: ["Manchester City", "Liverpool"], name: "" },
  { teams: ["Manchester United", "Arsenal"], name: "" },
  // La Liga
  { teams: ["Real Madrid", "Barcelona"], name: "엘 클라시코" },
  { teams: ["Real Madrid", "Atletico Madrid"], name: "마드리드 더비" },
  { teams: ["Barcelona", "Atletico Madrid"], name: "" },
  { teams: ["Real Betis", "Sevilla"], name: "세비야 더비" },
  // Serie A
  { teams: ["AC Milan", "Inter"], name: "밀란 더비" },
  { teams: ["Juventus", "Inter"], name: "이탈리아 더비" },
  { teams: ["Juventus", "AC Milan"], name: "" },
  { teams: ["AS Roma", "Lazio"], name: "로마 더비" },
  { teams: ["Napoli", "Juventus"], name: "" },
  // Bundesliga
  { teams: ["Borussia Dortmund", "Bayern Munich"], name: "데어 클라시커" },
  { teams: ["Borussia Dortmund", "Schalke 04"], name: "루르 더비" },
  // Ligue 1
  { teams: ["Paris Saint Germain", "Marseille"], name: "르 클라시크" },
  { teams: ["Lyon", "Saint Etienne"], name: "론 더비" },
];

// UCL knockout
const UCL_ID = 2;
const UCL_KNOCKOUT_PATTERNS = /round of 16|quarter|semi|final/i;

// UEL/UECL semi+final
const UEL_ID = 3;
const UECL_ID = 848;
const SEMI_FINAL_PATTERN = /semi|final/i;

// Domestic cups — semi+final
const CUP_IDS = new Set([45, 143, 137, 81, 66]); // FA Cup, Copa del Rey, Coppa Italia, DFB Pokal, Coupe de France

export interface BigMatchResult {
  isBig: boolean;
  reason?: string;
  derbyName?: string;
}

export function isBigMatch(match: {
  homeTeam: string;
  awayTeam: string;
  leagueId?: number;
  round?: string;
  homeStanding?: number;
  awayStanding?: number;
}): BigMatchResult {
  const { homeTeam, awayTeam, leagueId, round, homeStanding, awayStanding } = match;
  const h = homeTeam.toLowerCase();
  const a = awayTeam.toLowerCase();

  // 1. Derby check
  for (const d of DERBIES) {
    const [t1, t2] = d.teams.map(t => t.toLowerCase());
    if ((h.includes(t1) || t1.includes(h)) && (a.includes(t2) || t2.includes(a)) ||
        (h.includes(t2) || t2.includes(h)) && (a.includes(t1) || t1.includes(a))) {
      return { isBig: true, reason: d.name || "더비 매치", derbyName: d.name };
    }
  }

  // 2. Top 6 clash
  if (homeStanding && awayStanding && homeStanding <= 6 && awayStanding <= 6) {
    return { isBig: true, reason: "상위 6위 맞대결" };
  }

  // 3. UCL knockout
  if (leagueId === UCL_ID && round && UCL_KNOCKOUT_PATTERNS.test(round)) {
    return { isBig: true, reason: "UCL 녹아웃" };
  }

  // 4. UEL/UECL semi+final
  if ((leagueId === UEL_ID || leagueId === UECL_ID) && round && SEMI_FINAL_PATTERN.test(round)) {
    return { isBig: true, reason: leagueId === UEL_ID ? "UEL 4강+" : "UECL 4강+" };
  }

  // 5. Domestic cup semi+final
  if (leagueId && CUP_IDS.has(leagueId) && round && SEMI_FINAL_PATTERN.test(round)) {
    return { isBig: true, reason: "컵대회 4강+" };
  }

  return { isBig: false };
}
