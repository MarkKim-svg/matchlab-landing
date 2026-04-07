import { NextRequest, NextResponse } from "next/server";
import { getPredictionsByLeague } from "@/lib/notion";

export const revalidate = 3600;

const LEAGUE_MAP: Record<string, { name: string; apiId: number }> = {
  epl: { name: "프리미어리그", apiId: 39 },
  laliga: { name: "라리가", apiId: 140 },
  seriea: { name: "세리에A", apiId: 135 },
  bundesliga: { name: "분데스리가", apiId: 78 },
  ligue1: { name: "리그1", apiId: 61 },
  ucl: { name: "챔피언스리그", apiId: 2 },
  uel: { name: "유로파리그", apiId: 3 },
  uecl: { name: "컨퍼런스리그", apiId: 848 },
  facup: { name: "FA컵", apiId: 45 },
  copadelrey: { name: "코파델레이", apiId: 143 },
  coppaitalia: { name: "코파이탈리아", apiId: 137 },
  dfbpokal: { name: "DFB포칼", apiId: 81 },
  coupedefrance: { name: "쿠프드프랑스", apiId: 66 },
};

interface ApiFixture {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  homeLogo: string;
  awayLogo: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;
  round: string;
  hasPrediction: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ league: string }> }
) {
  try {
    const { league } = await params;
    const config = LEAGUE_MAP[league.toLowerCase()];
    if (!config) {
      return NextResponse.json({ error: "Unknown league" }, { status: 400 });
    }

    const month = request.nextUrl.searchParams.get("month");
    let from: string | undefined;
    let to: string | undefined;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      from = `${month}-01`;
      const [y, m] = month.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      to = `${month}-${String(lastDay).padStart(2, "0")}`;
    }

    // Fetch predictions from Notion
    const predictions = await getPredictionsByLeague(config.name, { from, to, limit: 100 });

    // Fetch fixtures from API-Football (if API key available + month specified)
    let fixtures: ApiFixture[] = [];
    const apiKey = process.env.FOOTBALL_API_KEY;

    if (apiKey && from && to) {
      try {
        const res = await fetch(
          `https://v3.football.api-sports.io/fixtures?league=${config.apiId}&season=2025&from=${from}&to=${to}`,
          {
            headers: { "x-apisports-key": apiKey },
            next: { revalidate: 3600 },
          }
        );
        const data = await res.json();
        const raw = data?.response ?? [];

        // Build set of predicted matches for dedup
        const predictedSet = new Set(
          predictions.map(p => `${p.homeTeamId}-${p.awayTeamId}`)
        );

        fixtures = raw
          .filter((f: any) => {
            const hid = String(f.teams?.home?.id ?? "");
            const aid = String(f.teams?.away?.id ?? "");
            return !predictedSet.has(`${hid}-${aid}`);
          })
          .map((f: any) => {
            const dt = f.fixture?.date ?? "";
            const dateStr = dt.split("T")[0];
            const timeStr = dt.includes("T") ? dt.split("T")[1]?.substring(0, 5) : "";
            return {
              id: `fixture-${f.fixture?.id}`,
              date: dateStr,
              time: timeStr,
              homeTeam: f.teams?.home?.name ?? "",
              awayTeam: f.teams?.away?.name ?? "",
              homeTeamId: String(f.teams?.home?.id ?? ""),
              awayTeamId: String(f.teams?.away?.id ?? ""),
              homeLogo: f.teams?.home?.logo ?? "",
              awayLogo: f.teams?.away?.logo ?? "",
              homeGoals: f.goals?.home ?? null,
              awayGoals: f.goals?.away ?? null,
              status: f.fixture?.status?.short ?? "",
              round: f.league?.round ?? "",
              hasPrediction: false,
            };
          });
      } catch (e) {
        console.error("API-Football fixtures fetch error:", e);
      }
    }

    return NextResponse.json({
      matches: predictions,
      fixtures,
      league: config.name,
      totalCount: predictions.length + fixtures.length,
    });
  } catch (error) {
    console.error("League predictions API error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
