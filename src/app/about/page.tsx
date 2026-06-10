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

const VISION = [
  { no: '01', en: 'LEARN TOGETHER', ko: '함께 배우기', body: '혼자보다 같이할 때 더 빠릅니다. 주제별 스터디로 꾸준히 학습합니다.' },
  { no: '02', en: 'BUILD THINGS',   ko: '직접 만들기',  body: '아이디어를 제품으로. 팀 프로젝트를 통해 기획부터 배포까지 경험합니다.' },
  { no: '03', en: 'CONNECT PEOPLE', ko: '네트워크 넓히기', body: '다양한 배경의 사람들과 연결되어 시야를 넓히고 함께 성장합니다.' },
  { no: '04', en: 'SHARE OUTPUT',   ko: '세상에 공유하기', body: '세미나·해커톤으로 결과물을 공유하고 외부와 연결됩니다.' },
];

// ─── Page ─────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      <style>{`
        /* ── 페이지 헤더 ── */
        .ab-hero {
          border-bottom: 1px solid var(--ink);
        }
        .ab-hero-inner {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 44vh;
        }
        @media (min-width: 900px) {
          .ab-hero-inner {
            grid-template-columns: 1fr 220px;
          }
        }
        .ab-hero-main {
          padding: 4rem 0 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          border-bottom: 1px solid var(--hairline);
        }
        @media (min-width: 900px) {
          .ab-hero-main {
            border-bottom: none;
            border-right: 1px solid var(--hairline);
            padding-right: 3rem;
          }
        }
        .ab-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--vermilion);
          margin-bottom: 1.5rem;
        }
        .ab-h1 {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(2.25rem, 6vw, 4rem);
          line-height: 1.18;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0 0 1.5rem;
        }
        .ab-lead {
          max-width: 36rem;
          font-size: 1.0625rem;
          line-height: 1.85;
          color: var(--ink-soft);
          margin: 0;
        }
        /* 우측 판권면 칼럼 */
        .ab-meta {
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 900px) {
          .ab-meta {
            padding-left: 2rem;
            padding-top: 4rem;
          }
        }
        .ab-meta-row {
          padding: 0.9rem 0;
          border-bottom: 1px solid var(--hairline-soft);
        }
        .ab-meta-row:last-child { border-bottom: none; }
        .ab-meta-k {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-faint);
          display: block;
          margin-bottom: 0.2rem;
        }
        .ab-meta-v {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--ink);
        }

        /* ── 섹션 공통 ── */
        .ab-sec {
          border-bottom: 1px solid var(--ink);
        }
        .ab-sec-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 0;
          border-bottom: 1px solid var(--hairline);
        }
        .ab-sec-body {
          padding: 3rem 0 4rem;
        }

        /* ── 01 비전 ── */
        .vision-grid {
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .vision-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .vision-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .vision-col {
          padding: 2rem 0;
          border-bottom: 1px solid var(--hairline-soft);
          transition: background 160ms ease;
        }
        @media (min-width: 640px) {
          .vision-col {
            border-bottom: none;
            border-right: 1px solid var(--hairline);
            padding: 2rem 2rem 2rem 0;
          }
          .vision-col:nth-child(2) { padding-left: 2rem; }
          .vision-col:nth-child(4) {
            border-right: none;
            padding-left: 2rem;
          }
        }
        @media (min-width: 1024px) {
          .vision-col {
            padding: 2.25rem 2.25rem 2.25rem 0;
          }
          .vision-col:not(:first-child) { padding-left: 2.25rem; }
          .vision-col:last-child { border-right: none; }
        }
        .vision-no {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          color: var(--vermilion);
          margin-bottom: 1.1rem;
        }
        .vision-en {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-faint);
          margin-bottom: 0.3rem;
        }
        .vision-ko {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.3rem;
          color: var(--ink);
          margin: 0 0 0.875rem;
        }
        .vision-body {
          font-size: 0.9rem;
          line-height: 1.85;
          color: var(--ink-soft);
          margin: 0;
        }

        /* ── 02 연혁: 색인 테이블 ── */
        .history-table {
          width: 100%;
          border-collapse: collapse;
        }
        .history-year-row td {
          padding: 1.75rem 0 0.5rem;
          vertical-align: top;
        }
        .history-year-row:first-child td {
          padding-top: 0.5rem;
        }
        .history-year {
          font-family: var(--font-mono);
          font-weight: 600;
          font-size: 0.92rem;
          color: var(--vermilion);
          letter-spacing: 0.06em;
          width: 5rem;
          padding-right: 2rem;
          padding-top: 0.2rem;
          white-space: nowrap;
        }
        .history-items {
          border-top: 1px solid var(--hairline);
          padding-top: 0;
        }
        .history-item-row {
          display: grid;
          grid-template-columns: 1.5rem 1fr;
          gap: 0.75rem;
          align-items: baseline;
          padding: 0.6rem 0;
          border-bottom: 1px solid var(--hairline-soft);
        }
        .history-item-row:last-child { border-bottom: none; }
        .history-bullet {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          color: var(--ink-faint);
          letter-spacing: 0;
        }
        .history-text {
          font-size: 0.9375rem;
          color: var(--ink-soft);
          line-height: 1.6;
        }

        /* ── 03 운영진: 색인 명단 ── */
        .staff-table {
          width: 100%;
        }
        .staff-row {
          display: grid;
          grid-template-columns: 2rem 1fr auto;
          align-items: baseline;
          gap: 1.5rem;
          padding: 1.1rem 0.5rem;
          border-bottom: 1px solid var(--hairline);
          transition: background 140ms ease;
        }
        .staff-row:last-child { border-bottom: none; }
        .staff-row:hover { background: var(--ink); }
        .staff-idx {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--ink-faint);
          letter-spacing: 0.06em;
          transition: color 140ms ease;
        }
        .staff-row:hover .staff-idx { color: var(--vermilion); }
        .staff-name-cell {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          min-width: 0;
        }
        .staff-name {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--ink);
          transition: color 140ms ease;
          white-space: nowrap;
        }
        .staff-row:hover .staff-name { color: var(--paper); }
        .staff-desc {
          font-size: 0.875rem;
          color: var(--ink-soft);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 140ms ease;
        }
        .staff-row:hover .staff-desc { color: rgba(246,244,238,0.55); }
        .staff-role-tag {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--vermilion);
          white-space: nowrap;
          transition: color 140ms ease;
        }
        .staff-row:hover .staff-role-tag { color: var(--vermilion); }

        /* ── 04 FAQ: 괘선 행 ── */
        .faq-item {
          border-bottom: 1px solid var(--hairline);
        }
        .faq-item:last-child { border-bottom: none; }
        .faq-summary {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1.2rem 0.5rem 1.2rem 0;
          cursor: pointer;
          list-style: none;
          user-select: none;
          transition: background 140ms ease;
        }
        .faq-summary::-webkit-details-marker { display: none; }
        .faq-summary:hover { background: var(--paper-deep); }
        .faq-summary-inner {
          display: flex;
          align-items: baseline;
          gap: 1.25rem;
          flex: 1;
          min-width: 0;
        }
        .faq-q-no {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          color: var(--vermilion);
          flex-shrink: 0;
        }
        .faq-q {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--ink);
          line-height: 1.45;
          margin: 0;
        }
        .faq-toggle {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: var(--ink-faint);
          flex-shrink: 0;
          line-height: 1;
          transition: transform 200ms ease, color 200ms ease;
          padding-right: 0.5rem;
        }
        details[open] .faq-toggle {
          transform: rotate(45deg);
          color: var(--vermilion);
        }
        .faq-answer {
          padding: 0 0.5rem 1.5rem 2.5rem;
          font-size: 0.9375rem;
          color: var(--ink-soft);
          line-height: 1.8;
          margin: 0;
          border-top: 1px solid var(--hairline-soft);
          padding-top: 1rem;
        }
      `}</style>

      {/* ── 페이지 헤더 ───────────────────────────────────────── */}
      <section className="ab-hero">
        <div className="container-page">
          <div className="ab-hero-inner">
            <div className="ab-hero-main">
              <p className="ab-eyebrow rise rise-1">{'// ABOUT — SEMICOLLON'}</p>
              <h1 className="ab-h1 rise rise-2">
                코드로 연결되는<br />개발자 커뮤니티
              </h1>
              <p className="ab-lead rise rise-3">
                세미콜론은 전공·비전공 구분 없이 개발에 관심 있는 사람들이 모여
                스터디·프로젝트·행사를 통해 함께 성장하는 동아리입니다.
              </p>
            </div>
            <aside className="ab-meta rise rise-4">
              <div className="ab-meta-row">
                <span className="ab-meta-k">Founded</span>
                <span className="ab-meta-v">2024</span>
              </div>
              <div className="ab-meta-row">
                <span className="ab-meta-k">Field</span>
                <span className="ab-meta-v">SOFTWARE</span>
              </div>
              <div className="ab-meta-row">
                <span className="ab-meta-k">Activity</span>
                <span className="ab-meta-v">스터디 / 프로젝트</span>
              </div>
              <div className="ab-meta-row">
                <span className="ab-meta-k">Open To</span>
                <span className="ab-meta-v">전공 무관</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── 01 비전 ──────────────────────────────────────────────── */}
      <section className="ab-sec">
        <div className="container-page">
          <div className="ab-sec-head">
            <span className="section-label">
              <span className="no">01</span> 우리가 추구하는 것
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
              Vision &amp; Mission
            </span>
          </div>
          <div className="ab-sec-body">
            <div className="vision-grid">
              {VISION.map((v) => (
                <div key={v.no} className="vision-col">
                  <div className="vision-no">{v.no}</div>
                  <div className="vision-en">{v.en}</div>
                  <h2 className="vision-ko">{v.ko}</h2>
                  <p className="vision-body">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 연혁 ──────────────────────────────────────────────── */}
      <section className="ab-sec">
        <div className="container-page">
          <div className="ab-sec-head">
            <span className="section-label">
              <span className="no">02</span> 걸어온 길
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
              History
            </span>
          </div>
          <div className="ab-sec-body" style={{ paddingBottom: '2.5rem' }}>
            <table className="history-table">
              <tbody>
                {HISTORY.map((entry) => (
                  <tr key={entry.year} className="history-year-row">
                    <td className="history-year">{entry.year}</td>
                    <td className="history-items">
                      {entry.items.map((item, idx) => (
                        <div key={item} className="history-item-row">
                          <span className="history-bullet" aria-hidden="true">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="history-text">{item}</span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 03 운영진 ─────────────────────────────────────────────── */}
      <section className="ab-sec">
        <div className="container-page">
          <div className="ab-sec-head">
            <span className="section-label">
              <span className="no">03</span> 운영진 소개
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
              Staff
            </span>
          </div>
          <div className="ab-sec-body" style={{ paddingBottom: '1rem' }}>
            <div className="staff-table">
              {STAFF.map((member, idx) => (
                <div key={member.name} className="staff-row">
                  <span className="staff-idx">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="staff-name-cell">
                    <span className="staff-name">{member.name}</span>
                    <span className="staff-desc">{member.desc}</span>
                  </div>
                  <span className="staff-role-tag">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 FAQ ────────────────────────────────────────────────── */}
      <section className="ab-sec" style={{ borderBottom: 'none' }}>
        <div className="container-page">
          <div className="ab-sec-head">
            <span className="section-label">
              <span className="no">04</span> 자주 묻는 질문
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
              FAQ
            </span>
          </div>
          <div className="ab-sec-body" style={{ paddingTop: '0.5rem' }}>
            {FAQ.map((item, idx) => (
              <div key={item.q} className="faq-item">
                <details>
                  <summary className="faq-summary">
                    <div className="faq-summary-inner">
                      <span className="faq-q-no">Q{String(idx + 1).padStart(2, '0')}</span>
                      <p className="faq-q">{item.q}</p>
                    </div>
                    <span className="faq-toggle" aria-hidden="true">+</span>
                  </summary>
                  <p className="faq-answer">{item.a}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
