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
  request: NextRequest,
  { params }: { params: Promise<{ league: string }> }
) {
  try {
    const { league } = await params;
    const leagueName = LEAGUE_MAP[league.toLowerCase()] ?? league;

    // month param: "2026-04" format
    const month = request.nextUrl.searchParams.get("month");
    let from: string | undefined;
    let to: string | undefined;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      from = `${month}-01`;
      const [y, m] = month.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      to = `${month}-${String(lastDay).padStart(2, "0")}`;
    }

    const matches = await getPredictionsByLeague(leagueName, { from, to, limit: 100 });

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
