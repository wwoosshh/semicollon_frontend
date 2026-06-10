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
function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// ─── Process Steps ────────────────────────────────────────────
const STEPS = [
  { no: '01', label: '서류 전형', desc: '지원서 작성 및 제출. 개발 경험과 동아리 합류 이유를 솔직하게 써주세요.' },
  { no: '02', label: '면접 전형', desc: '운영진과 30분 인터뷰. 기술 시험이 아닌 사람을 알아가는 자리입니다.' },
  { no: '03', label: '최종 합류', desc: '온보딩 세션 및 활동 시작. 첫 스터디부터 바로 합류하게 됩니다.' },
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
        /* ── 페이지 헤더 ── */
        .rc-hero {
          border-bottom: 1px solid var(--ink);
        }
        .rc-hero-inner {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 44vh;
        }
        @media (min-width: 900px) {
          .rc-hero-inner {
            grid-template-columns: 1fr 220px;
          }
        }
        .rc-hero-main {
          padding: 4rem 0 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          border-bottom: 1px solid var(--hairline);
        }
        @media (min-width: 900px) {
          .rc-hero-main {
            border-bottom: none;
            border-right: 1px solid var(--hairline);
            padding-right: 3rem;
          }
        }
        .rc-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }
        .rc-eyebrow-open { color: var(--vermilion); }
        .rc-eyebrow-closed { color: var(--ink-faint); }
        .rc-h1 {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(2.25rem, 6vw, 4rem);
          line-height: 1.18;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0 0 1.5rem;
        }
        .rc-lead {
          max-width: 36rem;
          font-size: 1.0625rem;
          line-height: 1.85;
          color: var(--ink-soft);
          margin: 0;
        }
        /* 우측 상태 칼럼 */
        .rc-meta {
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 900px) {
          .rc-meta {
            padding-left: 2rem;
            padding-top: 4rem;
          }
        }
        .rc-meta-row {
          padding: 0.9rem 0;
          border-bottom: 1px solid var(--hairline-soft);
        }
        .rc-meta-row:last-child { border-bottom: none; }
        .rc-meta-k {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-faint);
          display: block;
          margin-bottom: 0.2rem;
        }
        .rc-meta-v {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--ink);
        }
        .rc-meta-v-open { color: var(--vermilion); }

        /* ── 섹션 공통 ── */
        .rc-sec {
          border-bottom: 1px solid var(--ink);
        }
        .rc-sec-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 0;
          border-bottom: 1px solid var(--hairline);
        }
        .rc-sec-body {
          padding: 3rem 0 4rem;
        }
        .rc-sec-en {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-faint);
        }

        /* ── 01 일정 ── */
        .schedule-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        @media (min-width: 640px) {
          .schedule-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .schedule-cell {
          padding: 1.75rem 0;
          border-bottom: 1px solid var(--hairline-soft);
        }
        @media (min-width: 640px) {
          .schedule-cell {
            padding: 1.75rem 2.5rem 1.75rem 0;
            border-bottom: none;
            border-right: 1px solid var(--hairline);
          }
          .schedule-cell:last-child {
            border-right: none;
            padding-left: 2.5rem;
            padding-right: 0;
          }
        }
        .schedule-cell:last-child { border-bottom: none; }
        .schedule-k {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-faint);
          margin-bottom: 0.5rem;
        }
        .schedule-v {
          font-family: var(--font-mono);
          font-size: 1.35rem;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: 0.02em;
        }
        .schedule-v-em { color: var(--vermilion); }
        .schedule-note {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--ink-faint);
          margin-top: 0.375rem;
        }

        /* ── 02 모집 대상 ── */
        .elig-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .elig-item {
          display: grid;
          grid-template-columns: 2rem 1fr;
          align-items: baseline;
          gap: 0.75rem;
          padding: 1rem 0.5rem;
          border-bottom: 1px solid var(--hairline);
        }
        .elig-item:last-child { border-bottom: none; }
        .elig-no {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          color: var(--vermilion);
        }
        .elig-text {
          font-size: 0.9375rem;
          color: var(--ink-soft);
          line-height: 1.65;
        }

        /* ── 03 지원 과정 ── */
        .steps-grid {
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 680px) {
          .steps-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .step-col {
          padding: 2rem 0;
          border-bottom: 1px solid var(--hairline-soft);
        }
        @media (min-width: 680px) {
          .step-col {
            padding: 2.25rem 2.25rem 2.25rem 0;
            border-bottom: none;
            border-right: 1px solid var(--hairline);
          }
          .step-col:not(:first-child) { padding-left: 2.25rem; }
          .step-col:last-child { border-right: none; }
        }
        .step-no {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--vermilion);
          margin-bottom: 1rem;
        }
        .step-label {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.2rem;
          color: var(--ink);
          margin: 0 0 0.75rem;
        }
        .step-desc {
          font-size: 0.9rem;
          line-height: 1.85;
          color: var(--ink-soft);
          margin: 0;
        }

        /* ── CTA 잉크 블록 ── */
        .rc-cta-band {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.75rem;
          padding: 3.5rem 0;
        }
        @media (min-width: 768px) {
          .rc-cta-band {
            grid-template-columns: 1fr auto;
            align-items: center;
          }
        }
        .rc-cta-title {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(1.75rem, 4.5vw, 2.75rem);
          line-height: 1.3;
          color: var(--paper);
          margin: 0;
        }
        .rc-cta-deadline {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          letter-spacing: 0.06em;
          color: rgba(246,244,238,0.55);
          margin-top: 0.75rem;
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

        /* ── 모집 아님 ── */
        .closed-section {
          border-bottom: none;
        }
        .closed-inner {
          padding: 5rem 0 6rem;
          max-width: 44rem;
        }
        .closed-status {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-faint);
          margin-bottom: 2rem;
        }
        .closed-status::before {
          content: '○ ';
          color: var(--ink-faint);
        }
        .closed-h {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          line-height: 1.25;
          color: var(--ink);
          margin: 0 0 1.25rem;
        }
        .closed-desc {
          font-size: 1.0625rem;
          line-height: 1.85;
          color: var(--ink-soft);
          margin: 0 0 2.5rem;
          max-width: 36rem;
        }
        .closed-rule {
          border: 0;
          border-top: 1px solid var(--hairline);
          margin: 0 0 2.5rem;
        }
      `}</style>

      {/* ── 페이지 헤더 ───────────────────────────────────────── */}
      <section className="rc-hero">
        <div className="container-page">
          <div className="rc-hero-inner">
            <div className="rc-hero-main">
              <p className={`rc-eyebrow rise rise-1 ${isRecruiting ? 'rc-eyebrow-open' : 'rc-eyebrow-closed'}`}>
                {isRecruiting ? '● RECRUITING NOW — SEMICOLLON' : '○ RECRUIT — SEMICOLLON'}
              </p>
              <h1 className="rc-h1 rise rise-2">
                {isRecruiting ? (
                  <>지금, 새로운 부원을<br />기다리고 있습니다<span style={{ color: 'var(--vermilion)' }}>;</span></>
                ) : (
                  <>세미콜론과<br />함께 성장하세요</>
                )}
              </h1>
              <p className="rc-lead rise rise-3">
                개발에 관심 있다면 누구든 환영합니다.
                스터디·프로젝트·행사를 통해 함께 성장할 동료를 기다립니다.
              </p>
            </div>
            <aside className="rc-meta rise rise-4">
              <div className="rc-meta-row">
                <span className="rc-meta-k">Status</span>
                <span className={`rc-meta-v ${isRecruiting ? 'rc-meta-v-open' : ''}`}>
                  {isRecruiting ? '● OPEN' : '○ CLOSED'}
                </span>
              </div>
              {isRecruiting && recruit?.start && (
                <div className="rc-meta-row">
                  <span className="rc-meta-k">Start</span>
                  <span className="rc-meta-v">{formatDate(recruit.start)}</span>
                </div>
              )}
              {isRecruiting && recruit?.end && (
                <div className="rc-meta-row">
                  <span className="rc-meta-k">Deadline</span>
                  <span className="rc-meta-v">{formatDate(recruit.end)}</span>
                </div>
              )}
              <div className="rc-meta-row">
                <span className="rc-meta-k">Open To</span>
                <span className="rc-meta-v">전공 무관</span>
              </div>
              <div className="rc-meta-row">
                <span className="rc-meta-k">Process</span>
                <span className="rc-meta-v">서류 → 면접 → 합류</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {isRecruiting ? (
        <>
          {/* ── 01 일정 ──────────────────────────────────────────── */}
          <section className="rc-sec">
            <div className="container-page">
              <div className="rc-sec-head">
                <span className="section-label">
                  <span className="no">01</span> 모집 일정
                </span>
                <span className="rc-sec-en">Schedule</span>
              </div>
              <div className="rc-sec-body">
                <div className="schedule-grid">
                  {recruit?.start ? (
                    <div className="schedule-cell">
                      <div className="schedule-k">시작일</div>
                      <div className="schedule-v">{formatDate(recruit.start)}</div>
                      <div className="schedule-note">모집 개시</div>
                    </div>
                  ) : null}
                  {recruit?.end ? (
                    <div className="schedule-cell">
                      <div className="schedule-k">마감일</div>
                      <div className="schedule-v schedule-v-em">{formatDate(recruit.end)}</div>
                      <div className="schedule-note">이 날짜까지 지원서를 제출하세요</div>
                    </div>
                  ) : null}
                  {!recruit?.start && !recruit?.end && (
                    <div className="schedule-cell" style={{ gridColumn: '1 / -1' }}>
                      <div className="schedule-k">일정</div>
                      <div className="schedule-v" style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--ink-soft)' }}>
                        일정이 곧 공지될 예정입니다
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── 02 모집 대상 ──────────────────────────────────────── */}
          <section className="rc-sec">
            <div className="container-page">
              <div className="rc-sec-head">
                <span className="section-label">
                  <span className="no">02</span> 모집 대상
                </span>
                <span className="rc-sec-en">Eligibility</span>
              </div>
              <div className="rc-sec-body" style={{ paddingBottom: '2rem' }}>
                <ul className="elig-list">
                  {ELIGIBILITY.map((item, idx) => (
                    <li key={item} className="elig-item vt-rise">
                      <span className="elig-no">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="elig-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── 03 지원 과정 ──────────────────────────────────────── */}
          <section className="rc-sec">
            <div className="container-page">
              <div className="rc-sec-head">
                <span className="section-label">
                  <span className="no">03</span> 지원 과정
                </span>
                <span className="rc-sec-en">Process</span>
              </div>
              <div className="rc-sec-body">
                <div className="steps-grid">
                  {STEPS.map((step) => (
                    <div key={step.no} className="step-col vt-rise">
                      <div className="step-no">STEP {step.no}</div>
                      <h2 className="step-label">{step.label}</h2>
                      <p className="step-desc">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA 잉크 블록 ─────────────────────────────────────── */}
          <section className="ink-block">
            <div className="container-page">
              <div className="rc-cta-band">
                <div>
                  <h2 className="rc-cta-title">
                    지금 바로<br />지원서를 작성하세요
                  </h2>
                  {recruit?.end && (
                    <p className="rc-cta-deadline">
                      DEADLINE — {formatDate(recruit.end)}
                    </p>
                  )}
                </div>
                <Link href="/recruit/apply" className="btn btn-onink">
                  지원서 작성하기 →
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* ── 모집 아님 ────────────────────────────────────────────── */
        <section className="rc-sec closed-section">
          <div className="container-page">
            <div className="closed-inner">
              <p className="closed-status">Not Recruiting</p>
              <h2 className="closed-h">
                지금은 모집 기간이<br />아닙니다
              </h2>
              <p className="closed-desc">
                현재 신입 기수 모집이 진행되지 않습니다.
                공지사항을 통해 다음 모집 일정을 안내드릴 예정이니
                관심 있으시면 소개 페이지를 먼저 읽어보세요.
              </p>
              <hr className="closed-rule" />
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
