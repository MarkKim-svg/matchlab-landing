import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const API_BASE = "https://v3.football.api-sports.io";
function pad2(n: number) { return String(n).padStart(2, "0"); }

async function apiFetch(path: string, apiKey: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-apisports-key": apiKey },
    next: { revalidate: 3600 },
  });
  const json = await res.json();
  return json.response ?? [];
}

function parseFormResults(fixtures: any[], teamId: number) {
  const results: string[] = [];
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;

  for (const f of fixtures) {
    const isHome = f.teams?.home?.id === teamId;
    const homeGoals = f.goals?.home ?? 0;
    const awayGoals = f.goals?.away ?? 0;
    const gf = isHome ? homeGoals : awayGoals;
    const ga = isHome ? awayGoals : homeGoals;
    goalsFor += gf;
    goalsAgainst += ga;

    if (gf > ga) { results.push("W"); wins++; }
    else if (gf === ga) { results.push("D"); draws++; }
    else { results.push("L"); losses++; }
  }
  return { results, wins, draws, losses, goalsFor, goalsAgainst };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  try {
    const { fixtureId } = await params;
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // 1. Get fixture info (to get team IDs and league)
    const fixtureData = await apiFetch(`/fixtures?id=${fixtureId}`, apiKey);
    const fixture = fixtureData[0];
    if (!fixture) {
      return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
    }

    const homeTeamId = fixture.teams?.home?.id;
    const awayTeamId = fixture.teams?.away?.id;
    const leagueId = fixture.league?.id;
    const season = fixture.league?.season ?? 2025;

    // 2. Fetch all data in parallel
    const [homeFixtures, awayFixtures, h2hData, homeStats, awayStats, standingsData, injuriesData, predictionsData] = await Promise.all([
      apiFetch(`/fixtures?team=${homeTeamId}&last=10`, apiKey),
      apiFetch(`/fixtures?team=${awayTeamId}&last=10`, apiKey),
      apiFetch(`/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}&last=5`, apiKey),
      leagueId ? apiFetch(`/teams/statistics?team=${homeTeamId}&league=${leagueId}&season=${season}`, apiKey) : Promise.resolve([]),
      leagueId ? apiFetch(`/teams/statistics?team=${awayTeamId}&league=${leagueId}&season=${season}`, apiKey) : Promise.resolve([]),
      leagueId ? apiFetch(`/standings?league=${leagueId}&season=${season}`, apiKey) : Promise.resolve([]),
      apiFetch(`/injuries?fixture=${fixtureId}`, apiKey),
      apiFetch(`/predictions?fixture=${fixtureId}`, apiKey),
    ]);

    // 3. Parse form
    const form = {
      home: parseFormResults(homeFixtures, homeTeamId),
      away: parseFormResults(awayFixtures, awayTeamId),
    };

    // 4. Parse team stats
    function parseTeamStats(statsArr: any) {
      const s = Array.isArray(statsArr) ? null : statsArr;
      if (!s) return null;
      const fixtures = s.fixtures;
      const goals = s.goals;
      const played = (fixtures?.played?.total ?? 0) || 1;
      const gf = goals?.for?.total?.total ?? 0;
      const ga = goals?.against?.total?.total ?? 0;
      const cleanSheets = s.clean_sheet?.total ?? 0;
      const over25 = Math.round(((gf + ga) / played > 2.5 ? 1 : 0) * 100); // simplified
      return {
        goalsPerGame: +(gf / played).toFixed(1),
        concededPerGame: +(ga / played).toFixed(1),
        cleanSheetPct: Math.round((cleanSheets / played) * 100),
        played,
      };
    }

    const stats = {
      home: parseTeamStats(homeStats),
      away: parseTeamStats(awayStats),
    };

    // 5. Parse H2H
    let homeWins = 0, h2hDraws = 0, awayWins = 0;
    const recentMatches = h2hData.map((m: any) => {
      const hg = m.goals?.home ?? 0;
      const ag = m.goals?.away ?? 0;
      if (m.teams?.home?.id === homeTeamId) {
        if (hg > ag) homeWins++;
        else if (hg === ag) h2hDraws++;
        else awayWins++;
      } else {
        if (ag > hg) homeWins++;
        else if (hg === ag) h2hDraws++;
        else awayWins++;
      }
      return {
        date: m.fixture?.date?.split("T")[0] ?? "",
        homeTeam: m.teams?.home?.name ?? "",
        awayTeam: m.teams?.away?.name ?? "",
        homeGoals: m.goals?.home ?? 0,
        awayGoals: m.goals?.away ?? 0,
      };
    });

    const h2h = {
      homeWins,
      draws: h2hDraws,
      awayWins,
      total: h2hData.length,
      recentMatches,
    };

    // 6. Parse standings
    const allStandings = standingsData[0]?.league?.standings?.[0] ?? [];
    function findTeamStanding(teamId: number) {
      const t = allStandings.find((s: any) => s.team?.id === teamId);
      if (!t) return null;
      return {
        rank: t.rank,
        played: t.all?.played ?? 0,
        won: t.all?.win ?? 0,
        drawn: t.all?.draw ?? 0,
        lost: t.all?.lose ?? 0,
        points: t.points ?? 0,
        goalsDiff: t.goalsDiff ?? 0,
      };
    }

    const standings = {
      home: findTeamStanding(homeTeamId),
      away: findTeamStanding(awayTeamId),
    };

    // 7. Parse injuries
    const injuries = injuriesData.map((inj: any) => ({
      player: inj.player?.name ?? "",
      team: inj.team?.name ?? "",
      type: inj.player?.type ?? "",
      reason: inj.player?.reason ?? "",
    }));

    // 8. Fixture info (kickoff time, round)
    const fixtureDate = fixture.fixture?.date ?? "";
    const kickoffUTC = fixtureDate.includes("T") ? fixtureDate : "";
    // Convert to KST
    let kickoffKST = "";
    if (kickoffUTC) {
      const d = new Date(kickoffUTC);
      const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
      kickoffKST = `${pad2(kst.getUTCHours())}:${pad2(kst.getUTCMinutes())}`;
    }
    const round = fixture.league?.round ?? "";

    // 9. Lineups from /predictions
    let lineups = null;
    try {
      const pred = Array.isArray(predictionsData) ? predictionsData[0] : null;

      // DEBUG: log predictions structure
      console.log("[match-detail] predictions raw keys:", pred ? Object.keys(pred) : "null");
      if (pred?.teams) {
        console.log("[match-detail] teams.home keys:", Object.keys(pred.teams.home ?? {}));
        console.log("[match-detail] teams.home.players?:", typeof pred.teams.home?.players, pred.teams.home?.players ? "exists" : "undefined");
        console.log("[match-detail] teams.home.league?:", JSON.stringify(pred.teams.home?.league ?? {}).slice(0, 200));
        if (pred.teams.home?.players) {
          console.log("[match-detail] home players keys:", Object.keys(pred.teams.home.players));
          console.log("[match-detail] home startXI sample:", JSON.stringify((pred.teams.home.players.startXI ?? []).slice(0, 2)).slice(0, 300));
        }
      }

      if (pred?.teams) {
        const parseTeamPred = (team: any) => {
          if (!team) return null;
          // Try multiple paths for formation
          const formation = team.league?.formation ?? team.formation ?? "";
          // Try multiple paths for startXI
          const rawXI = team.players?.startXI ?? team.startXI ?? [];
          const rawSubs = team.players?.substitutes ?? team.substitutes ?? [];
          const startXI = rawXI.map((item: any) => ({
            name: item.player?.name ?? item.name ?? "",
            number: item.player?.number ?? item.number ?? 0,
            pos: item.player?.pos ?? item.pos ?? "",
          }));
          const subs = rawSubs.map((item: any) => ({
            name: item.player?.name ?? item.name ?? "",
            number: item.player?.number ?? item.number ?? 0,
            pos: item.player?.pos ?? item.pos ?? "",
          }));
          return { formation, startXI, subs };
        };
        const home = parseTeamPred(pred.teams.home);
        const away = parseTeamPred(pred.teams.away);
        if ((home?.startXI.length ?? 0) > 0 || (away?.startXI.length ?? 0) > 0) {
          lineups = { home, away };
        }
      }
    } catch (e) {
      console.log("[match-detail] lineups parse error:", e);
    }

    console.log("[match-detail] final lineups:", lineups ? `home:${lineups.home?.startXI.length} away:${lineups.away?.startXI.length}` : "null");

    return NextResponse.json({
      form,
      stats,
      h2h,
      standings,
      injuries,
      fixtureInfo: { kickoffKST, round },
      lineups,
    });
  } catch (err) {
    console.error("match-detail API error:", err);
    return NextResponse.json({ error: "Failed to fetch match detail" }, { status: 500 });
  }
}
