# semicollon-frontend

세미콜론 동아리 홈페이지 프론트엔드 (Next.js + Tailwind CSS + Supabase Auth).

- 백엔드: https://github.com/wwoosshh/semicollon_backend (NestJS, Railway)
- DB: https://github.com/wwoosshh/semicollon_db (Supabase)

## 개발

```
npm install
```

`.env.example`을 `.env.local`로 복사하고 값을 채운다:

| 키 | 설명 |
|---|---|
| `NEXT_PUBLIC_API_URL` | 백엔드 주소 — 로컬 백엔드는 `http://localhost:4000`, 배포 백엔드는 `https://semicollonbackend-production.up.railway.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable(anon) key |

- `npm run dev` — 개발 서버 (http://localhost:3000)
- `npx jest` — 테스트 (지원서 폼·관리자 대시보드)
- `npm run build` — 프로덕션 빌드

## 페이지 구성

| 경로 | 설명 |
|---|---|
| `/` | 메인 (스토리형: 히어로 → 활동 소개 → 최근 소식 → 모집 배너) |
| `/about` | 동아리 소개 (비전·연혁·운영진·FAQ — 페이지 상단 상수 배열 수정으로 내용 변경) |
| `/activities`, `/activities/[id]` | 활동 아카이브 (유형 필터) |
| `/posts`, `/posts/[id]`, `/posts/new` | 게시판 (부원 로그인 시 부원 공개 글 노출, 글쓰기) |
| `/recruit`, `/recruit/apply` | 모집 안내·지원서 (모집 기간에만 제출 가능) |
| `/login`, `/signup` | 로그인 / 초대 코드 가입 |
| `/admin` | 관리자 (지원자 관리·모집 기간·초대 코드) |

## Vercel 배포

1. Vercel에서 이 GitHub 저장소(`semicollon_frontend`)를 Import — Next.js 자동 감지, 추가 설정 불필요
2. **Environment Variables**에 위 3개 키 설정 (`NEXT_PUBLIC_API_URL`은 Railway 공개 주소로)
3. 배포 후 발급된 Vercel 도메인(예: `https://semicollon.vercel.app`)을 **백엔드 Railway Variables의 `CORS_ORIGIN`에 추가** — 쉼표로 여러 origin 지정 가능:
   ```
   CORS_ORIGIN=http://localhost:3000,https://semicollon.vercel.app
   ```
   설정 후 Railway가 재배포되어야 적용된다.

## 디자인

클린 모던 라이트 — 화이트 베이스, 인디고(#4f46e5) 단일 포인트, Pretendard + JetBrains Mono. 디자인 토큰은 `src/app/globals.css`의 CSS 변수로 관리한다.
