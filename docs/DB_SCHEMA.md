# 부모안심90 운영 콘솔 - DB 스키마 초안 요약

상세 SQL: `docs/DB_SCHEMA_DRAFT.sql`

## 핵심 테이블

1. `leads`
- 리드 기본 정보
- 현재 상태(`status`), 상태 갱신 시각(`status_updated_at`)
- 다음 연락일(`next_contact_date`)

2. `consultations`
- 리드별 상담 기록
- 상담 시각/채널/요약/상세 메모

3. `guardian_reports`
- 리드별 보호자 요약 리포트 (1:1)
- 본문 + 최종본 여부

4. `lead_notes`
- 리드별 운영/파트너 메모
- `scope`로 `operator`/`partner` 구분

5. `lead_status_logs` (선택적이지만 포함 권장)
- 상태 변경 이력 보관

## 상태값 매핑
- `new` = 신규
- `first_reply` = 1차답장
- `interview_scheduled` = 인터뷰예정
- `interview_completed` = 인터뷰완료
- `waiting_introduction` = 소개대기
- `on_hold` = 보류

## 관계
- `leads` 1 : N `consultations`
- `leads` 1 : 1 `guardian_reports`
- `leads` 1 : N `lead_notes`
- `leads` 1 : N `lead_status_logs`
