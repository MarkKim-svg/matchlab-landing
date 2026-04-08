import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://v3.football.api-sports.io";

const EXCLUDE_PATTERNS = /\b(U\d{2}|U-\d{2}|Youth|Reserve|II|B\s|Women|Femeni|Femenino)\b|\sW$/i;

// Known 1st division league IDs
const TOP_LEAGUE_IDS = new Set([39, 140, 135, 78, 61, 2, 3, 848, 88, 94, 203, 253, 307]);

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") || "";
    if (q.length < 2) return NextResponse.json({ teams: [], players: [] });

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) return NextResponse.json({ teams: [], players: [] });

    // Fetch teams + players in parallel
    // For players, try without league filter first (broader search)
    const [teamsRes, playersRes] = await Promise.all([
      fetch(`${API_BASE}/teams?search=${encodeURIComponent(q)}`, {
        headers: { "x-apisports-key": apiKey },
      }),
      fetch(`${API_BASE}/players?search=${encodeURIComponent(q)}&league=39&season=2025`, {
        headers: { "x-apisports-key": apiKey },
      }).then(async r => {
        const d = await r.json();
        if ((d?.response ?? []).length > 0) return d;
        // Fallback: try La Liga
        const r2 = await fetch(`${API_BASE}/players?search=${encodeURIComponent(q)}&league=140&season=2025`, {
          headers: { "x-apisports-key": apiKey! },
        });
        return r2.json();
      }).catch(() => ({ response: [] })),
    ]);

    const teamsData = await teamsRes.json();

    // Teams: dedupe, filter youth, prefer top league teams
    const seenIds = new Set<number>();
    const allTeams = (teamsData?.response ?? [])
      .filter((t: any) => {
        const name = t.team?.name ?? "";
        const id = t.team?.id ?? 0;
        if (seenIds.has(id)) return false;
        if (EXCLUDE_PATTERNS.test(name)) return false;
        seenIds.add(id);
        return true;
      });

    // Sort: teams in known top leagues first
    const teams = allTeams
      .sort((a: any, b: any) => {
        const aTop = a.team?.national ? 0 : 1; // national teams deprioritized
        const bTop = b.team?.national ? 0 : 1;
        return bTop - aTop;
      })
      .slice(0, 8)
      .map((t: any) => ({
        id: t.team?.id ?? 0,
        name: t.team?.name ?? "",
        logo: t.team?.logo ?? "",
        country: t.team?.country ?? "",
      }));

    // Players
    const playersData = playersRes;
    const players = (playersData?.response ?? []).slice(0, 8).map((p: any) => ({
      id: p.player?.id ?? 0,
      name: p.player?.name ?? "",
      photo: p.player?.photo ?? "",
      team: p.statistics?.[0]?.team?.name ?? "",
      teamLogo: p.statistics?.[0]?.team?.logo ?? "",
    }));

    console.log(`[search] q="${q}" teams:${teams.length} players:${players.length}`);

    return NextResponse.json({ teams, players });
  } catch (err) {
    console.error("[search] error:", err);
    return NextResponse.json({ teams: [], players: [] });
  }
}
