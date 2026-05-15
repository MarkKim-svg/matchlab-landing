import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const ALLOWED = new Set(["2", "3", "848", "45", "143", "137", "81", "66"]);
const API_BASE = "https://v3.football.api-sports.io";

// API-Football 라운드 표기 → 우리 brackets 키 매핑.
// 등록되지 않은 라운드(League Stage, Qualifying, Playoff round 등)는 토너먼트 브래킷에서 제외.
function classifyRound(raw: string): { key: string; order: number } | null {
  const r = raw.toLowerCase().trim();
  // R128 / 1/128-finals 통합
  if (r.includes("round of 128") || r.includes("1/128")) return { key: "R128", order: 1 };
  if (r.includes("round of 64")) return { key: "R64", order: 2 };
  if (r.includes("round of 32")) return { key: "R32", order: 3 };
  if (r.includes("round of 16") || r === "8th finals") return { key: "R16", order: 4 };
  if (r.includes("quarter")) return { key: "QF", order: 5 };
  if (r.includes("semi")) return { key: "SF", order: 6 };
  if (r === "final" || r.endsWith(" final")) return { key: "F", order: 7 };
  return null;
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
  firstFixtureId: number;
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

    // 1. 시즌별 사용 가능한 라운드 동적 조회
    const roundsRes = await fetch(
      `${API_BASE}/fixtures/rounds?league=${leagueId}&season=${season}`,
      { headers: { "x-apisports-key": apiKey }, next: { revalidate: 3600 } }
    );
    const roundsData = await roundsRes.json();
    const availableRounds: string[] = roundsData?.response ?? [];

    // 토너먼트 라운드만 필터 (League Stage / Qualifying / Group A,B... 제외)
    const tournamentRounds: { raw: string; key: string; order: number }[] = [];
    for (const raw of availableRounds) {
      const cls = classifyRound(raw);
      if (cls) tournamentRounds.push({ raw, ...cls });
    }

    if (tournamentRounds.length === 0) {
      return NextResponse.json({ rounds: {}, availableKeys: [] });
    }

    // 2. 각 토너먼트 라운드의 fixtures 병렬 fetch
    const allFixtures: any[] = [];
    await Promise.all(
      tournamentRounds.map(async ({ raw }) => {
        try {
          const res = await fetch(
            `${API_BASE}/fixtures?league=${leagueId}&season=${season}&round=${encodeURIComponent(raw)}`,
            { headers: { "x-apisports-key": apiKey }, next: { revalidate: 3600 } }
          );
          const data = await res.json();
          const fixtures = data?.response ?? [];
          for (const f of fixtures) allFixtures.push({ ...f, _roundRaw: raw });
        } catch { /* skip */ }
      })
    );

    // 3. 라운드 키별로 그룹핑, 동일 라운드 내에서는 팀쌍(tie) 단위로 묶음 (양다리)
    const rawToKey = new Map<string, string>();
    for (const tr of tournamentRounds) rawToKey.set(tr.raw, tr.key);

    const byRound = new Map<string, Map<string, any[]>>();
    for (const f of allFixtures) {
      const key = rawToKey.get(f._roundRaw);
      if (!key) continue;
      if (!byRound.has(key)) byRound.set(key, new Map());
      const tieMap = byRound.get(key)!;
      const hName = f.teams?.home?.name ?? "";
      const aName = f.teams?.away?.name ?? "";
      const tieKey = [hName, aName].sort().join("|");
      if (!tieMap.has(tieKey)) tieMap.set(tieKey, []);
      tieMap.get(tieKey)!.push(f);
    }

    // 4. 각 라운드 → TieData 배열
    const rounds: Record<string, TieData[]> = {};
    for (const [roundKey, tieMap] of byRound) {
      const ties: TieData[] = [];
      for (const [, fixtures] of tieMap) {
        fixtures.sort((a: any, b: any) => (a.fixture?.date ?? "").localeCompare(b.fixture?.date ?? ""));
        const f1 = fixtures[0];
        const f2 = fixtures.length > 1 ? fixtures[1] : null;

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

        if (f2) {
          const f2Home = f2.teams?.home?.name ?? "";
          const isSwapped = f2Home === team2;
          const leg2 = {
            home: f2.goals?.home ?? null,
            away: f2.goals?.away ?? null,
            status: f2.fixture?.status?.short ?? "",
            date: f2.fixture?.date?.split("T")[0] ?? "",
            kickoffUTC: f2.fixture?.date ?? "",
          };
          const t1Leg1 = leg1Home ?? 0;
          const t1Leg2 = isSwapped ? (f2.goals?.away ?? 0) : (f2.goals?.home ?? 0);
          const t2Leg1 = leg1Away ?? 0;
          const t2Leg2 = isSwapped ? (f2.goals?.home ?? 0) : (f2.goals?.away ?? 0);
          const agg1 = t1Leg1 + t1Leg2;
          const agg2 = t2Leg1 + t2Leg2;
          const fin = ["FT", "AET", "PEN"].includes(leg1Status) && ["FT", "AET", "PEN"].includes(leg2.status);
          ties.push({
            team1, team2, team1Logo, team2Logo,
            leg1: { home: leg1Home, away: leg1Away, status: leg1Status, date: leg1Date, kickoffUTC: leg1Kickoff },
            leg2,
            aggTeam1: agg1, aggTeam2: agg2,
            winner: fin ? (agg1 > agg2 ? team1 : agg2 > agg1 ? team2 : null) : null,
            finished: fin,
            firstFixtureId,
          });
        } else {
          const fin = ["FT", "AET", "PEN"].includes(leg1Status);
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
      ties.sort((a, b) => a.firstFixtureId - b.firstFixtureId);
      rounds[roundKey] = ties;
    }

    // 5. 응답 — 사용 가능한 라운드 키를 order로 정렬해서 함께 반환
    const availableKeys = Array.from(new Set(tournamentRounds.map(tr => tr.key)))
      .filter(k => rounds[k]?.length > 0)
      .sort((a, b) => {
        const orderA = tournamentRounds.find(tr => tr.key === a)?.order ?? 99;
        const orderB = tournamentRounds.find(tr => tr.key === b)?.order ?? 99;
        return orderA - orderB;
      });

    return NextResponse.json({ rounds, availableKeys });
  } catch (err) {
    console.error("Tournament API error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
