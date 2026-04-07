import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const API_BASE = "https://v3.football.api-sports.io";

// All supported league IDs
const LEAGUE_IDS = [39, 140, 135, 78, 61, 2, 3, 848, 45, 143, 137, 81, 66];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ fixtures: [] });
    }

    // Fetch fixtures for all leagues in parallel
    const fetches = LEAGUE_IDS.map(async (leagueId) => {
      try {
        const res = await fetch(
          `${API_BASE}/fixtures?date=${date}&league=${leagueId}&season=2025`,
          { headers: { "x-apisports-key": apiKey }, next: { revalidate: 3600 } }
        );
        const data = await res.json();
        return (data?.response ?? []).map((f: any) => ({
          id: `fx-${f.fixture?.id}`,
          date: f.fixture?.date?.split("T")[0] ?? date,
          kickoffUTC: f.fixture?.date ?? "",
          homeTeam: f.teams?.home?.name ?? "",
          awayTeam: f.teams?.away?.name ?? "",
          homeTeamId: String(f.teams?.home?.id ?? ""),
          awayTeamId: String(f.teams?.away?.id ?? ""),
          homeLogo: f.teams?.home?.logo ?? "",
          awayLogo: f.teams?.away?.logo ?? "",
          homeGoals: f.goals?.home ?? null,
          awayGoals: f.goals?.away ?? null,
          status: f.fixture?.status?.short ?? "",
          league: f.league?.name ?? "",
          leagueId: f.league?.id ?? 0,
          round: f.league?.round ?? "",
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(fetches);
    const fixtures = results.flat();

    return NextResponse.json({ fixtures });
  } catch (err) {
    console.error("Fixtures API error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
