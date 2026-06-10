import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { RecruitInfo } from '@/lib/types';
import ApplyForm from '@/components/apply-form';

export const metadata: Metadata = {
  title: '지원하기 | 세미콜론',
  description: '세미콜론 개발 동아리 지원서를 작성해 주세요.',
};

// ─── Data Fetcher ─────────────────────────────────────────────
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

// ─── Closed State ─────────────────────────────────────────────
function NotRecruitingView() {
  return (
    <div className="apply-closed-inner">
      <p className="apply-closed-status">○ NOT RECRUITING</p>
      <h1 className="apply-closed-h">
        지금은 모집 기간이<br />아닙니다
      </h1>
      <p className="apply-closed-desc">
        현재 신입 기수 모집이 진행되지 않습니다.
        모집이 시작되면 공지사항을 통해 안내드리겠습니다.
      </p>
      <hr className="apply-closed-rule" />
      <Link href="/recruit" className="btn btn-ghost">
        모집 안내 보기 →
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default async function ApplyPage() {
  const recruit = await fetchRecruitInfo();
  const isRecruiting = recruit?.isRecruiting ?? false;

  return (
    <>
      <style>{`
        /* ── 페이지 레이아웃 ── */
        .apply-page {
          padding-top: 0;
          padding-bottom: 6rem;
        }

        /* ── 페이지 헤더 바 ── */
        .apply-header-bar {
          border-bottom: 1px solid var(--ink);
        }
        .apply-header-inner {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 36vh;
        }
        @media (min-width: 900px) {
          .apply-header-inner {
            grid-template-columns: 1fr 200px;
          }
        }
        .apply-header-main {
          padding: 3.5rem 0 3rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        @media (min-width: 900px) {
          .apply-header-main {
            border-right: 1px solid var(--hairline);
            padding-right: 3rem;
          }
        }
        .apply-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--vermilion);
          margin-bottom: 1.25rem;
        }
        .apply-h1 {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(1.9rem, 5vw, 3rem);
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0 0 1rem;
        }
        .apply-lead {
          font-size: 0.9375rem;
          color: var(--ink-soft);
          line-height: 1.8;
          margin: 0;
          max-width: 36rem;
        }

        /* 우측 메타 칼럼 */
        .apply-header-meta {
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--hairline-soft);
          margin-top: 1rem;
          padding-top: 1rem;
        }
        @media (min-width: 900px) {
          .apply-header-meta {
            border-top: none;
            margin-top: 0;
            padding-top: 3.5rem;
            padding-left: 2rem;
          }
        }
        .apply-meta-row {
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--hairline-soft);
        }
        .apply-meta-row:last-child { border-bottom: none; }
        .apply-meta-k {
          display: block;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-faint);
          margin-bottom: 0.2rem;
        }
        .apply-meta-v {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--ink);
        }

        /* ── 브레드크럼 ── */
        .apply-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: var(--ink-faint);
          padding: 1rem 0;
          border-bottom: 1px solid var(--hairline-soft);
          margin-bottom: 3rem;
        }
        .apply-breadcrumb a {
          color: var(--ink-soft);
          text-decoration: none;
          transition: color 120ms ease;
        }
        .apply-breadcrumb a:hover { color: var(--vermilion); }
        .apply-breadcrumb-sep { color: var(--hairline); }
        .apply-breadcrumb-current { color: var(--ink); }

        /* ── 폼 영역 ── */
        .apply-form-area {
          max-width: 720px;
        }

        /* ── 모집 아님 ── */
        .apply-closed-inner {
          padding: 5rem 0 6rem;
          max-width: 40rem;
        }
        .apply-closed-status {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-faint);
          margin-bottom: 2rem;
        }
        .apply-closed-h {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(1.75rem, 4.5vw, 2.75rem);
          line-height: 1.25;
          color: var(--ink);
          margin: 0 0 1.25rem;
        }
        .apply-closed-desc {
          font-size: 1rem;
          line-height: 1.85;
          color: var(--ink-soft);
          margin: 0 0 2.5rem;
        }
        .apply-closed-rule {
          border: 0;
          border-top: 1px solid var(--hairline);
          margin: 0 0 2.5rem;
        }
      `}</style>

      {/* ── 페이지 헤더 ── */}
      {isRecruiting && (
        <section className="apply-header-bar">
          <div className="container-page">
            <div className="apply-header-inner">
              <div className="apply-header-main rise">
                <p className="apply-eyebrow">● APPLY — SEMICOLLON</p>
                <h1 className="apply-h1">
                  지원서 작성
                </h1>
                <p className="apply-lead">
                  아래 양식을 작성해 주세요. 검토 후 등록하신 연락처로 결과를 안내해 드립니다.
                </p>
              </div>
              <aside className="apply-header-meta">
                <div className="apply-meta-row">
                  <span className="apply-meta-k">Status</span>
                  <span className="apply-meta-v" style={{ color: 'var(--vermilion)' }}>● OPEN</span>
                </div>
                {recruit?.end && (
                  <div className="apply-meta-row">
                    <span className="apply-meta-k">Deadline</span>
                    <span className="apply-meta-v">{formatDate(recruit.end)}</span>
                  </div>
                )}
                <div className="apply-meta-row">
                  <span className="apply-meta-k">Process</span>
                  <span className="apply-meta-v">서류 → 면접 → 합류</span>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {isRecruiting ? (
        <main className="apply-page">
          <div className="container-page">
            {/* 브레드크럼 */}
            <nav className="apply-breadcrumb" aria-label="breadcrumb">
              <Link href="/">홈</Link>
              <span className="apply-breadcrumb-sep" aria-hidden="true">/</span>
              <Link href="/recruit">모집</Link>
              <span className="apply-breadcrumb-sep" aria-hidden="true">/</span>
              <span className="apply-breadcrumb-current">지원하기</span>
            </nav>

            {/* 폼 */}
            <div className="apply-form-area">
              <ApplyForm />
            </div>
          </div>
        </main>
      ) : (
        <main>
          <div className="container-page">
            <NotRecruitingView />
          </div>
        </main>
      )}
    </>
  );
}
