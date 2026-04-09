# 부모안심90 운영 콘솔

장기요양기관(주간보호센터)이 보호자 문의를 놓치지 않도록 돕는 **등록 전 영업관리 CRM**.
보호자 전화 → AI가 상담 내용을 분석/저장 → 센터장이 대시보드에서 후속 대응을 관리합니다.

## 주요 기능

- **리드 관리**: 신규 리드 등록, 검색/필터, 상태별 파이프라인 관리
- **케이스 상태 흐름**: `신규` → `1차답장` → `인터뷰예정` → `인터뷰완료` → `소개대기` (+ `보류`)
- **AI 상담 분석**: Claude로 상담 내용 자동 추출 (보호자명, 상황 요약, 긴급도)
- **녹음 전사**: OpenAI Whisper로 상담 녹음 → 텍스트 변환 → AI 분석 파이프라인
- **보호자 요약 리포트**: AI 생성 초안 기반 리포트 작성/수정
- **대시보드**: 상태별 퍼널, 예정된 연락, 알림 센터
- **다중 사용자 / 권한**: 역할 기반 접근 제어, AI 사용량 쿼터
- **요금제**: 플랜별 사용량 제한

## 기술 스택

- **프레임워크**: Next.js 16 (App Router) + React 19 + TypeScript
- **스타일**: Tailwind CSS v4
- **백엔드**: Supabase (Postgres + Auth + Storage, RLS)
- **AI**: Anthropic Claude (`claude-sonnet-4-6`) + OpenAI Whisper
- **차트**: Recharts
- **배포**: Vercel

## 폴더 구조

```
src/
├── app/              # Next.js App Router 페이지
│   ├── api/          # Route Handlers (AI, 인증, 알림 등)
│   ├── leads/        # 리드 목록/상세/등록
│   ├── pipeline/     # 파이프라인 보드
│   ├── settings/     # 설정
│   └── pricing/      # 요금제
├── components/       # 재사용 UI 컴포넌트
├── lib/
│   ├── ai/           # Claude/Whisper 클라이언트 + 프롬프트
│   ├── queries/      # Supabase 조회 함수 (서버)
│   ├── mutations/    # Supabase 쓰기 함수
│   ├── mappers/      # DB row ↔ 도메인 모델 변환
│   ├── forms/        # 폼 스키마/검증
│   ├── plans/        # 요금제 정의
│   └── supabase/     # Supabase 클라이언트 (client/server/plain)
└── types/            # 도메인 타입 + Supabase 자동 생성 타입
```

## 로컬 개발

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수

`.env.local`을 생성하고 다음 키를 설정하세요.

```
NEXT_PUBLIC_SUPABASE_URL=<supabase project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

ANTHROPIC_API_KEY=<anthropic api key>
OPENAI_API_KEY=<openai api key>
```

### 3. DB 마이그레이션

[supabase/migrations/](supabase/migrations/)의 SQL 파일을 순서대로 Supabase 프로젝트에 적용하세요.
기본 스키마는 [supabase/schema.sql](supabase/schema.sql) 참고.

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |

## 배포

Vercel에 연결해 `main` 브랜치 푸시 시 자동 배포됩니다.
배포 전 환경 변수가 Vercel 프로젝트 설정에 등록돼 있어야 합니다.

## 문서

- [PRD.md](PRD.md) — MVP 제품 요구사항 (초기 스코프 기록)
- [CLAUDE.md](CLAUDE.md) — 프로젝트 요약 및 AI 협업 규칙
- [docs/](docs/) — 추가 설계/운영 문서

## 사용자 관점

이 도구는 **센터장(비개발자)**이 매일 사용하는 도구입니다.
UI는 한국어, 모바일에서도 잘 보여야 하며, 직관성을 최우선으로 합니다.
