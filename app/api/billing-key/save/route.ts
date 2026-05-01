import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 클라이언트가 PortOne으로 빌링키 발급한 직후 호출. response.billingKey를 받아 본인 row에 저장.
// - 인증된 user.id 기준으로만 UPDATE → 다른 user 건드릴 수 없음
// - service_role 사용 (billing_key는 column-level GRANT로 authenticated 차단되어 있음)
// - webhook에 customer.id가 안 와서 우회로 채택한 패턴

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const billingKey = body?.billingKey;
  if (typeof billingKey !== "string" || !billingKey) {
    return NextResponse.json({ error: "missing_billing_key" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ billing_key: billingKey })
    .eq("id", user.id);

  if (error) {
    console.error("[billing-key/save] update failed", {
      userId: user.id,
      error: error.message,
    });
    return NextResponse.json(
      { error: "db_update_failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
