import { NextRequest, NextResponse } from "next/server";
import { getPredictionById } from "@/lib/notion";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;

    const match = await getPredictionById(matchId);

    if (!match) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Prediction detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prediction" },
      { status: 500 }
    );
  }
}
