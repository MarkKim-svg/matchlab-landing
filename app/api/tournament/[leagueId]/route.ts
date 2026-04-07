import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const ALLOWED = new Set(["2", "3", "848"]);

const ROUNDS_ORDER = [
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Final",
];

interface MatchData {
  fixtureId: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;
  round: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await params;
    if (!ALLOWED.has(leagueId)) {
      return NextResponse.json({ error: "Invalid league" }, { status: 400 });
    }

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const season = request.nextUrl.searchParams.get("season") || "2025";

    // Fetch all knockout fixtures
    const rounds: Record<string, MatchData[]> = {};

    for (const round of ROUNDS_ORDER) {
      try {
        const res = await fetch(
          `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}&round=${encodeURIComponent(round)}`,
          {
            headers: { "x-apisports-key": apiKey },
            next: { revalidate: 3600 },
          }
        );
        const data = await res.json();
        const fixtures = data?.response ?? [];

        if (fixtures.length > 0) {
          rounds[round] = fixtures.map((f: any) => ({
            fixtureId: f.fixture?.id ?? 0,
            date: f.fixture?.date?.split("T")[0] ?? "",
            homeTeam: f.teams?.home?.name ?? "",
            awayTeam: f.teams?.away?.name ?? "",
            homeLogo: f.teams?.home?.logo ?? "",
            awayLogo: f.teams?.away?.logo ?? "",
            homeGoals: f.goals?.home ?? null,
            awayGoals: f.goals?.away ?? null,
            status: f.fixture?.status?.short ?? "",
            round,
          }));
        }
      } catch {
        // skip failed round
      }
    }

    return NextResponse.json({ rounds });
  } catch (err) {
    console.error("Tournament API error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
