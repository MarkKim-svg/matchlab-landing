import { NextRequest, NextResponse } from "next/server";
import { getPredictionsByLeague } from "@/lib/notion";

export const revalidate = 3600;

const LEAGUE_MAP: Record<string, string> = {
  epl: "프리미어리그",
  laliga: "라리가",
  seriea: "세리에A",
  bundesliga: "분데스리가",
  ligue1: "리그1",
  ucl: "챔피언스리그",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ league: string }> }
) {
  try {
    const { league } = await params;
    const leagueName = LEAGUE_MAP[league.toLowerCase()] ?? league;

    const matches = await getPredictionsByLeague(leagueName, 20);

    return NextResponse.json({
      matches,
      league: leagueName,
      totalCount: matches.length,
    });
  } catch (error) {
    console.error("League predictions API error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
