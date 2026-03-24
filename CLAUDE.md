# 부모안심90 — 등록 전 영업관리 CRM

## 뭐하는 프로젝트?
장기요양기관(주간보호센터)이 보호자 문의를 놓치지 않게 해주는 관리 도구.
보호자가 전화하면 → AI가 자동으로 정보 저장 → 센터장이 대시보드에서 확인.

## 기술 스택
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (DB + 인증 + 파일저장)
- Vercel 배포
- Claude API (AI 상담 분석)

## 폴더 구조
src/app/ → 페이지들
src/components/ → 재사용 UI 조각들
src/lib/ → 유틸리티, API 클라이언트
src/types/ → 타입 정의

## 케이스 상태 흐름
신규 → 1차답장 → 인터뷰예정 → 인터뷰완료 → 소개대기

## 규칙
- UI는 한국어
- 모바일에서도 잘 보여야 함
- 센터장(비개발자)이 쓰는 도구라 직관적이어야 함
