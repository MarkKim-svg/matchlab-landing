import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const ALLOWED = new Set(["2", "3", "848", "45", "143", "137", "81", "66"]);
const API_BASE = "https://v3.football.api-sports.io";

// Rounds to fetch (both legs)
const ROUND_QUERIES = [
  "Round of 16",
  "Round of 16 - 2nd Leg",
  "Quarter-finals",
  "Quarter-finals - 2nd Leg",
  "Semi-finals",
  "Semi-finals - 2nd Leg",
  "Final",
];

// Normalize round name to base round
function baseRound(r: string): string {
  if (r.includes("Round of 16")) return "R16";
  if (r.includes("Quarter")) return "QF";
  if (r.includes("Semi")) return "SF";
  if (r.includes("Final")) return "F";
  return r;
}

export interface TieData {
  team1: string;
  team2: string;
  team1Logo: string;
  team2Logo: string;
  leg1: { home: number | null; away: number | null; status: string; date: string; kickoffUTC: string } | null;
  leg2: { home: number | null; away: number | null; status: string; date: string; kickoffUTC: string } | null;
  aggTeam1: number;
  aggTeam2: number;
  winner: string | null;
  finished: boolean;
  firstFixtureId: number; // for ordering
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

    // Fetch all rounds in parallel
    const allFixtures: any[] = [];
    const fetches = ROUND_QUERIES.map(async (round) => {
      try {
        const res = await fetch(
          `${API_BASE}/fixtures?league=${leagueId}&season=${season}&round=${encodeURIComponent(round)}`,
          { headers: { "x-apisports-key": apiKey }, next: { revalidate: 3600 } }
        );
        const data = await res.json();
        for (const f of (data?.response ?? [])) {
          allFixtures.push({ ...f, _round: round });
        }
      } catch { /* skip */ }
    });
    await Promise.all(fetches);

    // Group fixtures by base round, then by tie (team pair)
    const byRound = new Map<string, Map<string, any[]>>();
    for (const f of allFixtures) {
      const br = baseRound(f._round);
      if (!byRound.has(br)) byRound.set(br, new Map());
      const tieMap = byRound.get(br)!;

      const hName = f.teams?.home?.name ?? "";
      const aName = f.teams?.away?.name ?? "";
      // Key: sorted team names to match across legs
      const key = [hName, aName].sort().join("|");

      if (!tieMap.has(key)) tieMap.set(key, []);
      tieMap.get(key)!.push(f);
    }

    // Build ties per round
    const roundOrder = ["R16", "QF", "SF", "F"];
    const rounds: Record<string, TieData[]> = {};

    for (const br of roundOrder) {
      const tieMap = byRound.get(br);
      if (!tieMap || tieMap.size === 0) continue;

      const ties: TieData[] = [];
      for (const [, fixtures] of tieMap) {
        // Sort by date to get leg1 first
        fixtures.sort((a: any, b: any) => (a.fixture?.date ?? "").localeCompare(b.fixture?.date ?? ""));

        const f1 = fixtures[0];
        const f2 = fixtures.length > 1 ? fixtures[1] : null;
        const isFinal = br === "F";

        // Consistent team1/team2 across legs
        const team1 = f1.teams?.home?.name ?? "";
        const team2 = f1.teams?.away?.name ?? "";
        const team1Logo = f1.teams?.home?.logo ?? "";
        const team2Logo = f1.teams?.away?.logo ?? "";

        const firstFixtureId = f1.fixture?.id ?? 0;
        const leg1Home = f1.goals?.home ?? null;
        const leg1Away = f1.goals?.away ?? null;
        const leg1Status = f1.fixture?.status?.short ?? "";
        const leg1Date = f1.fixture?.date?.split("T")[0] ?? "";
        const leg1Kickoff = f1.fixture?.date ?? "";

        let leg2Data: TieData["leg2"] = null;
        if (f2) {
          const f2Home = f2.teams?.home?.name ?? "";
          const isSwapped = f2Home === team2;
          leg2Data = {
            home: f2.goals?.home ?? null,
            away: f2.goals?.away ?? null,
            status: f2.fixture?.status?.short ?? "",
            date: f2.fixture?.date?.split("T")[0] ?? "",
            kickoffUTC: f2.fixture?.date ?? "",
          };

          // Aggregate: team1 goals across both legs
          const t1Leg1 = leg1Home ?? 0;
          const t1Leg2 = isSwapped ? (f2.goals?.away ?? 0) : (f2.goals?.home ?? 0);
          const t2Leg1 = leg1Away ?? 0;
          const t2Leg2 = isSwapped ? (f2.goals?.home ?? 0) : (f2.goals?.away ?? 0);

          const agg1 = t1Leg1 + t1Leg2;
          const agg2 = t2Leg1 + t2Leg2;
          const fin = (leg1Status === "FT" || leg1Status === "AET" || leg1Status === "PEN") &&
                      (leg2Data.status === "FT" || leg2Data.status === "AET" || leg2Data.status === "PEN");

          ties.push({
            team1, team2, team1Logo, team2Logo,
            leg1: { home: leg1Home, away: leg1Away, status: leg1Status, date: leg1Date, kickoffUTC: leg1Kickoff },
            leg2: leg2Data,
            aggTeam1: agg1, aggTeam2: agg2,
            winner: fin ? (agg1 > agg2 ? team1 : agg2 > agg1 ? team2 : null) : null,
            finished: fin,
            firstFixtureId,
          });
        } else {
          const fin = leg1Status === "FT" || leg1Status === "AET" || leg1Status === "PEN";
          ties.push({
            team1, team2, team1Logo, team2Logo,
            leg1: { home: leg1Home, away: leg1Away, status: leg1Status, date: leg1Date, kickoffUTC: leg1Kickoff },
            leg2: null,
            aggTeam1: leg1Home ?? 0, aggTeam2: leg1Away ?? 0,
            winner: fin ? ((leg1Home ?? 0) > (leg1Away ?? 0) ? team1 : (leg1Away ?? 0) > (leg1Home ?? 0) ? team2 : null) : null,
            finished: fin,
            firstFixtureId,
          });
        }
      }
      // Sort by fixture ID for consistent seed-based ordering
      ties.sort((a, b) => a.firstFixtureId - b.firstFixtureId);
      rounds[br] = ties;
    }

    return NextResponse.json({ rounds });
  } catch (err) {
    console.error("Tournament API error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
