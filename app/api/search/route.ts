import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://v3.football.api-sports.io";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") || "";
    if (q.length < 2) return NextResponse.json({ teams: [], players: [] });

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) return NextResponse.json({ teams: [], players: [] });

    const [teamsRes, playersRes] = await Promise.all([
      fetch(`${API_BASE}/teams?search=${encodeURIComponent(q)}`, {
        headers: { "x-apisports-key": apiKey },
      }),
      fetch(`${API_BASE}/players?search=${encodeURIComponent(q)}&season=2025`, {
        headers: { "x-apisports-key": apiKey },
      }),
    ]);

    const teamsData = await teamsRes.json();
    const playersData = await playersRes.json();

    const teams = (teamsData?.response ?? []).slice(0, 8).map((t: any) => ({
      id: t.team?.id ?? 0,
      name: t.team?.name ?? "",
      logo: t.team?.logo ?? "",
      country: t.team?.country ?? "",
    }));

    const players = (playersData?.response ?? []).slice(0, 8).map((p: any) => ({
      id: p.player?.id ?? 0,
      name: p.player?.name ?? "",
      photo: p.player?.photo ?? "",
      team: p.statistics?.[0]?.team?.name ?? "",
      teamLogo: p.statistics?.[0]?.team?.logo ?? "",
    }));

    return NextResponse.json({ teams, players });
  } catch {
    return NextResponse.json({ teams: [], players: [] });
  }
}
