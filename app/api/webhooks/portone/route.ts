import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// PortOne V2 webhook 라우트.
// - Standard Webhook (Svix) spec: webhook-id / webhook-timestamp / webhook-signature 헤더
// - 검증 실패 / 타임스탬프 drift 5분 초과 → 401
// - BillingKey.Issued / BillingKey.Ready: profiles.billing_key UPDATE (user_id 기준 덮어쓰기, idempotent)
// - plan 'pro' 전환 / 첫 결제 청구는 다음 세션 영역 (이번 세션은 안 건드림)

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TIMESTAMP_TOLERANCE_SEC = 60 * 5;

function verifySignature(
  webhookId: string,
  webhookTimestamp: string,
  body: string,
  signatureHeader: string,
  secret: string,
): boolean {
  // secret: "whsec_<base64>" 형식. 접두사 제거 후 base64 decode → HMAC 키 바이트
  const keyBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedPayload = `${webhookId}.${webhookTimestamp}.${body}`;
  const expected = crypto
    .createHmac("sha256", keyBytes)
    .update(signedPayload)
    .digest("base64");

  // 헤더에는 "v1,<base64> v1,<base64> ..." 형태로 여러 시그니처가 올 수 있음
  const signatures = signatureHeader
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter(Boolean);

  return signatures.some((sig) => {
    try {
      const a = Buffer.from(expected, "base64");
      const b = Buffer.from(sig, "base64");
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[portone webhook] PORTONE_WEBHOOK_SECRET 미설정");
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const webhookId = request.headers.get("webhook-id");
  const webhookTimestamp = request.headers.get("webhook-timestamp");
  const webhookSignature = request.headers.get("webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return NextResponse.json({ error: "missing_signature_headers" }, { status: 400 });
  }

  const ts = parseInt(webhookTimestamp, 10);
  if (!Number.isFinite(ts)) {
    return NextResponse.json({ error: "bad_timestamp" }, { status: 400 });
  }
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > TIMESTAMP_TOLERANCE_SEC) {
    return NextResponse.json({ error: "timestamp_drift" }, { status: 400 });
  }

  // raw body로 받기 (서명 검증용)
  const rawBody = await request.text();

  if (!verifySignature(webhookId, webhookTimestamp, rawBody, webhookSignature, secret)) {
    console.warn("[portone webhook] signature verification failed", { webhookId });
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const eventType: string | undefined = payload?.type;
  console.log("[portone webhook] verified event", { webhookId, type: eventType });
  console.log("[wh] payload type:", eventType);
  console.log("[wh] payload full:", JSON.stringify(payload).slice(0, 2000));

  // BillingKey.Issued / BillingKey.Ready: 빌링키 발급 완료 → profiles.billing_key 저장
  // 카카오페이 V2가 Ready에 키 싣는 케이스 대응. UPDATE라 idempotent (둘 다 와도 같은 키 덮어쓰기)
  if (eventType === "BillingKey.Issued" || eventType === "BillingKey.Ready") {
    console.log("[wh] entering billing key branch");

    // V2 페이로드 변형 대비: 여러 path에서 추출
    const billingKey: string | undefined =
      payload?.data?.billingKey ??
      payload?.data?.billingKeyInfo?.billingKey;

    const userId: string | undefined =
      payload?.data?.customer?.customerId ??
      payload?.data?.billingKeyInfo?.customer?.customerId ??
      payload?.customer?.customerId;

    console.log("[wh] extracted", {
      hasKey: !!billingKey,
      hasUser: !!userId,
      userIdSample: userId?.slice(0, 8),
      payloadKeys: Object.keys(payload ?? {}),
      dataKeys: payload?.data ? Object.keys(payload.data) : null,
    });

    if (!billingKey || !userId) {
      console.error("[wh] missing fields", {
        hasKey: !!billingKey,
        hasUser: !!userId,
        keys: Object.keys(payload?.data ?? {}),
      });
      return NextResponse.json({ received: true, skipped: "missing_fields" });
    }

    let admin;
    try {
      admin = createAdminClient();
      console.log("[wh] admin client OK");
    } catch (e: any) {
      console.error("[wh] admin client FAILED", e?.message ?? String(e));
      return NextResponse.json({ error: "admin_init_failed" }, { status: 500 });
    }

    const { error } = await admin
      .from("profiles")
      .update({ billing_key: billingKey })
      .eq("id", userId);

    if (error) {
      console.error("[wh] profiles update 실패", { userId, error: error.message });
      return NextResponse.json({ error: "db_update_failed" }, { status: 500 });
    }

    console.log("[wh] billing_key saved", { userId, eventType });
    return NextResponse.json({ received: true, processed: "billing_key_saved" });
  }

  // 기타 이벤트 (Transaction.Paid, Transaction.Cancelled 등)는 다음 세션 영역.
  // 일단 200으로 응답해서 포트원 재시도 방지.
  return NextResponse.json({ received: true, skipped: "not_handled_yet" });
}
