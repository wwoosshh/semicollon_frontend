import Link from 'next/link';
import { api } from '@/lib/api';
import type { PostSummary, RecruitInfo } from '@/lib/types';

// ─── Data Fetchers ────────────────────────────────────────────
async function fetchRecentPosts(): Promise<PostSummary[]> {
  try {
    const posts = await api<PostSummary[]>('/posts', { cache: 'no-store' });
    return posts.slice(0, 4);
  } catch {
    return [];
  }
}

async function fetchRecruitInfo(): Promise<RecruitInfo | null> {
  try {
    return await api<RecruitInfo>('/settings/recruit', { cache: 'no-store' });
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

const DOINGS = [
  {
    no: '01',
    title: '스터디',
    en: 'STUDY',
    body: '언어 하나를 정해 끝까지 파고듭니다. 매주 모여 서로의 코드를 읽고, 모르는 것을 모른다고 말하는 연습을 합니다.',
  },
  {
    no: '02',
    title: '프로젝트',
    en: 'PROJECT',
    body: '기획부터 배포까지, 작더라도 완결된 것을 만듭니다. 이 홈페이지도 부원들의 손으로 만들어졌습니다.',
  },
  {
    no: '03',
    title: '행사',
    en: 'EVENT',
    body: '해커톤, 세미나, 그리고 종강 회식. 코드 바깥에서 쌓이는 것들이 동아리를 오래 가게 만듭니다.',
  },
] as const;

// ─── 활자 조판 리빌: 글자 단위 스태거 ─────────────────────────
function TypesetLine({ text, offset }: { text: string; offset: number }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className="typeset-ch"
          style={{ ['--ch-i' as string]: offset + i }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </>
  );
}

const HEAD_L1 = '한 줄의 끝에서,';
const HEAD_L2 = '같이 다음 줄을 쓴다';

// ─── Page ─────────────────────────────────────────────────────
export default async function Home() {
  const [posts, recruit] = await Promise.all([fetchRecentPosts(), fetchRecruitInfo()]);
  const isRecruiting = recruit?.isRecruiting ?? false;

  return (
    <>
      <style>{`
        /* ── Hero: 비대칭 2단, 거대 명조 헤드라인 + 메타 칼럼 ── */
        .hero {
          position: relative;
          border-bottom: 1px solid var(--ink);
          overflow: hidden;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 62vh;
        }
        @media (min-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr 280px;
          }
        }
        .hero-main {
          padding: 4.5rem 0 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .hero-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          color: var(--vermilion);
          margin-bottom: 1.75rem;
        }
        .hero-title {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(2.6rem, 7.5vw, 5.25rem);
          line-height: 1.16;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0;
        }
        .hero-title .semi {
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--vermilion);
        }
        .hero-sub {
          margin-top: 1.75rem;
          max-width: 34rem;
          font-size: 1.0625rem;
          line-height: 1.85;
          color: var(--ink-soft);
        }
        .hero-cta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 2.5rem;
        }
        /* 우측 메타 칼럼 — 도서 판권면처럼 */
        .hero-meta {
          border-top: 1px solid var(--ink);
          display: flex;
          flex-direction: column;
          background: var(--paper);
        }
        @media (min-width: 900px) {
          .hero-meta {
            border-top: none;
            border-left: 1px solid var(--ink);
          }
        }
        .hero-meta-row {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.3rem;
          padding: 1.1rem 0 1.1rem;
          border-bottom: 1px solid var(--hairline-soft);
        }
        @media (min-width: 900px) {
          .hero-meta-row { padding-left: 1.5rem; }
          .hero-meta-row:last-child { border-bottom: none; }
        }
        .hero-meta-k {
          font-family: var(--font-mono);
          font-size: 0.66rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-faint);
        }
        .hero-meta-v {
          font-family: var(--font-mono);
          font-size: 0.92rem;
          color: var(--ink);
        }
        .hero-meta-v.live { color: var(--vermilion); }
        /* 배경의 거대한 세미콜론 — 우하단에 잘려 들어감 */
        .hero-glyph {
          position: absolute;
          right: -0.06em;
          bottom: -0.36em;
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(16rem, 36vw, 30rem);
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px var(--hairline);
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }
        @media (min-width: 900px) {
          .hero-glyph { right: 296px; }
        }
        .hero-main, .hero-meta { position: relative; z-index: 1; }
        /* 글리프 스크롤 패럴랙스 — 스크롤하면 천천히 가라앉는다 */
        @supports (animation-timeline: scroll()) {
          .hero-glyph {
            animation: glyph-drift linear both;
            animation-timeline: scroll(root);
            animation-range: 0px 900px;
          }
        }
        @keyframes glyph-drift {
          to { transform: translateY(110px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-glyph { animation: none; }
        }

        /* ── 섹션 공통 ── */
        .sec {
          border-bottom: 1px solid var(--ink);
        }
        .sec-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 0;
          border-bottom: 1px solid var(--hairline);
        }
        .sec-more {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink-soft);
          text-decoration: none;
          white-space: nowrap;
        }
        .sec-more:hover { color: var(--vermilion); }

        /* ── 01 우리가 하는 것: 세로 괘선으로 나뉜 3단 ── */
        .doing-grid {
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .doing-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .doing {
          padding: 2.25rem 0;
          border-bottom: 1px solid var(--hairline-soft);
          transition: background 160ms ease;
        }
        @media (min-width: 768px) {
          .doing {
            border-bottom: none;
            border-right: 1px solid var(--hairline);
            padding: 2.5rem 1.75rem;
          }
          .doing:first-child { padding-left: 0; }
          .doing:last-child { border-right: none; }
        }
        .doing-no {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          color: var(--vermilion);
        }
        .doing-title {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.55rem;
          margin: 0.875rem 0 0.2rem;
        }
        .doing-en {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          color: var(--ink-faint);
        }
        .doing-body {
          margin-top: 1.1rem;
          font-size: 0.95rem;
          line-height: 1.85;
        }

        /* ── 02 최근 소식: 색인 목록, 호버 시 반전 ── */
        .news-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: baseline;
          gap: 1.25rem;
          padding: 1.2rem 0.5rem;
          border-bottom: 1px solid var(--hairline);
          text-decoration: none;
          transition: background 140ms ease;
        }
        .news-row:hover { background: var(--ink); }
        .news-date {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--ink-faint);
        }
        .news-title {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 140ms ease;
        }
        .news-cat {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--vermilion);
          white-space: nowrap;
        }
        .news-row:hover .news-title { color: var(--paper); }
        .news-row:hover .news-date { color: rgba(246,244,238,0.5); }
        .news-empty {
          padding: 3rem 0;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--ink-faint);
        }

        /* ── 03 모집 배너 ── */
        .recruit-band {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.75rem;
          padding: 3.5rem 0;
        }
        @media (min-width: 768px) {
          .recruit-band {
            grid-template-columns: 1fr auto;
            align-items: center;
          }
        }
        .recruit-title {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(1.75rem, 4.5vw, 2.75rem);
          line-height: 1.3;
          margin: 0;
        }
        .recruit-note {
          margin-top: 0.875rem;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          letter-spacing: 0.04em;
        }
        .btn-onink {
          border-color: var(--paper);
          background: transparent;
          color: var(--paper);
        }
        .btn-onink:hover {
          background: var(--vermilion);
          border-color: var(--vermilion);
          color: #fff;
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <span className="hero-glyph" aria-hidden="true">;</span>
        <div className="container-page">
          <div className="hero-grid">
            <div className="hero-main">
              <p className="hero-eyebrow rise rise-1">{'// 프로그래밍 동아리, 세미콜론'}</p>
              <h1 className="hero-title" aria-label={`${HEAD_L1} ${HEAD_L2};`}>
                <span aria-hidden="true">
                  <TypesetLine text={HEAD_L1} offset={0} />
                  <br />
                  <TypesetLine text={HEAD_L2} offset={HEAD_L1.length} />
                  <span
                    className="semi typeset-caret"
                    style={{ ['--ch-i' as string]: HEAD_L1.length + HEAD_L2.length }}
                  >
                    ;
                  </span>
                </span>
              </h1>
              <p className="hero-sub rise rise-3">
                세미콜론은 함께 코드를 읽고, 만들고, 기록하는 사람들의 모임입니다.
                혼자였다면 미뤘을 공부를 같이 끝내는 것 — 그게 우리가 모이는 이유입니다.
              </p>
              <div className="hero-cta rise rise-4">
                <Link href="/recruit" className="btn btn-primary">
                  지원하기 →
                </Link>
                <Link href="/about" className="btn btn-ghost">
                  소개 읽기
                </Link>
              </div>
            </div>

            <aside className="hero-meta">
              <div className="hero-meta-row">
                <span className="hero-meta-k">Field</span>
                <span className="hero-meta-v">SOFTWARE</span>
              </div>
              <div className="hero-meta-row">
                <span className="hero-meta-k">Activity</span>
                <span className="hero-meta-v">스터디 / 프로젝트 / 행사</span>
              </div>
              <div className="hero-meta-row">
                <span className="hero-meta-k">Recruiting</span>
                <span className={`hero-meta-v${isRecruiting ? ' live' : ''}`}>
                  {isRecruiting ? '● OPEN' : '○ CLOSED'}
                </span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── 01 우리가 하는 것 ────────────────────────────────── */}
      <section className="sec">
        <div className="container-page">
          <div className="sec-head">
            <span className="section-label">
              <span className="no">01</span> 우리가 하는 것
            </span>
          </div>
          <div className="doing-grid">
            {DOINGS.map((d) => (
              <article key={d.no} className="doing vt-rise">
                <div className="doing-no">{d.no}</div>
                <h2 className="doing-title">{d.title}</h2>
                <div className="doing-en">{d.en}</div>
                <p className="doing-body">{d.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 02 최근 소식 ─────────────────────────────────────── */}
      <section className="sec">
        <div className="container-page">
          <div className="sec-head">
            <span className="section-label">
              <span className="no">02</span> 최근 소식
            </span>
            <Link href="/posts" className="sec-more">
              전체 보기 →
            </Link>
          </div>
          {posts.length > 0 ? (
            <div>
              {posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="news-row vt-rise">
                  <span className="news-date">{formatDate(post.created_at)}</span>
                  <span className="news-title">{post.title}</span>
                  <span className="news-cat">
                    {post.category === 'notice' ? 'NOTICE' : 'BLOG'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="news-empty">{'// 아직 게시된 소식이 없습니다'}</p>
          )}
        </div>
      </section>

      {/* ── 활자 티커 (인쇄 띠지) ────────────────────────────── */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((n) => (
            <div key={n} className="ticker-item">
              <span>
                SEMICOLLON<span className="tick-semi">;</span>
              </span>
              <span>STUDY</span>
              <span className="tick-semi">●</span>
              <span>PROJECT</span>
              <span className="tick-semi">●</span>
              <span>EVENT</span>
              <span className="tick-semi">●</span>
              <span>WE WRITE THE NEXT LINE TOGETHER</span>
              <span className="tick-semi">●</span>
              <span>한 줄의 끝에서, 같이 다음 줄을</span>
              <span className="tick-semi">●</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 03 모집 ──────────────────────────────────────────── */}
      <section className={isRecruiting ? 'ink-block' : undefined}>
        <div className="container-page">
          <div className="recruit-band">
            {isRecruiting ? (
              <>
                <div>
                  <h2 className="recruit-title">
                    지금, 새로운 부원을
                    <br />
                    기다리고 있습니다<span style={{ color: 'var(--vermilion)' }}>;</span>
                  </h2>
                  {recruit?.end && (
                    <p className="recruit-note" style={{ color: 'rgba(246,244,238,0.6)' }}>
                      DEADLINE — {formatDate(recruit.end)}
                    </p>
                  )}
                </div>
                <Link href="/recruit/apply" className="btn btn-onink">
                  지원서 작성 →
                </Link>
              </>
            ) : (
              <>
                <div>
                  <h2 className="recruit-title">
                    다음 모집을
                    <br />
                    준비하고 있습니다
                  </h2>
                  <p className="recruit-note" style={{ color: 'var(--ink-faint)' }}>
                    RECRUITING — CLOSED
                  </p>
                </div>
                <Link href="/about" className="btn btn-ghost">
                  동아리 알아보기
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
