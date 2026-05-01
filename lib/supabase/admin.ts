import { createClient } from "@supabase/supabase-js";

// service_role 클라이언트. RLS bypass + 모든 컬럼(billing_key 포함) 접근 가능.
// webhook / cron 등 server-side 라우트에서만 import. 절대 클라이언트 번들 X.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client 초기화 실패: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 미설정",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
