'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/supabase';
import type { Post } from '@/lib/types';
import Comments from './Comments';

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// ─── Loading Skeleton (print-tone) ────────────────────────────
function DetailSkeleton() {
  return (
    <div aria-hidden="true">
      <style>{`
        .det-load-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--hairline);
        }
        .det-load-bar {
          height: 1px;
          background: var(--hairline);
          flex: 1;
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '2rem' }}>
        <div className="det-load-row">
          <div className="det-load-bar" />
          <div className="loading-line">{'// loading'}</div>
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="det-load-row">
            <div className="det-load-bar" />
          </div>
        ))}
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
          padding: 3.5rem 0 6rem;
        }

        .det-inner {
          max-width: 760px;
        }

        /* ── Back link ── */
        .det-back {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-soft);
          text-decoration: none;
          margin-bottom: 3rem;
          transition: color 140ms ease;
        }
        .det-back:hover { color: var(--vermilion); }

        /* ── Post header ── */
        .det-header {
          margin-bottom: 2.5rem;
        }

        /* Meta line: date · author · category · MEMBER */
        .det-meta-line {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .det-meta-date {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          color: var(--ink-faint);
        }
        .det-meta-sep {
          font-family: var(--font-mono);
          font-size: 0.55rem;
          color: var(--hairline);
          user-select: none;
        }
        .det-meta-author {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
        }
        .det-meta-cat {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--vermilion);
        }
        .det-meta-member {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--vermilion);
          border: 1px solid var(--vermilion);
          padding: 0.15rem 0.375rem;
          line-height: 1.4;
        }

        /* Title */
        .det-h1 {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(1.75rem, 5vw, 3rem);
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0 0 1.75rem;
        }

        /* Hairline rule below header */
        .det-rule {
          border: 0;
          border-top: 1px solid var(--ink);
          margin: 0;
        }

        /* ── Body ── */
        .det-body {
          padding-top: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .det-content {
          font-family: var(--font-sans);
          font-size: 1.0625rem;
          color: var(--ink-soft);
          line-height: 1.9;
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
        }

        /* ── Images —괘선 프레임, 직각 ── */
        .det-images {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .det-images-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-faint);
          margin-bottom: 0.5rem;
        }
        .det-image-frame {
          border: 1px solid var(--hairline);
          overflow: hidden;
        }
        .det-image-frame img {
          width: 100%;
          display: block;
          max-height: 32rem;
          object-fit: contain;
          background: var(--paper-deep);
        }

        /* ── Not Found ── */
        .det-nf {
          padding: 4rem 0;
        }
        .det-nf-code {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          letter-spacing: 0.04em;
          color: var(--ink-faint);
          margin: 0 0 2rem;
        }
        .det-nf-link {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-soft);
          text-decoration: none;
          transition: color 140ms ease;
        }
        .det-nf-link:hover { color: var(--vermilion); }
      `}</style>

      <div className="det-wrap">
        <div className="container-page">
          <div className="det-inner">
            <Link href="/posts" className="det-back">
              ← INDEX
            </Link>

            {loading ? (
              <DetailSkeleton />
            ) : notFound || !post ? (
              <div className="det-nf">
                <p className="det-nf-code">{'// 게시글을 찾을 수 없습니다'}</p>
                <Link href="/posts" className="det-nf-link">← INDEX</Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="det-header">
                  {/* Meta line */}
                  <div className="det-meta-line">
                    <span className="det-meta-date">{formatDate(post.created_at)}</span>
                    <span className="det-meta-sep" aria-hidden="true">◆</span>
                    <span className="det-meta-author">
                      {(post.profiles?.name ?? '알 수 없음').toLowerCase()}
                    </span>
                    <span className="det-meta-sep" aria-hidden="true">◆</span>
                    <span className="det-meta-cat">
                      {post.category === 'notice' ? 'NOTICE' : 'BLOG'}
                    </span>
                    {post.visibility === 'member' && (
                      <>
                        <span className="det-meta-sep" aria-hidden="true">◆</span>
                        <span className="det-meta-member">MEMBER</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="det-h1">{post.title}</h1>

                  {/* Hairline separator */}
                  <hr className="det-rule" />
                </div>

                {/* Body */}
                <div className="det-body">
                  {post.content && (
                    <p className="det-content">{post.content}</p>
                  )}

                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="det-images">
                      <p className="det-images-label">// 첨부 이미지</p>
                      {post.image_urls.map((url, i) => (
                        <div key={i} className="det-image-frame">
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

                {/* Comments — rendered only when post is loaded */}
                <Comments postId={id} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
