import { NextRequest, NextResponse } from "next/server";
import { getPredictionById, getMatchReport } from "@/lib/notion";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;

    const match = await getPredictionById(matchId);
    if (!match) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
    }

    let report = null;
    try {
      report = await getMatchReport(match.match, match.date);
    } catch (e) {
      console.error("[report API] getMatchReport failed:", e);
    }

    return NextResponse.json({ match, report });
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
