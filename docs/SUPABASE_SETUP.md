# Supabase 연결 준비

## 1. 필요한 환경변수
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`.env.example`를 복사해 `.env.local`로 만들고 값을 채웁니다.

## 2. 패키지
- `@supabase/supabase-js`
- `@supabase/ssr`

현재 프로젝트에는 이미 추가되어 있습니다.

## 3. 스키마 적용 순서
1. Supabase 프로젝트 생성
2. SQL Editor 열기
3. `supabase/schema.sql` 내용 실행
4. `.env.local`에 URL과 anon key 입력

## 4. 현재 준비된 파일
- `src/lib/supabase/client.ts`: 브라우저용 Supabase client 생성
- `src/lib/supabase/server.ts`: 서버 컴포넌트용 Supabase client 생성
- `src/types/supabase.ts`: 현재 MVP 스키마 기준 TypeScript 타입
- `src/types/domain.ts`: 화면/목업 데이터와 연결되는 도메인 타입

## 5. 다음 연결 단계
- mock data를 유지한 상태에서 조회 로직부터 Supabase로 교체
- 이후 생성/수정 액션을 단계적으로 연결
