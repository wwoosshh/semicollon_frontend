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
| `/` | 메인 (활자 조판 히어로 → 활동 소개 → 최근 소식 → 티커 → 모집 배너) |
| `/about` | 동아리 소개 — 연혁·운영진·FAQ는 관리자 페이지에서 수정 (API 연동) |
| `/activities`, `/activities/[id]` | 활동 아카이브 (유형 필터, 이미지 갤러리) |
| `/posts`, `/posts/[id]`, `/posts/new` | 게시판 (부원 공개 글, 댓글, 글쓰기·이미지 첨부) |
| `/calendar` | 일정 — 월 달력 + 일정 오버레이 |
| `/recruit`, `/recruit/apply` | 모집 안내·지원서 (모집 기간에만 제출 가능) |
| `/login`, `/signup` | 로그인 / 초대 코드 가입 |
| `/admin` | 관리자 — 탭 7개: 지원자 / 모집 설정 / 초대 코드 / 소개 / 활동 / 부원 / 일정 |

## 디자인·모션 시스템

"기술 동아리의 인쇄물" — 종이(#f6f4ee)·잉크(#1c1a15)·버밀리온(#d23b18) 단일 스팟, Noto Serif KR(헤드라인) + Pretendard(본문) + IBM Plex Mono(라벨). 토큰은 `src/app/globals.css`. 모션: 활자 조판 히어로, CSS 스크롤 구동 리빌(.vt-rise), 잉크 스와이프 버튼, 타자기 로딩(.loading-line) — 전부 CSS 전용, `prefers-reduced-motion` 대응. 브랜드 에셋(파비콘/OG)은 `scripts/generate-brand.mjs`로 재생성.

## 시각 회귀 검증

```
npm run build
npx next start -p 3100   # 별도 터미널
node scripts/screenshot.mjs
```

`screenshots/`에 전 페이지 × 모바일/데스크톱 스크린샷이 생성된다 (reducedMotion 모드 — 레이아웃 검증용).

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
