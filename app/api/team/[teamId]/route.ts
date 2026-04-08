import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const API_BASE = "https://v3.football.api-sports.io";

async function apiFetch(path: string, apiKey: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-apisports-key": apiKey },
    next: { revalidate: 3600 },
  });
  return (await res.json()).response ?? [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const leagueId = request.nextUrl.searchParams.get("league") || "";
    const season = request.nextUrl.searchParams.get("season") || "2025";

    // Parallel fetch
    const [recentFixtures, nextFixtures, squadData, playersData, statsData, seasonFixtures] = await Promise.all([
      apiFetch(`/fixtures?team=${teamId}&last=10`, apiKey),
      apiFetch(`/fixtures?team=${teamId}&next=3`, apiKey),
      apiFetch(`/players/squads?team=${teamId}`, apiKey),
      leagueId ? apiFetch(`/players?team=${teamId}&league=${leagueId}&season=${season}`, apiKey) : Promise.resolve([]),
      leagueId ? apiFetch(`/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`, apiKey) : Promise.resolve(null),
      apiFetch(`/fixtures?team=${teamId}&season=${season}`, apiKey),
    ]);

    // Recent matches
    const recent = recentFixtures.map((f: any) => ({
      fixtureId: f.fixture?.id,
      date: f.fixture?.date?.split("T")[0] ?? "",
      homeTeam: f.teams?.home?.name ?? "",
      awayTeam: f.teams?.away?.name ?? "",
      homeTeamId: String(f.teams?.home?.id ?? ""),
      awayTeamId: String(f.teams?.away?.id ?? ""),
      homeGoals: f.goals?.home,
      awayGoals: f.goals?.away,
      league: f.league?.name ?? "",
      status: f.fixture?.status?.short ?? "",
    }));

    // Next matches
    const next = nextFixtures.map((f: any) => ({
      fixtureId: f.fixture?.id,
      date: f.fixture?.date?.split("T")[0] ?? "",
      kickoffUTC: f.fixture?.date ?? "",
      homeTeam: f.teams?.home?.name ?? "",
      awayTeam: f.teams?.away?.name ?? "",
      homeTeamId: String(f.teams?.home?.id ?? ""),
      awayTeamId: String(f.teams?.away?.id ?? ""),
      league: f.league?.name ?? "",
    }));

    // Squad
    const squad = (squadData[0]?.players ?? []).map((p: any) => ({
      id: p.id,
      name: p.name ?? "",
      number: p.number ?? 0,
      position: p.position ?? "",
      photo: p.photo ?? "",
      age: p.age ?? 0,
    }));

    // Top players
    const topPlayers = (Array.isArray(playersData) ? playersData : [])
      .map((p: any) => {
        const s = p.statistics?.[0];
        return {
          id: p.player?.id ?? 0,
          name: p.player?.name ?? "",
          photo: p.player?.photo ?? "",
          goals: s?.goals?.total ?? 0,
          assists: s?.goals?.assists ?? 0,
          appearances: s?.games?.appearences ?? 0,
        };
      })
      .filter((p: any) => p.goals + p.assists > 0)
      .sort((a: any, b: any) => (b.goals + b.assists) - (a.goals + a.assists))
      .slice(0, 10);

    // Season stats
    const s = Array.isArray(statsData) ? null : statsData;
    let seasonStats = null;
    if (s) {
      const fix = s.fixtures;
      const goals = s.goals;
      seasonStats = {
        played: fix?.played?.total ?? 0,
        wins: fix?.wins?.total ?? 0,
        draws: fix?.draws?.total ?? 0,
        losses: fix?.loses?.total ?? 0,
        goalsFor: goals?.for?.total?.total ?? 0,
        goalsAgainst: goals?.against?.total?.total ?? 0,
        cleanSheets: s.clean_sheet?.total ?? 0,
        form: s.form ?? "",
      };
    }

    // All-competition season stats
    let allCompStats = null;
    try {
      const allFix = Array.isArray(seasonFixtures) ? seasonFixtures : [];
      let aw = 0, ad = 0, al = 0, agf = 0, aga = 0, acs = 0;
      for (const f of allFix) {
        const st = f.fixture?.status?.short;
        if (st !== "FT" && st !== "AET" && st !== "PEN") continue;
        const hg = f.goals?.home ?? 0;
        const ag = f.goals?.away ?? 0;
        const isHome = f.teams?.home?.id === Number(teamId);
        const my = isHome ? hg : ag;
        const their = isHome ? ag : hg;
        agf += my; aga += their;
        if (my > their) aw++; else if (my === their) ad++; else al++;
        if (their === 0) acs++;
      }
      const total = aw + ad + al;
      if (total > 0) {
        allCompStats = { played: total, wins: aw, draws: ad, losses: al, goalsFor: agf, goalsAgainst: aga, cleanSheets: acs };
      }
    } catch { /* skip */ }

    // Competitions this season (from seasonFixtures)
    const compMap = new Map<number, { name: string; logo: string }>();
    for (const f of (Array.isArray(seasonFixtures) ? seasonFixtures : [])) {
      const lid = f.league?.id;
      if (lid && !compMap.has(lid)) {
        compMap.set(lid, { name: f.league.name ?? "", logo: f.league.logo ?? "" });
      }
    }
    const competitions = Array.from(compMap.values());

    return NextResponse.json({ recent, next, squad, topPlayers, seasonStats, allCompStats, competitions });
  } catch (err) {
    console.error("Team API error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
