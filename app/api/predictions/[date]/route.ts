import { NextRequest, NextResponse } from "next/server";
import { getPredictionsByDate } from "@/lib/notion";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const matches = await getPredictionsByDate(date);
    const proCount = matches.filter(m => m.isProOnly).length;

    return NextResponse.json({
      matches,
      date,
      totalCount: matches.length,
      proCount,
    });
  } catch (error) {
    console.error("Predictions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}
