import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const ALLOWED_LEAGUES = new Set(["39", "140", "135", "78", "61"]);

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
      `https://v3.football.api-sports.io/players/topscorers?league=${league}&season=${season}`,
      {
        headers: { "x-apisports-key": apiKey },
        next: { revalidate: 3600 },
      }
    );

    const data = await res.json();
    const players = data?.response ?? [];

    if (players.length === 0) {
      return NextResponse.json({ scorers: [] });
    }

    const parsed = players.slice(0, 20).map((p: any, i: number) => ({
      rank: i + 1,
      playerName: p.player.name,
      playerPhoto: p.player.photo,
      teamName: p.statistics?.[0]?.team?.name ?? "",
      teamLogo: p.statistics?.[0]?.team?.logo ?? "",
      goals: p.statistics?.[0]?.goals?.total ?? 0,
      assists: p.statistics?.[0]?.goals?.assists ?? 0,
      appearances: p.statistics?.[0]?.games?.appearences ?? 0,
    }));

    return NextResponse.json({ scorers: parsed });
  } catch (err) {
    console.error("top-scorers API error:", err);
    return NextResponse.json({ error: "Failed to fetch top scorers" }, { status: 500 });
  }
}
