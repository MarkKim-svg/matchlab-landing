import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const ALLOWED_LEAGUES = new Set(["39", "140", "135", "78", "61", "2", "3", "848", "45", "143", "137", "81", "66"]);
const API_BASE = "https://v3.football.api-sports.io";

export async function GET(request: NextRequest) {
  try {
    const league = request.nextUrl.searchParams.get("league") || "39";
    const season = request.nextUrl.searchParams.get("season") || "2025";

    if (!ALLOWED_LEAGUES.has(league)) {
      return NextResponse.json({ error: "Invalid league" }, { status: 400 });
    }

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Fetch standings + upcoming fixtures in parallel
    const today = new Date().toISOString().split("T")[0];
    const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

    const [standingsRes, fixturesRes] = await Promise.all([
      fetch(`${API_BASE}/standings?league=${league}&season=${season}`, {
        headers: { "x-apisports-key": apiKey },
        next: { revalidate: 3600 },
      }),
      apiKey ? fetch(`${API_BASE}/fixtures?league=${league}&season=${season}&from=${today}&to=${twoWeeks}`, {
        headers: { "x-apisports-key": apiKey },
        next: { revalidate: 3600 },
      }) : Promise.resolve(null),
    ]);

    const data = await standingsRes.json();
    const standings = data?.response?.[0]?.league?.standings?.[0];

    if (!standings || standings.length === 0) {
      return NextResponse.json({ standings: [], season: null, nextFixtures: {} });
    }

    // Build next fixture map: teamId → { opponent, opponentLogo, isHome, date }
    const nextFixtures: Record<number, { opponent: string; opponentLogo: string; isHome: boolean; date: string }> = {};
    try {
      if (fixturesRes) {
        const fxData = await fixturesRes.json();
        const fixtures = (fxData?.response ?? []).sort((a: any, b: any) =>
          (a.fixture?.date ?? "").localeCompare(b.fixture?.date ?? "")
        );
        for (const f of fixtures) {
          const hId = f.teams?.home?.id;
          const aId = f.teams?.away?.id;
          const date = f.fixture?.date?.split("T")[0] ?? "";
          if (hId && !nextFixtures[hId]) {
            nextFixtures[hId] = { opponent: f.teams.away.name, opponentLogo: f.teams.away.logo, isHome: true, date };
          }
          if (aId && !nextFixtures[aId]) {
            nextFixtures[aId] = { opponent: f.teams.home.name, opponentLogo: f.teams.home.logo, isHome: false, date };
          }
        }
      }
    } catch { /* skip */ }

    const parsed = standings.map((t: any) => ({
      rank: t.rank,
      teamId: t.team.id,
      teamName: t.team.name,
      teamLogo: t.team.logo,
      points: t.points,
      played: t.all.played,
      win: t.all.win,
      draw: t.all.draw,
      lose: t.all.lose,
      goalsDiff: t.goalsDiff,
      description: t.description ?? null,
      form: t.form ?? "",
      nextMatch: nextFixtures[t.team.id] ?? null,
    }));

    return NextResponse.json({
      standings: parsed,
      season: data?.response?.[0]?.league?.season ?? null,
    });
  } catch (err) {
    console.error("standings API error:", err);
    return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 });
  }
}
