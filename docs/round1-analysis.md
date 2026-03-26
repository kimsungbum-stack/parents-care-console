# Round 1: 전체 분석 토론 결과

## 참여자
- product-lead (PM)
- senior-frontend (프론트엔드)
- senior-backend (백엔드)
- ai-engineer (AI)
- growth-marketer (UX 라이팅/전환)

## 핵심 문제점 (합의)

### [심각] 보안 — 대시보드/파이프라인 raw fetch
- page.tsx에서 NEXT_PUBLIC 키로 Supabase REST 직접 호출
- 서버 사이드에서 createServerClient 사용으로 변경 필요
- 담당: senior-backend

### [심각] 모바일 UX 붕괴
- 대시보드 테이블이 모바일에서 수평 스크롤 필요 (카드형 전환 필요)
- 칸반 보드가 터치 디바이스에서 드래그 불가
- 하단 탭바에 6개 아이템 — 터치 타겟 부족
- 담당: senior-frontend

### [심각] 용어가 센터장에게 안 맞음
- "파이프라인" → "진행 현황"
- "1차답장" → "첫 연락 완료" (UI 레이블만, DB값 유지)
- "소개대기" → "설명 완료" (UI 레이블만, DB값 유지)
- CTA 문구 개선
- 담당: growth-marketer

### [중요] 미완성 UI
- 설정 페이지 "준비 중" 섹션 2개 — 의미있는 내용으로 채우거나 제거
- 요금제 CTA가 "#" — 결제 없으면 카카오톡 문의 연결
- "보류" 상태가 칸반에서 누락
- CSV 내보내기 API는 있지만 UI 없음
- 케이스 삭제 기능 없음
- 담당: product-lead + senior-frontend

### [개선] AI 기능
- 상담 분석(consultation) 결과가 state에만 저장, 새로고침 시 소실
- 후순위로 처리 (recording 분석은 이미 DB 저장됨)
- 담당: ai-engineer

### [개선] 코드 품질
- Sidebar에 inline style과 tailwind 혼용
- lead-list.tsx에서 mock-data import 잘못됨
- 에러 처리 일관성 부족
- 담당: senior-frontend + senior-backend

## 다음 단계
Round 2에서 구체적 기능 제안 + 우선순위 결정
