import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { RecruitInfo } from '@/lib/types';

export const metadata: Metadata = {
  title: '모집 | 세미콜론',
  description: '세미콜론 개발 동아리 신입 기수 모집 안내',
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
function formatDateKo(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── SVG Icons ────────────────────────────────────────────────
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// ─── Process Steps ────────────────────────────────────────────
const STEPS = [
  { label: '서류 전형', desc: '지원서 작성 및 제출' },
  { label: '면접 전형', desc: '운영진과 30분 인터뷰' },
  { label: '최종 합류', desc: '온보딩 세션 및 활동 시작' },
];

const ELIGIBILITY = [
  '개발에 관심 있는 누구나 (전공 무관)',
  '정기 활동(주 1회)에 성실히 참여 가능한 분',
  '팀원과 협력하고 함께 성장하고자 하는 분',
];

// ─── Page ─────────────────────────────────────────────────────
export default async function RecruitPage() {
  const recruit = await fetchRecruitInfo();
  const isRecruiting = recruit?.isRecruiting ?? false;

  return (
    <>
      <style>{`
        /* ── Page Hero ── */
        .recruit-hero {
          position: relative;
          overflow: hidden;
          padding: 5rem 1.25rem 4rem;
        }
        @media (min-width: 640px) {
          .recruit-hero { padding: 6rem 2rem 5rem; }
        }
        @media (min-width: 1024px) {
          .recruit-hero { padding: 7rem 2.5rem 6rem; }
        }
        .recruit-hero-grid {
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
        .recruit-hero-inner {
          position: relative;
          max-width: 680px;
        }
        .page-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.3rem 0.875rem;
          border-radius: 999px;
          background: var(--accent-light);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          border: 1px solid var(--accent-muted);
        }
        .page-eyebrow-active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent-hover);
        }
        .recruit-hero-h1 {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.15;
          color: var(--foreground);
          margin: 0 0 1.25rem;
        }
        .recruit-hero-sub {
          font-size: 1.0625rem;
          color: var(--text-muted);
          line-height: 1.8;
          margin: 0;
          max-width: 520px;
        }

        /* ── Section commons ── */
        .r-section {
          padding: 5rem 1.25rem;
        }
        @media (min-width: 640px) {
          .r-section { padding: 5rem 2rem; }
        }
        @media (min-width: 1024px) {
          .r-section { padding: 6rem 2.5rem; }
        }
        .r-section-alt {
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
          font-size: clamp(1.5rem, 3.5vw, 2.25rem);
          font-weight: 750;
          letter-spacing: -0.03em;
          color: var(--foreground);
          margin: 0 0 0.75rem;
        }
        .section-desc {
          font-size: 1rem;
          color: var(--text-muted);
          margin: 0 0 3rem;
          max-width: 480px;
          line-height: 1.75;
        }

        /* ── Schedule Card ── */
        .schedule-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .schedule-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
        }
        .schedule-header-icon {
          color: var(--accent);
          display: flex;
          align-items: center;
        }
        .schedule-header-title {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0;
        }
        .schedule-body {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .schedule-body {
            flex-direction: row;
            gap: 3rem;
          }
        }
        .schedule-date-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .schedule-date-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-subtle);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .schedule-date-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--foreground);
          letter-spacing: -0.02em;
        }
        .schedule-date-divider {
          display: none;
          width: 1px;
          background: var(--border);
          align-self: stretch;
        }
        @media (min-width: 640px) {
          .schedule-date-divider { display: block; }
        }

        /* ── Eligibility ── */
        .eligibility-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .eligibility-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.9375rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .eligibility-check {
          flex-shrink: 0;
          width: 1.375rem;
          height: 1.375rem;
          border-radius: 50%;
          background: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0.0625rem;
        }

        /* ── Process Steps ── */
        .steps-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @media (min-width: 680px) {
          .steps-row {
            flex-direction: row;
            align-items: stretch;
            gap: 0;
          }
        }
        .step-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          padding: 1.75rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          position: relative;
        }
        @media (min-width: 680px) {
          .step-item {
            border-radius: 0;
            border-right-width: 0;
          }
          .step-item:first-child {
            border-radius: var(--radius-lg) 0 0 var(--radius-lg);
          }
          .step-item:last-child {
            border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
            border-right-width: 1px;
          }
        }
        .step-number {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .step-label {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--foreground);
          margin: 0;
        }
        .step-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.6;
        }
        .step-connector {
          display: none;
        }
        @media (min-width: 680px) {
          .step-connector {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 2rem;
            color: var(--text-subtle);
          }
        }

        /* ── CTA ── */
        .recruit-cta-section {
          padding: 4rem 1.25rem;
        }
        @media (min-width: 640px) {
          .recruit-cta-section { padding: 5rem 2rem; }
        }
        @media (min-width: 1024px) {
          .recruit-cta-section { padding: 5rem 2.5rem; }
        }
        .recruit-cta-box {
          background: var(--accent);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .recruit-cta-box {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 2.5rem 3rem;
          }
        }
        .cta-box-content { display: flex; flex-direction: column; gap: 0.5rem; }
        .cta-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c7d2fe;
        }
        .cta-title {
          font-size: clamp(1.25rem, 3vw, 1.75rem);
          font-weight: 750;
          letter-spacing: -0.03em;
          line-height: 1.2;
          color: #fff;
          margin: 0;
        }
        .cta-sub {
          font-size: 0.9375rem;
          color: #e0e7ff;
          margin: 0;
          line-height: 1.6;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.9375rem;
          border-radius: 999px;
          padding: 0.75rem 1.75rem;
          border: 1.5px solid rgba(255,255,255,0.45);
          color: #fff;
          background: rgba(255,255,255,0.12);
          text-decoration: none;
          white-space: nowrap;
          transition: background 150ms ease, border-color 150ms ease, transform 100ms ease;
          flex-shrink: 0;
          cursor: pointer;
        }
        .cta-btn:hover {
          background: rgba(255,255,255,0.22);
          border-color: rgba(255,255,255,0.7);
        }
        .cta-btn:active { transform: translateY(1px); }

        /* ── Closed State ── */
        .closed-card {
          background: var(--surface);
          border: 1.5px dashed var(--border);
          border-radius: var(--radius-xl);
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.5rem;
        }
        .closed-icon {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: var(--surface-alt);
          color: var(--text-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .closed-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-subtle);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0;
        }
        .closed-title {
          font-size: clamp(1.375rem, 3vw, 1.875rem);
          font-weight: 750;
          letter-spacing: -0.03em;
          color: var(--foreground);
          margin: 0;
          line-height: 1.25;
        }
        .closed-desc {
          font-size: 1rem;
          color: var(--text-muted);
          margin: 0;
          max-width: 440px;
          line-height: 1.75;
        }
      `}</style>

      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="recruit-hero">
        <div className="recruit-hero-grid" />
        <div className="container-page">
          <div className="recruit-hero-inner">
            <span className={`page-eyebrow${isRecruiting ? ' page-eyebrow-active' : ''}`}>
              {isRecruiting ? 'Recruiting Now' : 'Recruit'}
            </span>
            <h1 className="recruit-hero-h1">
              세미콜론과<br />함께 성장하세요
            </h1>
            <p className="recruit-hero-sub">
              개발에 관심 있다면 누구든 환영합니다.
              스터디·프로젝트·행사를 통해 함께 성장할 동료를 기다립니다.
            </p>
          </div>
        </div>
      </section>

      {isRecruiting ? (
        <>
          {/* ── 2. 일정 ─────────────────────────────────────────── */}
          <section className="r-section r-section-alt">
            <div className="container-page">
              <span className="section-label">Schedule</span>
              <h2 className="section-h2">모집 일정</h2>
              <p className="section-desc" style={{ marginBottom: '2rem' }}>
                아래 일정을 확인하고 마감 전에 지원서를 제출해 주세요.
              </p>

              <div className="schedule-card">
                <div className="schedule-header">
                  <span className="schedule-header-icon"><IconCalendar /></span>
                  <p className="schedule-header-title">모집 기간</p>
                </div>
                <div className="schedule-body">
                  {recruit?.start && (
                    <div className="schedule-date-item">
                      <span className="schedule-date-label">시작일</span>
                      <span className="schedule-date-value">{formatDateKo(recruit.start)}</span>
                    </div>
                  )}
                  {recruit?.start && recruit?.end && (
                    <div className="schedule-date-divider" />
                  )}
                  {recruit?.end && (
                    <div className="schedule-date-item">
                      <span className="schedule-date-label">마감일</span>
                      <span className="schedule-date-value">{formatDateKo(recruit.end)}</span>
                    </div>
                  )}
                  {!recruit?.start && !recruit?.end && (
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', margin: 0 }}>
                      일정이 곧 공지될 예정입니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. 모집 대상 ─────────────────────────────────────── */}
          <section className="r-section">
            <div className="container-page">
              <span className="section-label">Who We&apos;re Looking For</span>
              <h2 className="section-h2">모집 대상</h2>
              <p className="section-desc">
                이런 분이라면 세미콜론에서 함께하기 좋습니다.
              </p>

              <ul className="eligibility-list">
                {ELIGIBILITY.map((item) => (
                  <li key={item} className="eligibility-item">
                    <span className="eligibility-check"><IconCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── 4. 지원 과정 ─────────────────────────────────────── */}
          <section className="r-section r-section-alt">
            <div className="container-page">
              <span className="section-label">Process</span>
              <h2 className="section-h2">지원 과정</h2>
              <p className="section-desc">
                서류부터 합류까지 세 단계로 진행됩니다.
              </p>

              <div className="steps-row">
                {STEPS.map((step, i) => (
                  <>
                    <div key={step.label} className="step-item">
                      <span className="step-number">Step {String(i + 1).padStart(2, '0')}</span>
                      <p className="step-label">{step.label}</p>
                      <p className="step-desc">{step.desc}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="step-connector" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </div>
                    )}
                  </>
                ))}
              </div>
            </div>
          </section>

          {/* ── 5. CTA ──────────────────────────────────────────── */}
          <section className="recruit-cta-section">
            <div className="container-page">
              <div className="recruit-cta-box">
                <div className="cta-box-content">
                  <span className="cta-eyebrow">Apply Now</span>
                  <h2 className="cta-title">지금 바로 지원하세요</h2>
                  {recruit?.end && (
                    <p className="cta-sub">마감: {formatDateKo(recruit.end)}</p>
                  )}
                </div>
                <Link href="/recruit/apply" className="cta-btn">
                  지원서 작성하기 <IconArrow />
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* ── 모집 아님 상태 ──────────────────────────────────────── */
        <section className="r-section">
          <div className="container-page">
            <div className="closed-card">
              <div className="closed-icon">
                <IconInfo />
              </div>
              <p className="closed-label">Not Recruiting</p>
              <h2 className="closed-title">지금은 모집 기간이 아닙니다</h2>
              <p className="closed-desc">
                현재 신입 기수 모집이 진행되지 않습니다.
                공지사항을 통해 다음 모집 일정을 안내드릴 예정이니 기대해 주세요.
              </p>
              <Link href="/about" className="btn btn-ghost">
                동아리 소개 보기
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
