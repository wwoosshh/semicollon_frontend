'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { href: '/about',      label: '소개' },
  { href: '/activities', label: '활동' },
  { href: '/posts',      label: '소식' },
  { href: '/recruit',    label: '모집' },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,1)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'background 250ms ease, border-color 250ms ease, backdrop-filter 250ms ease',
      }}
    >
      <div className="container-page">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '3.75rem',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '-0.03em',
              color: 'var(--foreground)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0,
            }}
          >
            Semicollon<span style={{ color: 'var(--accent)' }}>;</span>
          </Link>

          {/* Desktop Nav */}
          <nav
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: '0.4375rem 0.875rem',
                    borderRadius: '999px',
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    background: isActive ? 'var(--accent-light)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'color 150ms ease, background 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        'var(--foreground)';
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        'var(--surface)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        'var(--text-muted)';
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        'transparent';
                    }
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Login + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              href="/login"
              className="hidden md:inline-flex btn btn-ghost"
              style={{ padding: '0.5rem 1.125rem', fontSize: '0.9rem' }}
            >
              로그인
            </Link>

            {/* Hamburger button (mobile only) */}
            <button
              className="md:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={menuOpen}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                gap: '5px',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '20px',
                  height: '2px',
                  background: 'var(--foreground)',
                  borderRadius: '2px',
                  transition: 'transform 200ms ease, opacity 200ms ease',
                  transform: menuOpen
                    ? 'translateY(7px) rotate(45deg)'
                    : 'none',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '20px',
                  height: '2px',
                  background: 'var(--foreground)',
                  borderRadius: '2px',
                  transition: 'opacity 200ms ease',
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '20px',
                  height: '2px',
                  background: 'var(--foreground)',
                  borderRadius: '2px',
                  transition: 'transform 200ms ease, opacity 200ms ease',
                  transform: menuOpen
                    ? 'translateY(-7px) rotate(-45deg)'
                    : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className="md:hidden"
        style={{
          overflow: 'hidden',
          maxHeight: menuOpen ? '400px' : '0',
          transition: 'max-height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          borderTop: menuOpen ? '1px solid var(--border)' : 'none',
        }}
      >
        <nav style={{ padding: '0.75rem 1.25rem 1rem' }}>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      display: 'block',
                      padding: '0.6875rem 1rem',
                      borderRadius: 'var(--radius)',
                      fontSize: '1rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--accent)' : 'var(--foreground)',
                      background: isActive ? 'var(--accent-light)' : 'transparent',
                      textDecoration: 'none',
                    }}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
            <li
              style={{
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-soft)',
              }}
            >
              <Link
                href="/login"
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                로그인
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
