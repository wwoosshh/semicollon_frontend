'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';

const NAV_LINKS = [
  { href: '/about',      no: '01', label: '소개' },
  { href: '/activities', no: '02', label: '활동' },
  { href: '/posts',      no: '03', label: '소식' },
  { href: '/recruit',    no: '04', label: '모집' },
] as const;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { session, profile, loading, signOut } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const displayName = profile?.name ?? session?.user?.email ?? '';

  return (
    <header className="site-header">
      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--paper);
          border-bottom: 1px solid var(--ink);
        }
        .hd-row {
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          height: 3.5rem;
        }
        .hd-logo {
          display: flex;
          align-items: center;
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: 1.1875rem;
          letter-spacing: -0.01em;
          color: var(--ink);
          text-decoration: none;
        }
        .hd-logo .semi {
          font-family: var(--font-mono);
          color: var(--vermilion);
          margin-left: 1px;
        }
        .hd-nav {
          align-items: stretch;
        }
        .hd-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0 1.1rem;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--ink-soft);
          border-left: 1px solid var(--hairline-soft);
          transition: background 140ms ease, color 140ms ease;
        }
        .hd-link:last-child {
          border-right: 1px solid var(--hairline-soft);
        }
        .hd-link .no {
          font-size: 0.66rem;
          color: var(--ink-faint);
          transition: color 140ms ease;
        }
        .hd-link:hover {
          background: var(--ink);
          color: var(--paper);
        }
        .hd-link:hover .no { color: var(--vermilion); }
        .hd-link.active {
          color: var(--ink);
          box-shadow: inset 0 -2px 0 var(--vermilion);
        }
        .hd-link.active .no { color: var(--vermilion); }
        .hd-auth {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }
        .hd-user {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--ink-soft);
          white-space: nowrap;
          max-width: 9rem;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hd-authlink {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink);
          text-decoration: none;
          border: 1px solid var(--ink);
          border-radius: var(--radius);
          padding: 0.45rem 0.9rem;
          background: transparent;
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease;
        }
        .hd-authlink:hover {
          background: var(--ink);
          color: var(--paper);
        }
        .hd-burger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 2.5rem;
          height: 2.5rem;
          align-self: center;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          gap: 5px;
        }
        .hd-burger span {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--ink);
          transition: transform 200ms ease, opacity 200ms ease;
        }
        .hd-drawer {
          overflow: hidden;
          transition: max-height 300ms cubic-bezier(0.4, 0, 0.2, 1);
          border-top: 1px solid var(--hairline);
          background: var(--paper);
        }
        .hd-drawer-link {
          display: flex;
          align-items: baseline;
          gap: 0.875rem;
          padding: 1rem 0.25rem;
          border-bottom: 1px solid var(--hairline-soft);
          text-decoration: none;
        }
        .hd-drawer-link .no {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--vermilion);
        }
        .hd-drawer-link .label {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--ink);
        }
        .hd-drawer-link.active .label {
          color: var(--vermilion);
        }
      `}</style>

      <div className="container-page">
        <div className="hd-row">
          {/* Logo */}
          <Link href="/" className="hd-logo">
            세미콜론<span className="semi">;</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hd-nav hidden md:flex">
            {NAV_LINKS.map(({ href, no, label }) => (
              <Link
                key={href}
                href={href}
                className={`hd-link${pathname.startsWith(href) ? ' active' : ''}`}
              >
                <span className="no">{no}</span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: auth + hamburger */}
          <div className="hd-auth">
            {!loading &&
              (session ? (
                <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
                  <span className="hd-user">{displayName}</span>
                  <button onClick={handleSignOut} className="hd-authlink" type="button">
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hd-authlink hidden md:inline-flex">
                  로그인
                </Link>
              ))}

            <button
              className="hd-burger md:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={menuOpen}
            >
              <span style={{ transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ opacity: menuOpen ? 0 : 1 }} />
              <span style={{ transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className="hd-drawer md:hidden" style={{ maxHeight: menuOpen ? '480px' : '0' }}>
        <nav className="container-page" style={{ padding: '0.5rem 1.25rem 1.25rem' }}>
          {NAV_LINKS.map(({ href, no, label }) => (
            <Link
              key={href}
              href={href}
              className={`hd-drawer-link${pathname.startsWith(href) ? ' active' : ''}`}
            >
              <span className="no">{no}</span>
              <span className="label">{label}</span>
            </Link>
          ))}
          <div style={{ paddingTop: '1rem' }}>
            {!loading &&
              (session ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="hd-user">{displayName}</span>
                  <button onClick={handleSignOut} className="hd-authlink" type="button">
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hd-authlink"
                  style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}
                >
                  로그인
                </Link>
              ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
