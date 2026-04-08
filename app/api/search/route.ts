import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://v3.football.api-sports.io";

// Filter out youth/reserve/women teams
const EXCLUDE_PATTERNS = /\b(U\d{2}|U-\d{2}|Youth|Reserve|II|B\s|Women|Femeni|Femenino)\b|\sW$/i;

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

    // Teams: dedupe by id, filter out youth/reserve/women
    const seenIds = new Set<number>();
    const teams = (teamsData?.response ?? [])
      .filter((t: any) => {
        const name = t.team?.name ?? "";
        const id = t.team?.id ?? 0;
        if (seenIds.has(id)) return false;
        if (EXCLUDE_PATTERNS.test(name)) return false;
        seenIds.add(id);
        return true;
      })
      .slice(0, 8)
      .map((t: any) => ({
        id: t.team?.id ?? 0,
        name: t.team?.name ?? "",
        logo: t.team?.logo ?? "",
        country: t.team?.country ?? "",
      }));

    // Players
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
