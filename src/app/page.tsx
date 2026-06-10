import Link from 'next/link';
import { api } from '@/lib/api';
import type { PostSummary, RecruitInfo } from '@/lib/types';

// ─── Data Fetchers ────────────────────────────────────────────
async function fetchRecentPosts(): Promise<PostSummary[]> {
  try {
    const posts = await api<PostSummary[]>('/posts', { cache: 'no-store' });
    return posts.slice(0, 3);
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
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function categoryLabel(cat: PostSummary['category']): string {
  return cat === 'notice' ? '공지' : '블로그';
}

// ─── SVG Icons ────────────────────────────────────────────────
function IconStudy() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconProject() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconEvent() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default async function Home() {
  const [posts, recruit] = await Promise.all([fetchRecentPosts(), fetchRecruitInfo()]);

  return (
    <>
      <style>{`
        /* ── Hero ── */
        .hero {
          position: relative;
          overflow: hidden;
          background: var(--background);
          padding: 6rem 1.25rem 5rem;
        }
        @media (min-width: 640px) {
          .hero { padding: 7rem 2rem 6rem; }
        }
        @media (min-width: 1024px) {
          .hero { padding: 8rem 2.5rem 7rem; }
        }
        .hero-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border-soft) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%);
          pointer-events: none;
        }
        .hero-content {
          position: relative;
          max-width: 720px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.3125rem 0.875rem;
          border-radius: 999px;
          background: var(--accent-light);
          color: var(--accent);
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          margin-bottom: 1.75rem;
          border: 1px solid var(--accent-muted);
        }
        .hero-badge-mono {
          font-family: var(--font-mono);
          font-size: 1.1em;
          line-height: 1;
        }
        .hero-h1 {
          font-size: clamp(2.375rem, 5.5vw, 3.75rem);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.12;
          color: var(--foreground);
          margin: 0 0 1.5rem;
        }
        .hero-h1-accent {
          color: var(--accent);
          position: relative;
          display: inline-block;
        }
        .hero-subtitle {
          font-size: 1.125rem;
          color: var(--text-muted);
          line-height: 1.8;
          margin: 0 0 2.25rem;
          max-width: 540px;
        }
        .hero-cta {
          display: flex;
          gap: 0.875rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .hero-meta {
          margin-top: 3.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .hero-stat {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        .hero-stat-num {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 0.8125rem;
          color: var(--text-subtle);
          letter-spacing: 0.01em;
        }
        .hero-stat-divider {
          width: 1px;
          height: 2.5rem;
          background: var(--border);
          flex-shrink: 0;
        }

        /* ── Section commons ── */
        .section {
          padding: 5rem 1.25rem;
        }
        @media (min-width: 640px) {
          .section { padding: 5rem 2rem; }
        }
        @media (min-width: 1024px) {
          .section { padding: 6rem 2.5rem; }
        }
        .section-alt {
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 0.875rem;
        }
        .section-label::before {
          content: '';
          display: block;
          width: 1.5rem;
          height: 1.5px;
          background: var(--accent);
          border-radius: 1px;
        }
        .section-h2 {
          font-size: clamp(1.625rem, 3.5vw, 2.375rem);
          font-weight: 750;
          letter-spacing: -0.03em;
          color: var(--foreground);
          margin: 0 0 0.75rem;
        }
        .section-desc {
          font-size: 1.0625rem;
          color: var(--text-muted);
          margin: 0 0 3rem;
          max-width: 480px;
          line-height: 1.75;
        }

        /* ── Activity Cards ── */
        .activity-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .activity-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .activity-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .activity-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease;
        }
        .activity-card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-2px);
          border-color: var(--accent-muted);
        }
        .activity-icon {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: var(--radius);
          background: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .activity-card-title {
          font-size: 1.0625rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--foreground);
          margin: 0;
          line-height: 1.35;
        }
        .activity-card-desc {
          font-size: 0.9375rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin: 0;
          flex: 1;
        }

        /* ── Posts ── */
        .posts-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .posts-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .posts-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .posts-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .post-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
          transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease;
        }
        .post-card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-2px);
          border-color: var(--accent-muted);
        }
        .post-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.625rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          width: fit-content;
        }
        .post-badge-notice {
          background: var(--accent-light);
          color: var(--accent);
        }
        .post-badge-blog {
          background: var(--surface-alt);
          color: var(--text-muted);
        }
        .post-title {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--foreground);
          line-height: 1.45;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .post-date {
          font-size: 0.8125rem;
          color: var(--text-subtle);
          margin: 0;
          margin-top: auto;
          font-family: var(--font-mono);
        }
        .posts-empty {
          grid-column: 1 / -1;
          padding: 3rem 2rem;
          border: 1.5px dashed var(--border);
          border-radius: var(--radius-lg);
          text-align: center;
        }
        .posts-empty-label {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--text-subtle);
          margin: 0;
        }
        .more-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--accent);
          text-decoration: none;
          transition: gap 150ms ease, color 150ms ease;
          white-space: nowrap;
        }
        .more-link:hover {
          gap: 0.625rem;
          color: var(--accent-hover);
        }

        /* ── Recruit Banner ── */
        .recruit-section {
          padding: 4rem 1.25rem;
        }
        @media (min-width: 640px) {
          .recruit-section { padding: 4rem 2rem; }
        }
        @media (min-width: 1024px) {
          .recruit-section { padding: 5rem 2.5rem; }
        }
        .recruit-banner {
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .recruit-banner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 2.5rem 3rem;
          }
        }
        .recruit-banner-active {
          background: var(--accent);
          color: #fff;
        }
        .recruit-banner-inactive {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--foreground);
        }
        .recruit-banner-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .recruit-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.75;
        }
        .recruit-banner-active .recruit-eyebrow {
          color: #c7d2fe;
        }
        .recruit-banner-inactive .recruit-eyebrow {
          color: var(--accent);
          opacity: 1;
        }
        .recruit-title {
          font-size: clamp(1.375rem, 3vw, 1.875rem);
          font-weight: 750;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin: 0;
        }
        .recruit-banner-active .recruit-title {
          color: #fff;
        }
        .recruit-banner-inactive .recruit-title {
          color: var(--foreground);
        }
        .recruit-deadline {
          font-size: 0.9375rem;
          margin: 0;
          opacity: 0.85;
        }
        .recruit-banner-active .recruit-deadline {
          color: #e0e7ff;
        }
        .recruit-banner-inactive .recruit-deadline {
          color: var(--text-muted);
          opacity: 1;
        }
        .recruit-cta-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.9375rem;
          border-radius: 999px;
          padding: 0.6875rem 1.5rem;
          border: 1.5px solid rgba(255,255,255,0.45);
          color: #fff;
          background: rgba(255,255,255,0.12);
          text-decoration: none;
          white-space: nowrap;
          transition: background 150ms ease, border-color 150ms ease, transform 100ms ease;
          flex-shrink: 0;
          cursor: pointer;
        }
        .recruit-cta-ghost:hover {
          background: rgba(255,255,255,0.22);
          border-color: rgba(255,255,255,0.7);
        }
        .recruit-cta-ghost:active { transform: translateY(1px); }
      `}</style>

      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="container-page">
          <div className="hero-content">
            <span className="hero-badge">
              <span className="hero-badge-mono">;</span>
              개발 동아리 세미콜론
            </span>

            <h1 className="hero-h1">
              함께 성장하는<br />
              <span className="hero-h1-accent">개발자 커뮤니티</span>
            </h1>

            <p className="hero-subtitle">
              세미콜론은 스터디·프로젝트·행사를 통해 함께 배우고 만들어 가는
              개발 동아리입니다. 코드 한 줄처럼, 우리의 이야기는 계속됩니다.
            </p>

            <div className="hero-cta">
              <Link href="/recruit" className="btn btn-primary">
                지원하기
              </Link>
              <Link href="/about" className="btn btn-ghost">
                더 알아보기
              </Link>
            </div>

            <div className="hero-meta">
              <div className="hero-stat">
                <span className="hero-stat-num">Study</span>
                <span className="hero-stat-label">주제별 스터디 운영</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">Project</span>
                <span className="hero-stat-label">팀 프로젝트 개발</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">Event</span>
                <span className="hero-stat-label">세미나 & 행사</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. 우리가 하는 것 ────────────────────────────────────── */}
      <section className="section section-alt">
        <div className="container-page">
          <span className="section-label">What we do</span>
          <h2 className="section-h2">우리가 함께하는 것들</h2>
          <p className="section-desc">
            세미콜론은 세 가지 방식으로 성장을 만들어 갑니다.
          </p>

          <div className="activity-grid">
            {/* Study */}
            <div className="activity-card">
              <div className="activity-icon">
                <IconStudy />
              </div>
              <div>
                <h3 className="activity-card-title">스터디</h3>
                <p className="activity-card-desc">
                  알고리즘부터 웹 개발, CS 이론까지 — 관심 주제별로 모여
                  꾸준히 함께 공부합니다.
                </p>
              </div>
            </div>

            {/* Project */}
            <div className="activity-card">
              <div className="activity-icon">
                <IconProject />
              </div>
              <div>
                <h3 className="activity-card-title">프로젝트</h3>
                <p className="activity-card-desc">
                  아이디어를 직접 제품으로 만들어 봅니다. 팀을 이뤄 기획부터
                  배포까지 경험합니다.
                </p>
              </div>
            </div>

            {/* Event */}
            <div className="activity-card">
              <div className="activity-icon">
                <IconEvent />
              </div>
              <div>
                <h3 className="activity-card-title">행사</h3>
                <p className="activity-card-desc">
                  세미나, 해커톤, 네트워킹 등 다양한 행사로 구성원이 연결되고
                  시야를 넓힙니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 최근 소식 ────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <div className="posts-header">
            <div>
              <span className="section-label">Latest</span>
              <h2 className="section-h2" style={{ marginBottom: 0 }}>최근 소식</h2>
            </div>
            <Link href="/posts" className="more-link">
              전체 보기 <IconArrow />
            </Link>
          </div>

          <div className="posts-grid">
            {posts.length === 0 ? (
              <div className="posts-empty">
                <p className="posts-empty-label">
                  {'// 아직 소식이 없어요. 곧 업데이트 됩니다.'}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="post-card">
                  <span className={`post-badge ${post.category === 'notice' ? 'post-badge-notice' : 'post-badge-blog'}`}>
                    {categoryLabel(post.category)}
                  </span>
                  <p className="post-title">{post.title}</p>
                  <p className="post-date">{formatDate(post.created_at)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── 4. 모집 배너 ─────────────────────────────────────────── */}
      <section className="recruit-section section-alt">
        <div className="container-page">
          {recruit?.isRecruiting ? (
            <div className="recruit-banner recruit-banner-active">
              <div className="recruit-banner-content">
                <span className="recruit-eyebrow">Recruiting</span>
                <h2 className="recruit-title">
                  지금 세미콜론 멤버를 모집합니다
                </h2>
                {recruit.end && (
                  <p className="recruit-deadline">
                    모집 마감: {formatDate(recruit.end)}
                  </p>
                )}
              </div>
              <Link href="/recruit" className="recruit-cta-ghost">
                지원하기 <IconArrow />
              </Link>
            </div>
          ) : (
            <div className="recruit-banner recruit-banner-inactive">
              <div className="recruit-banner-content">
                <span className="recruit-eyebrow">Coming Soon</span>
                <h2 className="recruit-title">
                  다음 모집을 기다려 주세요
                </h2>
                <p className="recruit-deadline">
                  현재 모집 기간이 아닙니다. 공지를 통해 일정을 안내드리겠습니다.
                </p>
              </div>
              <Link href="/posts" className="btn btn-ghost" style={{ flexShrink: 0 }}>
                소식 보기
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
