import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Supabase에서 오늘 날짜 대시보드 데이터 조회
  return NextResponse.json({
    status: "ok",
    message: "Sprint 2에서 구현 예정",
    data: null,
  });
}
