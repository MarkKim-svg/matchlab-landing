import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://v3.football.api-sports.io";
const EXCLUDE_PATTERNS = /\b(U\d{2}|U-\d{2}|Youth|Reserve|II|B\s|Women|Femeni|Femenino)\b|\sW$/i;

// Top league IDs for player search fallback
const PLAYER_LEAGUES = [39, 140, 135, 78, 61];

async function apiFetch(path: string, apiKey: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { "x-apisports-key": apiKey } });
  return res.json();
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") || "";
    if (q.length < 2) return NextResponse.json({ teams: [], players: [] });

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) return NextResponse.json({ teams: [], players: [] });

    // Teams search
    const teamsData = await apiFetch(`/teams?search=${encodeURIComponent(q)}`, apiKey);

    const seenIds = new Set<number>();
    const teams = (teamsData?.response ?? [])
      .filter((t: any) => {
        const name = t.team?.name ?? "";
        const id = t.team?.id ?? 0;
        if (seenIds.has(id) || EXCLUDE_PATTERNS.test(name)) return false;
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

    // Player search — try each top league until we get results
    let players: any[] = [];
    for (const lid of PLAYER_LEAGUES) {
      if (players.length > 0) break;
      try {
        const d = await apiFetch(`/players?search=${encodeURIComponent(q)}&league=${lid}&season=2025`, apiKey);
        const raw = d?.response ?? [];
        console.log(`[search] players league=${lid} results=${raw.length}`);
        if (raw.length > 0) {
          players = raw.slice(0, 8).map((p: any) => ({
            id: p.player?.id ?? 0,
            name: p.player?.name ?? "",
            photo: p.player?.photo ?? "",
            team: p.statistics?.[0]?.team?.name ?? "",
            teamLogo: p.statistics?.[0]?.team?.logo ?? "",
          }));
        }
      } catch { /* next league */ }
    }

    console.log(`[search] q="${q}" teams:${teams.length} players:${players.length}`);
    return NextResponse.json({ teams, players });
  } catch (err) {
    console.error("[search] error:", err);
    return NextResponse.json({ teams: [], players: [] });
  }
}
