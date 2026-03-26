-- Sprint 3: 알림 센터 + AI 분석 쿼터 + 다중 사용자 역할

-- 1. 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('contact_due', 'stale_lead', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_org_unread
  ON notifications(organization_id, is_read, created_at DESC);

-- 2. AI 분석 사용량 컬럼 추가
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS ai_analysis_count_this_month INTEGER NOT NULL DEFAULT 0;

-- 3. 초대 테이블
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- 4. users 테이블에 email 컬럼 추가 (초대 매칭용)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 5. RLS 정책 (notifications)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can read own notifications"
  ON notifications FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "org members can update own notifications"
  ON notifications FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- 6. RLS 정책 (invitations)
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org admins can manage invitations"
  ON invitations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
