-- 20260501_extend_profiles_for_billing.sql
-- 기존 public.profiles에 구독 결제용 컬럼 3개 추가 + billing_key 보호 + plan CHECK
-- 기존 컬럼(id, nickname, avatar_url, plan, created_at, updated_at, email, role)
-- 및 데이터 보존. 멱등 실행 가능.

-- 1. 누락 컬럼 추가 (멱등)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS billing_key             text,
  ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_billing_at         timestamptz;

-- 2. plan CHECK 제약
--    기존 값 분포: pro 26 / free 2 → 'cancelled'까지 허용해도 안전
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free','pro','cancelled'));

-- 3. updated_at 자동 갱신 트리거 (멱등)
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_set_updated_at();

-- 4. auth.users INSERT → profiles row 자동 생성 트리거 (멱등)
CREATE OR REPLACE FUNCTION public.tg_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_handle_new_user();

-- 5. RLS 활성화 (이미 켜져있으면 무시)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. 본인 row SELECT 정책 (멱등)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 7. Column-level GRANT — billing_key 보호
--    기존 GRANT 회수 후 billing_key 제외하고 SELECT 부여
REVOKE ALL ON public.profiles FROM authenticated, anon;

GRANT SELECT
  (id, nickname, avatar_url, plan, created_at, updated_at, email, role,
   subscription_started_at, next_billing_at)
  ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;

-- 8. 기존 auth.users 백필 (멱등, 이미 28/28이라 추가 INSERT 없을 가능성)
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
