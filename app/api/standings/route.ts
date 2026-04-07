import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const ALLOWED_LEAGUES = new Set(["39", "140", "135", "78", "61", "2", "3", "848"]);

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

    const res = await fetch(
      `https://v3.football.api-sports.io/standings?league=${league}&season=${season}`,
      {
        headers: { "x-apisports-key": apiKey },
        next: { revalidate: 3600 },
      }
    );

    const data = await res.json();
    const standings = data?.response?.[0]?.league?.standings?.[0];

    if (!standings || standings.length === 0) {
      return NextResponse.json({ standings: [], season: null });
    }

    const parsed = standings.map((t: any) => ({
      rank: t.rank,
      teamName: t.team.name,
      teamLogo: t.team.logo,
      points: t.points,
      played: t.all.played,
      win: t.all.win,
      draw: t.all.draw,
      lose: t.all.lose,
      goalsDiff: t.goalsDiff,
      description: t.description ?? null,
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
