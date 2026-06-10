import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '소개 | 세미콜론',
  description: '세미콜론 개발 동아리 소개 — 비전, 연혁, 운영진, FAQ',
};

// ─── Data Constants ───────────────────────────────────────────
const HISTORY = [
  { year: '2024', items: ['동아리 창립', '창립 세미나 개최', '첫 스터디 그룹 운영'] },
  { year: '2025', items: ['첫 해커톤 개최', '웹·앱 팀 프로젝트 결과 발표', '2기 기수 모집'] },
  { year: '2026', items: ['3기 신입 기수 모집', '외부 연사 초청 세미나', '연간 프로젝트 데모데이'] },
];

const STAFF = [
  { name: '김민준', role: '회장', desc: '풀스택 개발 / 동아리 전반 운영' },
  { name: '이서연', role: '부회장', desc: '프론트엔드 개발 / 행사 기획' },
  { name: '박재현', role: '총무', desc: '백엔드 개발 / 재정·행정 관리' },
];

const FAQ = [
  {
    q: '비전공자도 지원할 수 있나요?',
    a: '네, 환영합니다. 전공 여부보다 개발에 대한 관심과 함께 성장하려는 의지를 중시합니다. 기초 프로그래밍 경험이 있으면 충분합니다.',
  },
  {
    q: '주 활동 시간은 어떻게 되나요?',
    a: '주 1회 정기 모임(약 2시간)을 원칙으로 하며, 스터디·프로젝트 팀별로 추가 일정을 자율 조율합니다.',
  },
  {
    q: '회비가 있나요?',
    a: '소정의 학기 회비가 있으며 행사 운영·간식·자료 인쇄 등에 사용됩니다. 정확한 금액은 기수별 모집 공고를 확인해 주세요.',
  },
  {
    q: '입부 전에 미리 준비해야 할 게 있나요?',
    a: '별도의 사전 준비는 필요 없습니다. 노트북과 배우고자 하는 의지만 가져오세요. 입부 후 온보딩 세션을 통해 안내드립니다.',
  },
  {
    q: '졸업 후에도 활동할 수 있나요?',
    a: '졸업한 선배들은 OB로 연결을 유지하며 멘토링·세미나 연사 등 형태로 동아리와 함께합니다.',
  },
];

