'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/supabase';
import type { Post } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── SVG Icons ────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 8H3M7 12l-4-4 4-4" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconNotFound() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="28" cy="28" r="22" />
      <path d="M21 21l14 14M35 21L21 35" opacity="0.5" />
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div aria-hidden="true">
      <style>{`
        .det-skel {
          border-radius: var(--radius-sm);
          background: linear-gradient(90deg, var(--surface-alt) 25%, var(--border-soft) 50%, var(--surface-alt) 75%);
          background-size: 200% 100%;
          animation: det-shimmer 1.4s infinite;
        }
        @keyframes det-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="det-skel" style={{ height: '1.125rem', width: '5rem', borderRadius: '999px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="det-skel" style={{ height: '2.25rem', width: '75%' }} />
          <div className="det-skel" style={{ height: '2.25rem', width: '50%' }} />
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', paddingTop: '0.5rem' }}>
          <div className="det-skel" style={{ height: '0.875rem', width: '6rem' }} />
          <div className="det-skel" style={{ height: '0.875rem', width: '8rem' }} />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[100, 90, 95, 70].map((w, i) => (
            <div key={i} className="det-skel" style={{ height: '1rem', width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PostDetail Component ─────────────────────────────────────
export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const token = await getAccessToken();
        const data = await api<Post>(`/posts/${id}`, { token });
        if (!cancelled) setPost(data);
      } catch (e) {
        if (!cancelled) {
          if (e instanceof ApiError && (e.status === 404 || e.status === 403)) {
            setNotFound(true);
          } else {
            setNotFound(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <>
      <style>{`
        /* ── Detail Layout ── */
        .det-wrap {
          min-height: 60vh;
          padding: 4.5rem 1.25rem 6rem;
        }
        @media (min-width: 640px) { .det-wrap { padding: 5.5rem 2rem 7rem; } }
        @media (min-width: 1024px) { .det-wrap { padding: 6rem 2.5rem 7rem; } }

        .det-inner {
          max-width: 760px;
        }

        /* Back */
        .det-back {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 2.5rem;
          transition: color 150ms ease;
          letter-spacing: -0.01em;
        }
        .det-back:hover { color: var(--accent); }

        /* Header */
        .det-header {
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .det-badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .det-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.625rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.03em;
        }
        .det-badge-notice { background: var(--accent-light); color: var(--accent); }
        .det-badge-blog { background: var(--surface-alt); color: var(--text-muted); border: 1px solid var(--border); }
        .det-badge-member { background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; }

        .det-h1 {
          font-size: clamp(1.625rem, 4.5vw, 2.625rem);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.2;
          color: var(--foreground);
          margin: 0;
        }

        .det-meta {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }
        .det-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .det-meta-item svg { flex-shrink: 0; color: var(--text-subtle); }
        .det-meta-date {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: var(--text-subtle);
          letter-spacing: 0.01em;
        }

        /* Body */
        .det-body {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .det-content {
          font-size: 1.0625rem;
          color: var(--text-muted);
          line-height: 1.9;
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
        }

        /* Images */
        .det-images {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .det-images-label {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-subtle);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .det-image-wrap {
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .det-image-wrap img {
          width: 100%;
          display: block;
          max-height: 32rem;
          object-fit: contain;
          background: var(--surface);
        }

        /* Not Found state */
        .det-nf {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          padding: 5rem 2rem;
          text-align: center;
        }
        .det-nf-icon { color: var(--text-subtle); }
        .det-nf-title {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: var(--foreground);
          margin: 0;
        }
        .det-nf-sub {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--text-subtle);
          margin: 0;
        }
        .det-nf-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4375rem;
          padding: 0.625rem 1.5rem;
          border-radius: 999px;
          border: 1.5px solid var(--border);
          color: var(--foreground);
          font-weight: 600;
          font-size: 0.9375rem;
          text-decoration: none;
          margin-top: 0.5rem;
          transition: border-color 150ms ease, background 150ms ease;
        }
        .det-nf-link:hover { background: var(--surface); border-color: var(--text-subtle); }
      `}</style>

      <div className="det-wrap">
        <div className="container-page">
          <div className="det-inner">
            <Link href="/posts" className="det-back">
              <IconBack />
              소식 목록으로
            </Link>

            {loading ? (
              <DetailSkeleton />
            ) : notFound || !post ? (
              <div className="det-nf">
                <span className="det-nf-icon"><IconNotFound /></span>
                <div>
                  <p className="det-nf-title">게시글을 찾을 수 없습니다</p>
                  <p className="det-nf-sub">// post not found or access denied</p>
                </div>
                <Link href="/posts" className="det-nf-link">
                  <IconBack />
                  목록으로 돌아가기
                </Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="det-header">
                  {/* Badges */}
                  <div className="det-badges">
                    <span className={`det-badge ${post.category === 'notice' ? 'det-badge-notice' : 'det-badge-blog'}`}>
                      {post.category === 'notice' ? '공지' : '블로그'}
                    </span>
                    {post.visibility === 'member' && (
                      <span className="det-badge det-badge-member">
                        <IconLock />
                        부원 공개
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="det-h1">{post.title}</h1>

                  {/* Meta */}
                  <div className="det-meta">
                    <span className="det-meta-item">
                      <IconUser />
                      {post.profiles?.name ?? '알 수 없음'}
                    </span>
                    <span className="det-meta-item det-meta-date">
                      <IconCalendar />
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="det-body">
                  {/* Content */}
                  {post.content && (
                    <p className="det-content">{post.content}</p>
                  )}

                  {/* Images */}
                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="det-images">
                      <p className="det-images-label">첨부 이미지</p>
                      {post.image_urls.map((url, i) => (
                        <div key={i} className="det-image-wrap">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`첨부 이미지 ${i + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
