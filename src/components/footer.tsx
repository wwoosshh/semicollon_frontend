import Link from 'next/link';

const NAV = [
  { href: '/about',      no: '01', label: '소개' },
  { href: '/activities', no: '02', label: '활동' },
  { href: '/posts',      no: '03', label: '소식' },
  { href: '/recruit',    no: '04', label: '모집' },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ink-block" style={{ marginTop: 'auto' }}>
      <style>{`
        .ft-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          padding: 3.5rem 0 2.5rem;
        }
        @media (min-width: 768px) {
          .ft-grid {
            grid-template-columns: 1.4fr 1fr 1fr;
            gap: 2rem;
          }
        }
        .ft-wordmark {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(2rem, 5vw, 2.75rem);
          letter-spacing: -0.01em;
          color: var(--paper);
          line-height: 1.1;
        }
        .ft-wordmark .semi {
          font-family: var(--font-mono);
          color: var(--vermilion);
        }
        .ft-tag {
          margin-top: 0.875rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          color: rgba(246, 244, 238, 0.55);
        }
        .ft-h {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--vermilion);
          margin-bottom: 1rem;
        }
        .ft-link {
          display: flex;
          align-items: baseline;
          gap: 0.625rem;
          padding: 0.375rem 0;
          font-size: 0.95rem;
          color: rgba(246, 244, 238, 0.85);
          text-decoration: none;
          transition: color 140ms ease;
          width: fit-content;
        }
        .ft-link .no {
          font-family: var(--font-mono);
          font-size: 0.66rem;
          color: rgba(246, 244, 238, 0.4);
        }
        .ft-link:hover { color: var(--vermilion); }
        .ft-colophon {
          border-top: 1px solid rgba(246, 244, 238, 0.18);
          padding: 1.25rem 0 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 2rem;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          color: rgba(246, 244, 238, 0.45);
        }
      `}</style>

      <div className="container-page">
        <div className="ft-grid">
          <div>
            <div className="ft-wordmark">
              세미콜론<span className="semi">;</span>
            </div>
            <p className="ft-tag">PROGRAMMING CLUB — SEMICOLLON</p>
          </div>

          <nav>
            <div className="ft-h">Index</div>
            {NAV.map(({ href, no, label }) => (
              <Link key={href} href={href} className="ft-link">
                <span className="no">{no}</span>
                {label}
              </Link>
            ))}
          </nav>

          <div>
            <div className="ft-h">Elsewhere</div>
            <a
              href="https://github.com/wwoosshh"
              target="_blank"
              rel="noopener noreferrer"
              className="ft-link"
            >
              <span className="no">↗</span>
              GitHub
            </a>
            <Link href="/recruit/apply" className="ft-link">
              <span className="no">↗</span>
              지원하기
            </Link>
          </div>
        </div>

        <div className="ft-colophon">
          <span>&copy; {year} SEMICOLLON. ALL RIGHTS RESERVED.</span>
          <span>SET IN NOTO SERIF KR &amp; IBM PLEX MONO</span>
        </div>
      </div>
    </footer>
  );
}
