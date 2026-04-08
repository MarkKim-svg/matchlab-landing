import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const API_BASE = "https://v3.football.api-sports.io";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const apiFetch = async (path: string) => {
      const r = await fetch(`${API_BASE}${path}`, { headers: { "x-apisports-key": apiKey }, next: { revalidate: 3600 } });
      return (await r.json()).response ?? [];
    };

    const [playerData, trophiesData, transfersData] = await Promise.all([
      apiFetch(`/players?id=${playerId}&season=2025`),
      apiFetch(`/trophies?player=${playerId}`),
      apiFetch(`/transfers?player=${playerId}`),
    ]);

    const p = playerData[0];
    if (!p) return NextResponse.json({ error: "Player not found" }, { status: 404 });

    const player = p.player;
    const stats = p.statistics ?? [];

    // Aggregate across all competitions
    let totalApps = 0, totalGoals = 0, totalAssists = 0, totalMinutes = 0;
    let totalYellow = 0, totalRed = 0, totalShots = 0, totalShotsOn = 0;
    let totalPasses = 0, totalPassKey = 0, totalTackles = 0, totalInterceptions = 0;
    let totalDribbles = 0, totalDribblesSuccess = 0, totalSaves = 0;

    const perComp = stats.map((s: any) => {
      const g = s.games ?? {};
      const gl = s.goals ?? {};
      const cards = s.cards ?? {};
      const shots = s.shots ?? {};
      const passes = s.passes ?? {};
      const tackles = s.tackles ?? {};
      const dribbles = s.dribbles ?? {};
      const gkSaves = s.goals?.saves ?? 0;

      totalApps += g.appearences ?? 0;
      totalGoals += gl.total ?? 0;
      totalAssists += gl.assists ?? 0;
      totalMinutes += g.minutes ?? 0;
      totalYellow += cards.yellow ?? 0;
      totalRed += cards.red ?? 0;
      totalShots += shots.total ?? 0;
      totalShotsOn += shots.on ?? 0;
      totalPasses += passes.total ?? 0;
      totalPassKey += passes.key ?? 0;
      totalTackles += tackles.total ?? 0;
      totalInterceptions += tackles.interceptions ?? 0;
      totalDribbles += dribbles.attempts ?? 0;
      totalDribblesSuccess += dribbles.success ?? 0;
      totalSaves += gkSaves;

      return {
        league: s.league?.name ?? "",
        leagueLogo: s.league?.logo ?? "",
        teamName: s.team?.name ?? "",
        teamLogo: s.team?.logo ?? "",
        teamId: s.team?.id ?? 0,
        appearances: g.appearences ?? 0,
        starts: g.lineups ?? 0,
        minutes: g.minutes ?? 0,
        goals: gl.total ?? 0,
        assists: gl.assists ?? 0,
      };
    });

    // Trophies
    const trophies = (Array.isArray(trophiesData) ? trophiesData : []).map((t: any) => ({
      league: t.league ?? "",
      country: t.country ?? "",
      season: t.season ?? "",
      place: t.place ?? "",
    }));

    // Transfers
    const transfers = (Array.isArray(transfersData) ? transfersData : [])
      .flatMap((t: any) => (t.transfers ?? []).map((tr: any) => ({
        date: tr.date ?? "",
        type: tr.type ?? "",
        teamIn: tr.teams?.in?.name ?? "",
        teamInLogo: tr.teams?.in?.logo ?? "",
        teamInId: tr.teams?.in?.id ?? 0,
        teamOut: tr.teams?.out?.name ?? "",
        teamOutLogo: tr.teams?.out?.logo ?? "",
        teamOutId: tr.teams?.out?.id ?? 0,
      })))
      .sort((a: any, b: any) => b.date.localeCompare(a.date));

    return NextResponse.json({
      player: {
        id: player.id,
        name: player.name,
        firstname: player.firstname,
        lastname: player.lastname,
        photo: player.photo,
        nationality: player.nationality,
        age: player.age,
        height: player.height,
        weight: player.weight,
      },
      position: stats[0]?.games?.position ?? "",
      teamName: stats[0]?.team?.name ?? "",
      teamLogo: stats[0]?.team?.logo ?? "",
      teamId: stats[0]?.team?.id ?? 0,
      number: stats[0]?.games?.number ?? 0,
      totals: {
        appearances: totalApps, goals: totalGoals, assists: totalAssists, minutes: totalMinutes,
        yellow: totalYellow, red: totalRed, shots: totalShots, shotsOn: totalShotsOn,
        passes: totalPasses, passKey: totalPassKey, tackles: totalTackles, interceptions: totalInterceptions,
        dribbles: totalDribbles, dribblesSuccess: totalDribblesSuccess, saves: totalSaves,
      },
      perCompetition: perComp,
      trophies,
      transfers,
    });
  } catch (err) {
    console.error("Player API error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
