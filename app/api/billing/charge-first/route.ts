import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 첫 9,900원 정기결제 청구 + plan 'free' → 'pro' 전환.
// - 클라이언트가 빌링키 등록 직후 호출 (옵션 A: one-shot UX)
// - 인증된 user.id 기준 profiles 조회 → billing_key + plan='free' 검증 후 PortOne V2 결제 API 호출
// - paymentId = `payment-{user_id}-{YYYYMM}` (idempotent + 사람이 읽기 쉬움)
// - 성공 시 plan='pro', subscription_started_at=now(), next_billing_at=now()+30d
//
// 멱등: 이미 plan='pro'이면 conflict 응답. PortOne이 같은 paymentId에 AlreadyPaidError를 줄 수도 있음 → 그 경우도 정상 처리.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PRO_PRICE_KRW = 9900;
const ORDER_NAME = "MATCHLAB Pro 월 구독 (얼리버드)";
const PORTONE_API_BASE = "https://api.portone.io";

function makePaymentId(userId: string, now: Date): string {
  const yyyymm = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `payment-${userId}-${yyyymm}`;
}

function addDays(d: Date, days: number): Date {
  const c = new Date(d);
  c.setUTCDate(c.getUTCDate() + days);
  return c;
}

export async function POST(_req: NextRequest) {
  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!apiSecret) {
    console.error("[charge-first] PORTONE_API_SECRET 미설정");
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  // 1. 세션 인증
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2. profiles 조회 (service_role — billing_key 컬럼 읽기 위해)
  const admin = createAdminClient();
  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("id, email, plan, billing_key")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) {
    console.error("[charge-first] profile_not_found", {
      userId: user.id,
      err: profileErr?.message,
    });
    return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  }

  if (!profile.billing_key) {
    return NextResponse.json({ error: "no_billing_key" }, { status: 400 });
  }
  if (profile.plan === "pro") {
    return NextResponse.json({ ok: true, alreadyPro: true });
  }

  // 3. PortOne V2 결제 API 호출
  const now = new Date();
  const paymentId = makePaymentId(user.id, now);
  const customerName =
    user.user_metadata?.full_name || user.user_metadata?.name || "MATCHLAB 회원";

  const trace: string[] = [];
  trace.push(`paymentId=${paymentId}`);

  let portoneRes: Response;
  try {
    portoneRes = await fetch(
      `${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}/billing-key`,
      {
        method: "POST",
        headers: {
          Authorization: `PortOne ${apiSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billingKey: profile.billing_key,
          orderName: ORDER_NAME,
          customer: {
            id: user.id,
            email: profile.email ?? user.email ?? undefined,
            phoneNumber: "01000000000",
            name: { full: customerName },
          },
          amount: { total: PRO_PRICE_KRW },
          currency: "KRW",
          productCount: 1,
        }),
      },
    );
  } catch (e: any) {
    trace.push(`fetch_failed=${e?.message ?? String(e)}`);
    console.error("[charge-first] portone_fetch_failed", { trace });
    return NextResponse.json({ error: "portone_unreachable", trace }, { status: 502 });
  }

  const portoneJson = await portoneRes.json().catch(() => ({}));
  trace.push(`portoneStatus=${portoneRes.status}`);

  if (!portoneRes.ok) {
    // AlreadyPaidError → 같은 paymentId로 이미 결제 완료된 케이스. plan='pro' 전환은 진행
    const errType = portoneJson?.type;
    trace.push(`errorType=${errType ?? "unknown"}`);
    if (errType !== "ALREADY_PAID") {
      console.error("[charge-first] portone_error", { trace, portoneJson });
      return NextResponse.json(
        { error: "payment_failed", detail: portoneJson, trace },
        { status: 402 },
      );
    }
    trace.push("treating_already_paid_as_success");
  }

  // 4. plan 전환
  const startedAt = now.toISOString();
  const nextBillingAt = addDays(now, 30).toISOString();

  const { error: updateErr } = await admin
    .from("profiles")
    .update({
      plan: "pro",
      subscription_started_at: startedAt,
      next_billing_at: nextBillingAt,
      billing_retry_count: 0,
    })
    .eq("id", user.id);

  if (updateErr) {
    trace.push(`update_failed=${updateErr.message}`);
    console.error("[charge-first] profile_update_failed", { trace });
    // 결제는 통과했는데 DB만 실패한 케이스 → 수동 복구 필요. 명시적으로 알려줌
    return NextResponse.json(
      { error: "paid_but_db_update_failed", paymentId, detail: updateErr.message, trace },
      { status: 500 },
    );
  }

  trace.push("plan_pro_activated");
  console.log("[charge-first] success", { userId: user.id, paymentId });

  return NextResponse.json({
    ok: true,
    paymentId,
    nextBillingAt,
    trace,
  });
}
