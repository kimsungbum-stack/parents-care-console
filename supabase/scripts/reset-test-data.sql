-- 테스트 데이터 리셋 스크립트 (주의: 전체 삭제)
-- 실행 전 백업 권장

TRUNCATE TABLE consultations CASCADE;
TRUNCATE TABLE notes CASCADE;
TRUNCATE TABLE reports CASCADE;
DELETE FROM leads;
UPDATE organizations SET leads_count_this_month = 0;
