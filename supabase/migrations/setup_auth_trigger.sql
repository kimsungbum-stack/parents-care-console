-- =============================================================
-- 회원가입 시 organizations + users 테이블 자동 생성 트리거
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- organizations 테이블에 새 기관 생성
  INSERT INTO public.organizations (name, plan)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'organization_name', '내 센터'),
    'free'
  )
  RETURNING id INTO new_org_id;

  -- users 테이블에 사용자 레코드 생성
  INSERT INTO public.users (id, organization_id, role)
  VALUES (NEW.id, new_org_id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 제거 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
