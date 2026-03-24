-- consultations 테이블에 AI 분석 결과 컬럼 추가
ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT NULL;

-- 인덱스 추가 (ai_analysis로 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_consultations_ai_analysis
ON consultations USING GIN (ai_analysis);

COMMENT ON COLUMN consultations.ai_analysis IS 'Claude AI 상담 분석 결과 (ConsultationAnalysis 타입)';
