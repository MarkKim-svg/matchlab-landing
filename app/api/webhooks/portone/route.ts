import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // TODO: PortOne 결제 완료 웹훅 처리
  // 1. 서명 검증
  // 2. 결제 상태 확인
  // 3. Supabase에 구독 상태 업데이트
  const body = await request.json();
  console.log("[portone webhook]", JSON.stringify(body).slice(0, 200));

  return NextResponse.json({ received: true });
}
