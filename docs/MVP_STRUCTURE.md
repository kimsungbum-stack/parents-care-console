# 부모안심90 운영 콘솔 - 페이지/컴포넌트 구조 제안

## 1) 페이지 구조 (Next.js App Router 기준)

### 공통
- `/login`
  - 내부 운영자 로그인
- `/`
  - 대시보드(오늘 연락 필요 리드, 상태별 카운트, 최근 상담)

### 리드 관리
- `/leads`
  - 리드 목록 + 검색 + 필터 + 정렬
  - 우측 상단 `리드 등록` 버튼
- `/leads/new`
  - 리드 등록 폼
- `/leads/[leadId]`
  - 리드 상세 허브 페이지
  - 탭 형태:
    - `개요` (기본 정보, 현재 상태, 다음 연락일)
    - `상담기록` (목록 + 작성)
    - `요약리포트` (초안/최종본 편집)
    - `운영메모` (목록 + 작성)

## 2) 컴포넌트 구조 제안

### 레이아웃
- `AppShell`
  - 상단 바(서비스명, 빠른 검색)
  - 사이드 메뉴(대시보드, 리드)
- `PageHeader`
  - 제목, 보조 설명, 우측 액션 버튼

### 리드 목록
- `LeadFilterBar`
  - 검색 인풋(이름/연락처)
  - 상태 필터
  - 다음 연락일 필터(지남/오늘/예정)
- `LeadTable`
  - 리드 목록 테이블
- `LeadStatusBadge`
  - 상태 라벨 표시
- `ContactDueChip`
  - 다음 연락일 경과 여부 표시

### 리드 등록/상세
- `LeadForm`
  - 기본 정보 입력/검증
- `LeadSummaryCard`
  - 핵심 정보 스냅샷 (상태, 연락일, 최근 상담)
- `LeadStatusSelect`
  - 상태 변경 컨트롤
- `NextContactDatePicker`
  - 다음 연락일 수정

### 상담 기록
- `ConsultationList`
- `ConsultationForm`
  - 상담 일시/채널/요약/상세 메모

### 보호자 요약 리포트
- `GuardianReportEditor`
  - 리포트 본문 편집, 저장 시각 표시

### 운영 메모
- `OpsNoteList`
- `OpsNoteForm`

## 3) 상태 관리 설계
- UI 표시값:
  - `신규`
  - `1차답장`
  - `인터뷰예정`
  - `인터뷰완료`
  - `소개대기`
  - `보류`
- 내부 enum 제안값:
  - `new`
  - `first_reply`
  - `interview_scheduled`
  - `interview_completed`
  - `waiting_introduction`
  - `on_hold`

## 4) 폴더 구조 제안
```txt
src/
  app/
    (auth)/
      login/page.tsx
    (dashboard)/
      page.tsx
      leads/
        page.tsx
        new/page.tsx
        [leadId]/page.tsx
    api/
      leads/route.ts
      consultations/route.ts
      reports/route.ts
      notes/route.ts
  components/
    layout/
    leads/
    consultations/
    reports/
    notes/
    ui/
  lib/
    supabase/
      client.ts
      server.ts
    validators/
      lead.ts
      consultation.ts
      report.ts
      note.ts
  types/
    db.ts
    lead.ts
```

## 5) MVP 구현 우선순위
1. `/leads`, `/leads/new`, `/leads/[leadId]` 먼저 구현
2. 상세에서 상태/다음 연락일 + 상담기록 입력 기능
3. 요약리포트/운영메모 탭 추가
4. 마지막에 대시보드 최소 버전 구성
