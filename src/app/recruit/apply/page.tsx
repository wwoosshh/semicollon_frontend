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

// ─── Icons ────────────────────────────────────────────────────
function IconArrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// ─── Closed State ─────────────────────────────────────────────
function NotRecruitingView() {
  return (
    <div className="apply-closed">
      <div className="apply-closed-icon">
        <IconInfo />
      </div>
      <p className="apply-closed-label">Not Recruiting</p>
      <h1 className="apply-closed-title">지금은 모집 기간이 아닙니다</h1>
      <p className="apply-closed-desc">
        현재 신입 기수 모집이 진행되지 않습니다.
        모집이 시작되면 공지사항을 통해 안내드리겠습니다.
      </p>
      <Link href="/recruit" className="btn btn-ghost apply-back-link">
        모집 안내 보기 <IconArrow />
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
        /* ── Page Layout ── */
        .apply-page {
          padding: 4rem 1.25rem 6rem;
        }
        @media (min-width: 640px) {
          .apply-page { padding: 5rem 2rem 7rem; }
        }
        @media (min-width: 1024px) {
          .apply-page { padding: 5.5rem 2.5rem 8rem; }
        }
        .apply-inner {
          max-width: 640px;
          margin-inline: auto;
        }

        /* ── Breadcrumb ── */
        .apply-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-subtle);
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }
        .apply-breadcrumb a {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 120ms ease;
        }
        .apply-breadcrumb a:hover {
          color: var(--accent);
        }
        .apply-breadcrumb-sep {
          color: var(--border);
          user-select: none;
        }
        .apply-breadcrumb-current {
          color: var(--foreground);
          font-weight: 600;
        }

        /* ── Page header ── */
        .apply-header {
          margin-bottom: 2.5rem;
        }
        .apply-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.275rem 0.875rem;
          border-radius: 999px;
          background: var(--accent-light);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid var(--accent-muted);
          margin-bottom: 1.25rem;
        }
        .apply-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.15;
          color: var(--foreground);
          margin: 0 0 0.75rem;
        }
        .apply-subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.75;
          margin: 0;
          max-width: 480px;
        }

        /* ── Divider ── */
        .apply-divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2.5rem 0;
        }

        /* ── Card wrapper for form ── */
        .apply-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }
        @media (min-width: 640px) {
          .apply-card {
            padding: 2.5rem 3rem;
          }
        }

        /* ── Closed state ── */
        .apply-closed {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.25rem;
          padding: 5rem 1.25rem;
          max-width: 520px;
          margin-inline: auto;
        }
        .apply-closed-icon {
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          background: var(--surface-alt);
          color: var(--text-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .apply-closed-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-subtle);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0;
        }
        .apply-closed-title {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--foreground);
          margin: 0;
          line-height: 1.2;
        }
        .apply-closed-desc {
          font-size: 0.9375rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.8;
          max-width: 400px;
        }
        .apply-back-link {
          gap: 0.375rem;
          margin-top: 0.5rem;
        }
      `}</style>

      {isRecruiting ? (
        <main className="apply-page">
          <div className="apply-inner">
            {/* Breadcrumb */}
            <nav className="apply-breadcrumb" aria-label="breadcrumb">
              <Link href="/">홈</Link>
              <span className="apply-breadcrumb-sep" aria-hidden="true">/</span>
              <Link href="/recruit">모집</Link>
              <span className="apply-breadcrumb-sep" aria-hidden="true">/</span>
              <span className="apply-breadcrumb-current">지원하기</span>
            </nav>

            {/* Header */}
            <header className="apply-header">
              <span className="apply-eyebrow">Apply</span>
              <h1 className="apply-title">지원서 작성</h1>
              <p className="apply-subtitle">
                아래 양식을 작성해 주세요. 검토 후 등록하신 연락처로 결과를 안내해 드립니다.
              </p>
            </header>

            <hr className="apply-divider" />

            {/* Form card */}
            <div className="apply-card">
              <ApplyForm />
            </div>
          </div>
        </main>
      ) : (
        <main className="apply-page">
          <NotRecruitingView />
        </main>
      )}
    </>
  );
}