// ─── SVG Icons ────────────────────────────────────────────────
function IconVision() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconEvent() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      <style>{`
        /* ── Page Hero ── */
        .about-hero {
          position: relative;
          overflow: hidden;
          padding: 5rem 1.25rem 4rem;
        }
        @media (min-width: 640px) {
          .about-hero { padding: 6rem 2rem 5rem; }
        }
        @media (min-width: 1024px) {
          .about-hero { padding: 7rem 2.5rem 6rem; }
        }
        .about-hero-grid {
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
        .about-hero-inner {
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
        .about-hero-h1 {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.15;
          color: var(--foreground);
          margin: 0 0 1.25rem;
        }
        .about-hero-sub {
          font-size: 1.0625rem;
          color: var(--text-muted);
          line-height: 1.8;
          margin: 0;
          max-width: 520px;
        }

        /* ── Section commons ── */
        .about-section {
          padding: 5rem 1.25rem;
        }
        @media (min-width: 640px) {
          .about-section { padding: 5rem 2rem; }
        }
        @media (min-width: 1024px) {
          .about-section { padding: 6rem 2.5rem; }
        }
        .about-section-alt {
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

        /* ── Vision Cards ── */
        .vision-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: 1fr;
          margin-top: 3rem;
        }
        @media (min-width: 640px) {
          .vision-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .vision-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .vision-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.75rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease;
        }
        .vision-card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-2px);
          border-color: var(--accent-muted);
        }
        .vision-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: var(--radius);
          background: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .vision-card-title {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--foreground);
          margin: 0 0 0.25rem;
          line-height: 1.35;
        }
        .vision-card-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.7;
          margin: 0;
        }

        /* ── Timeline ── */
        .timeline {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .timeline-year-block {
          display: grid;
          grid-template-columns: 6rem 1px 1fr;
          gap: 0 2rem;
          align-items: stretch;
        }
        @media (min-width: 640px) {
          .timeline-year-block {
            grid-template-columns: 7rem 1px 1fr;
            gap: 0 2.5rem;
          }
        }
        .timeline-year {
          font-family: var(--font-mono);
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--accent);
          padding-top: 0.125rem;
          letter-spacing: -0.02em;
          text-align: right;
          padding-right: 0;
        }
        .timeline-line {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          position: relative;
        }
        .timeline-dot {
          width: 0.625rem;
          height: 0.625rem;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
          margin-top: 0.2rem;
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .timeline-connector {
          flex: 1;
          width: 1px;
          background: var(--border);
          min-height: 1rem;
        }
        .timeline-year-block:last-child .timeline-connector {
          display: none;
        }
        .timeline-items {
          padding-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-left: 0;
        }
        .timeline-item {
          font-size: 0.9375rem;
          color: var(--text-muted);
          line-height: 1.6;
          padding: 0.5rem 0.875rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          width: fit-content;
          max-width: 100%;
          transition: border-color 150ms ease, color 150ms ease;
        }
        .timeline-item:first-child {
          margin-top: 0;
        }
        .timeline-item:hover {
          border-color: var(--accent-muted);
          color: var(--foreground);
        }

        /* ── Staff ── */
        .staff-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 560px) {
          .staff-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 860px) {
          .staff-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .staff-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          align-items: flex-start;
          transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease;
        }
        .staff-card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-2px);
          border-color: var(--accent-muted);
        }
        .staff-avatar {
          width: 3.25rem;
          height: 3.25rem;
          border-radius: 50%;
          background: var(--accent-light);
          border: 2px solid var(--accent-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: -0.02em;
          flex-shrink: 0;
        }
        .staff-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .staff-name {
          font-size: 1.0625rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--foreground);
          margin: 0;
        }
        .staff-role {
          display: inline-flex;
          align-items: center;
          padding: 0.1875rem 0.5rem;
          border-radius: 999px;
          background: var(--accent-light);
          color: var(--accent);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          width: fit-content;
        }
        .staff-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.65;
          margin: 0;
        }

        /* ── FAQ ── */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .faq-item {
          border-bottom: 1px solid var(--border);
        }
        .faq-item:last-child {
          border-bottom: none;
        }
        .faq-summary {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.375rem 1.75rem;
          cursor: pointer;
          list-style: none;
          background: var(--background);
          transition: background 150ms ease;
          user-select: none;
        }
        .faq-summary::-webkit-details-marker { display: none; }
        .faq-summary:hover {
          background: var(--surface);
        }
        .faq-q {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--foreground);
          line-height: 1.45;
          margin: 0;
        }
        .faq-chevron {
          flex-shrink: 0;
          color: var(--text-subtle);
          margin-top: 0.1rem;
          transition: transform 200ms ease;
        }
        details[open] .faq-chevron {
          transform: rotate(180deg);
        }
        details[open] .faq-summary {
          background: var(--surface);
        }
        .faq-a {
          padding: 0 1.75rem 1.375rem;
          background: var(--surface);
          font-size: 0.9375rem;
          color: var(--text-muted);
          line-height: 1.75;
          margin: 0;
          border-top: 1px solid var(--border-soft);
        }
      `}</style>

      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-grid" />
        <div className="container-page">
          <div className="about-hero-inner">
            <span className="page-eyebrow">About</span>
            <h1 className="about-hero-h1">
              코드로 연결되는<br />개발자 커뮤니티
            </h1>
            <p className="about-hero-sub">
              세미콜론은 전공·비전공 구분 없이 개발에 관심 있는 사람들이 모여
              스터디·프로젝트·행사를 통해 함께 성장하는 동아리입니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. 비전 / 하는 일 ────────────────────────────────────── */}
      <section className="about-section about-section-alt">
        <div className="container-page">
          <span className="section-label">Vision &amp; Mission</span>
          <h2 className="section-h2">우리가 추구하는 것</h2>
          <p className="section-desc">
            세미콜론은 네 가지 가치로 구성원의 성장과 연결을 만들어 갑니다.
          </p>

          <div className="vision-grid">
            <div className="vision-card">
              <div className="vision-icon"><IconCode /></div>
              <div>
                <p className="vision-card-title">함께 배우기</p>
                <p className="vision-card-desc">
                  혼자보다 같이할 때 더 빠릅니다. 주제별 스터디로 꾸준히 학습합니다.
                </p>
              </div>
            </div>
            <div className="vision-card">
              <div className="vision-icon"><IconVision /></div>
              <div>
                <p className="vision-card-title">직접 만들기</p>
                <p className="vision-card-desc">
                  아이디어를 제품으로. 팀 프로젝트를 통해 기획부터 배포까지 경험합니다.
                </p>
              </div>
            </div>
            <div className="vision-card">
              <div className="vision-icon"><IconPeople /></div>
              <div>
                <p className="vision-card-title">네트워크 넓히기</p>
                <p className="vision-card-desc">
                  다양한 배경의 사람들과 연결되어 시야를 넓히고 함께 성장합니다.
                </p>
              </div>
            </div>
            <div className="vision-card">
              <div className="vision-icon"><IconEvent /></div>
              <div>
                <p className="vision-card-title">세상에 공유하기</p>
                <p className="vision-card-desc">
                  세미나·해커톤으로 결과물을 공유하고 외부와 연결됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 연혁 ─────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="container-page">
          <span className="section-label">History</span>
          <h2 className="section-h2">걸어온 길</h2>
          <p className="section-desc">
            세미콜론이 지나온 발자취입니다.
          </p>

          <div className="timeline">
            {HISTORY.map((entry) => (
              <div key={entry.year} className="timeline-year-block">
                <span className="timeline-year">{entry.year}</span>
                <div className="timeline-line">
                  <div className="timeline-dot" />
                  <div className="timeline-connector" />
                </div>
                <div className="timeline-items">
                  {entry.items.map((item) => (
                    <span key={item} className="timeline-item">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 운영진 ───────────────────────────────────────────── */}
      <section className="about-section about-section-alt">
        <div className="container-page">
          <span className="section-label">Staff</span>
          <h2 className="section-h2">운영진 소개</h2>
          <p className="section-desc">
            세미콜론을 이끌어가는 운영진입니다.
          </p>

          <div className="staff-grid">
            {STAFF.map((member) => {
              const initials = member.name.slice(0, 2);
              return (
                <div key={member.name} className="staff-card">
                  <div className="staff-avatar" aria-hidden="true">{initials}</div>
                  <div className="staff-info">
                    <p className="staff-name">{member.name}</p>
                    <span className="staff-role">{member.role}</span>
                  </div>
                  <p className="staff-desc">{member.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ──────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="container-page">
          <span className="section-label">FAQ</span>
          <h2 className="section-h2">자주 묻는 질문</h2>
          <p className="section-desc">
            세미콜론에 대해 궁금한 점을 모았습니다.
          </p>

          <div className="faq-list">
            {FAQ.map((item) => (
              <div key={item.q} className="faq-item">
                <details>
                  <summary className="faq-summary">
                    <p className="faq-q">{item.q}</p>
                    <svg className="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </summary>
                  <p className="faq-a">{item.a}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
