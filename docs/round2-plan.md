# Round 2: 작업 계획

## 최종 작업 목록 (우선순위순)

### 1. [용어 개선] UI 레이블 전면 교체
- "파이프라인" → "진행 현황"
- "1차답장" → "첫 연락 완료" (DB값 유지, UI만)
- "소개대기" → "설명 완료" (DB값 유지, UI만)
- 사이드바, 하단 탭, 칸반, 상태 배지, 필터 등 전체 반영
- 담당: growth-marketer + senior-frontend
- 예상: 소형

### 2. [모바일] 하단 탭바 4개로 축소
- 현재 6개 → 홈, 진행 현황, 케이스 목록, 신규 등록 (4개)
- 요금제, 설정은 데스크탑 사이드바에서만 접근
- 담당: senior-frontend
- 예상: 소형

### 3. [모바일] 대시보드 케이스 테이블 → 카드형 전환
- 모바일에서 <table> 대신 카드 리스트
- 데스크탑은 테이블 유지
- 담당: senior-frontend
- 예상: 중형

### 4. [보안] 대시보드/파이프라인 fetch → 서버 클라이언트
- raw Supabase REST fetch 제거
- createServerClient 기반 쿼리로 교체
- 담당: senior-backend
- 예상: 중형

### 5. [기능] 칸반 "보류" 컬럼 추가 + 모바일 상태변경
- "보류" 컬럼을 칸반에 추가
- 모바일: 카드 탭/클릭 시 상태 변경 드롭다운
- 담당: senior-frontend + senior-backend
- 예상: 중형

### 6. [UX] 빈 상태 메시지 전면 개선
- 칸반 빈 컬럼: "없음" → 구체적 안내
- 대시보드 빈 상태: 다음 행동 유도
- 케이스 목록 빈 상태: 검색/필터 조건 안내
- 담당: growth-marketer + senior-frontend
- 예상: 소형

### 7. [기능] 설정 페이지 개선
- "준비 중" 제거
- 센터 정보: 센터명 표시 (온보딩에서 등록한 값)
- 알림 설정: 간단한 ON/OFF (향후 확장용 기반)
- 담당: senior-frontend + senior-backend
- 예상: 중형

### 8. [전환] 요금제 CTA 연결
- 스탠다드/프리미엄 CTA href="#" → 카카오톡 채널 상담 연결
- CTA 문구: "가장 많이 선택해요" → "스탠다드 시작하기"
- "문의하기" → "프리미엄 상담받기"
- 담당: growth-marketer
- 예상: 소형

### 9. [기능] 케이스 삭제
- 케이스 상세에서 삭제 버튼
- 확인 모달: "정말 삭제하시겠어요?"
- API: DELETE /api/leads/[leadId]
- 담당: senior-backend + senior-frontend
- 예상: 중형

### 10. [기능] CSV 내보내기 UI
- 설정 또는 케이스 목록에서 "내보내기" 버튼
- /api/v1/export 연결
- 담당: senior-frontend
- 예상: 소형

## 원칙
- 한 번에 하나씩 구현 → product-lead OK → 다음
- 매 완료 후 docs/progress.md + git commit
- 기존 기능 완성 > 새 기능 추가
