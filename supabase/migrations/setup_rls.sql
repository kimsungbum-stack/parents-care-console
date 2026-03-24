-- =============================================================
-- 1. users 테이블 생성 (auth.users와 연결)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.users(organization_id);

-- =============================================================
-- 2. leads 테이블에 organization_id 컬럼 추가
-- =============================================================
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON public.leads(organization_id);

-- =============================================================
-- 3. leads RLS
-- =============================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own org leads" ON public.leads
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- =============================================================
-- 4. consultations RLS
-- =============================================================
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own org consultations" ON public.consultations
  FOR ALL USING (
    lead_id IN (
      SELECT id FROM public.leads WHERE organization_id = (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- =============================================================
-- 5. notes RLS
-- =============================================================
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own org notes" ON public.notes
  FOR ALL USING (
    lead_id IN (
      SELECT id FROM public.leads WHERE organization_id = (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- =============================================================
-- 6. reports RLS
-- =============================================================
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own org reports" ON public.reports
  FOR ALL USING (
    lead_id IN (
      SELECT id FROM public.leads WHERE organization_id = (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- =============================================================
-- 7. organizations RLS
-- =============================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own org" ON public.organizations
  FOR ALL USING (
    id = (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- =============================================================
-- 8. users RLS
-- =============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own record" ON public.users
  FOR ALL USING (id = auth.uid());
