import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/notion";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";

    if (!["7d", "30d", "all"].includes(period)) {
      return NextResponse.json({ error: "Invalid period. Use 7d, 30d, or all." }, { status: 400 });
    }

    const data = await getDashboardData(period);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
