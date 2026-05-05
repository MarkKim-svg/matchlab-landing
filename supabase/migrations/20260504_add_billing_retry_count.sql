-- 20260504_add_billing_retry_count.sql
-- 결제 시스템 2세션: 실패 재시도 카운트 컬럼 추가
-- 멱등 실행 가능

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS billing_retry_count integer NOT NULL DEFAULT 0;

-- column-level GRANT 갱신 — billing_retry_count를 authenticated에 SELECT 허용
-- (billing_key는 여전히 service_role 전용)
REVOKE ALL ON public.profiles FROM authenticated, anon;

GRANT SELECT
  (id, nickname, avatar_url, plan, created_at, updated_at, email, role,
   subscription_started_at, next_billing_at, billing_retry_count)
  ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;
