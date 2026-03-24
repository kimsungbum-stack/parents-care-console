-- organizations 테이블에 사용량 추적 컬럼 추가
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS leads_count_this_month INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_reset_at TIMESTAMPTZ DEFAULT NOW();

-- plan 컬럼의 CHECK 제약 조건을 free/standard/premium으로 변경
-- (기존 basic → free 마이그레이션)
UPDATE organizations SET plan = 'free' WHERE plan = 'basic';
