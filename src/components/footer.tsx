import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        marginTop: 'auto',
      }}
    >
      <style>{`
        .footer-link {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 150ms ease;
        }
        .footer-link:hover {
          color: var(--foreground);
        }
        .footer-github {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.9rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 150ms ease;
        }
        .footer-github:hover {
          color: var(--foreground);
        }
      `}</style>

      <div className="container-page">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            padding: '2.5rem 0',
          }}
        >
          {/* Top row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
            className="sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Logo */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '1.0625rem',
                letterSpacing: '-0.03em',
                color: 'var(--foreground)',
              }}
            >
              Semicollon<span style={{ color: 'var(--accent)' }}>;</span>
            </span>

            {/* Links */}
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
              }}
            >
              {[
                { href: '/about',      label: '소개' },
                { href: '/activities', label: '활동' },
                { href: '/posts',      label: '소식' },
                { href: '/recruit',    label: '모집' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="footer-link">
                  {label}
                </Link>
              ))}

              <a
                href="https://github.com/wwoosshh/semicollon_frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-github"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            </nav>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border)' }} />

          {/* Copyright */}
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-subtle)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            &copy; {year} 세미콜론 동아리 (Semicollon). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
