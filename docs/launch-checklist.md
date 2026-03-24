# 부모안심90 출시 전 체크리스트

## 페이지 완성 여부
- [x] /login -- 로그인 페이지
- [x] /signup -- 불필요 (구글 OAuth로 가입+로그인 통합, /login에서 처리)
- [x] / (대시보드)
- [x] /leads -- 케이스 목록
- [x] /leads/new -- 신규 케이스 등록
- [x] /leads/[leadId] -- 케이스 상세 (라우트 파라미터: leadId)
- [x] /pipeline -- 파이프라인
- [x] /pricing -- 요금제
- [x] /settings -- 설정 (사이드바에 링크 없음, 직접 접근만 가능)

## 사이드바 링크 점검
- [x] / -- 대시보드
- [x] /pipeline -- 파이프라인
- [x] /leads -- 케이스 목록
- [x] /leads/new -- 신규 케이스
- [x] /pricing -- 요금제
- [ ] /settings -- 사이드바에 미포함 (추가 검토 필요)

## 기능 동작 여부
- [ ] 구글 OAuth 가입/로그인 -> 기관 생성 -> 대시보드 이동
- [ ] 케이스 등록 (무료 15건 제한 포함)
- [ ] 케이스 상태 변경 (파이프라인 드래그)
- [ ] 다음 연락일 설정
- [ ] AI 직접 입력 분석 (데모 모드)
- [ ] 사용량 배너 표시
- [ ] 온보딩 가이드 (첫 로그인)

## 보안
- [ ] RLS 설정 -- 타 기관 데이터 격리
- [ ] 미인증 접근 차단 (/login 리다이렉트)
- [ ] 환경변수 .env.local에 민감 정보 없음 (Git 제외 확인)

## Supabase 설정
- [ ] 마이그레이션 전체 적용
  - [x] add_recording_fields.sql (파일 존재 확인)
  - [x] add_plan_and_usage.sql (파일 존재 확인)
  - [x] add_ai_analysis_to_consultations.sql (파일 존재 확인)
  - [x] add_status_history.sql (파일 존재 확인)
- [ ] RLS 정책 활성화
- [ ] Storage 'recordings' 버킷 생성 (선택)

## 환경변수 필요 목록
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- ANTHROPIC_API_KEY (AI 분석, 없으면 데모 모드)
- OPENAI_API_KEY (녹음 변환, 없으면 직접 입력 사용)

## 파일럿 전 준비사항
- [ ] 테스트 계정 생성
- [ ] 샘플 케이스 5건 등록
- [ ] 모바일에서 주요 흐름 테스트

## 알려진 제한사항
- 녹음 업로드는 OPENAI_API_KEY 필요
- AI 분석은 ANTHROPIC_API_KEY 없어도 데모 모드로 작동

## 발견된 이슈
1. ~~/signup 페이지 미존재~~ -- 해소됨. 구글 OAuth로 가입+로그인 통합.
2. **/settings 사이드바 미연결** -- 설정 페이지는 존재하지만 사이드바 네비게이션에 링크가 없어 사용자가 접근할 수 없음. (frontend-dev에게 전달 완료)
