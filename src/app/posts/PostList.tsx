'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import type { PostSummary } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────
const TABS = [
  { key: '', label: '전체', mono: 'all' },
  { key: 'notice', label: '공지', mono: 'notice' },
  { key: 'blog', label: '블로그', mono: 'blog' },
] as const;

type CategoryKey = '' | 'notice' | 'blog';

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// ─── SVG Icons ────────────────────────────────────────────────
function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconEmpty() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="8" width="32" height="32" rx="5" />
      <path d="M16 18h16M16 24h10M16 30h8" opacity="0.35" />
    </svg>
  );
}

function IconAlertTriangle() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 7L4 41h40L24 7z" />
      <line x1="24" y1="21" x2="24" y2="29" />
      <circle cx="24" cy="35" r="1" fill="currentColor" />
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

// ─── Skeleton ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="post-card post-card-skeleton"
      aria-hidden="true"
    >
      <div className="skel skel-badge" />
      <div className="skel skel-title" />
      <div className="skel skel-title skel-title-short" />
      <div className="skel skel-meta" />
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────
function PostCard({ post }: { post: PostSummary }) {
  const isNotice = post.category === 'notice';
  const isMember = post.visibility === 'member';
  const authorName = post.profiles?.name ?? '알 수 없음';

  return (
    <Link href={`/posts/${post.id}`} className="post-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      {/* Badges row */}
      <div className="post-card-badges">
        <span className={`post-badge ${isNotice ? 'post-badge-notice' : 'post-badge-blog'}`}>
          {isNotice ? '공지' : '블로그'}
        </span>
        {isMember && (
          <span className="post-badge post-badge-member">
            <IconLock />
            부원 공개
          </span>
        )}
      </div>

      {/* Title */}
      <p className="post-card-title">{post.title}</p>

      {/* Footer: author + date */}
      <div className="post-card-footer">
        <span className="post-card-author">{authorName}</span>
        <span className="post-card-date">{formatDate(post.created_at)}</span>
      </div>
    </Link>
  );
}

// ─── PostList Component ───────────────────────────────────────
export default function PostList() {
  const [category, setCategory] = useState<CategoryKey>('');
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchPosts = useCallback(async (cat: CategoryKey) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const path = cat ? `/posts?category=${cat}` : '/posts';
      const data = await api<PostSummary[]>(path, { token });
      setPosts(data);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(`서버 오류가 발생했습니다. (${e.status})`);
      } else {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(category);
  }, [category, fetchPosts]);

  return (
    <>
      <style>{`
        /* ── Hero ── */
        .posts-hero {
          position: relative;
          overflow: hidden;
          padding: 5rem 1.25rem 3.5rem;
        }
        @media (min-width: 640px) {
          .posts-hero { padding: 6rem 2rem 4rem; }
        }
        @media (min-width: 1024px) {
          .posts-hero { padding: 7rem 2.5rem 5rem; }
        }
        .posts-hero-grid {
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
        .posts-hero-inner {
          position: relative;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .posts-hero-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .posts-eyebrow {
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
        .posts-hero-h1 {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.15;
          color: var(--foreground);
          margin: 0 0 1rem;
        }
        .posts-hero-sub {
          font-size: 1.0625rem;
          color: var(--text-muted);
          line-height: 1.8;
          margin: 0;
          max-width: 480px;
        }
        .posts-write-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4375rem;
          padding: 0.5625rem 1.25rem;
          border-radius: 999px;
          background: var(--accent);
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: background 150ms ease, box-shadow 150ms ease, transform 100ms ease;
          box-shadow: 0 2px 8px rgb(79 70 229 / 0.22);
          flex-shrink: 0;
          align-self: flex-start;
        }
        .posts-write-btn:hover {
          background: var(--accent-hover);
          box-shadow: 0 4px 14px rgb(79 70 229 / 0.33);
        }
        .posts-write-btn:active { transform: translateY(1px); }

        /* ── Filter Tabs ── */
        .posts-tabs-wrap {
          border-bottom: 1px solid var(--border);
          background: var(--background);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .posts-tabs {
          display: flex;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-inline: 1.25rem;
          max-width: 1140px;
          margin-inline: auto;
        }
        .posts-tabs::-webkit-scrollbar { display: none; }
        @media (min-width: 640px) { .posts-tabs { padding-inline: 2rem; } }
        @media (min-width: 1024px) { .posts-tabs { padding-inline: 2.5rem; } }
        .posts-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.9375rem 0.75rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-muted);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          white-space: nowrap;
          transition: color 150ms ease, border-color 150ms ease;
          letter-spacing: -0.01em;
          font-family: var(--font-sans);
        }
        .posts-tab:hover { color: var(--foreground); }
        .posts-tab-active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        .posts-tab-mono {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          opacity: 0.6;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        /* ── Cards Section ── */
        .posts-section {
          padding: 3rem 1.25rem 5rem;
        }
        @media (min-width: 640px) { .posts-section { padding: 3.5rem 2rem 5.5rem; } }
        @media (min-width: 1024px) { .posts-section { padding: 4rem 2.5rem 6rem; } }

        /* Grid */
        .posts-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 560px) { .posts-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .posts-grid { grid-template-columns: repeat(3, 1fr); } }

        /* ── Post Card ── */
        .post-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease;
          cursor: pointer;
        }
        .post-card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-2px);
          border-color: var(--accent-muted);
        }
        .post-card-badges {
          display: flex;
          align-items: center;
          gap: 0.4375rem;
          flex-wrap: wrap;
        }
        .post-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.5625rem;
          border-radius: 999px;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }
        .post-badge-notice {
          background: var(--accent-light);
          color: var(--accent);
        }
        .post-badge-blog {
          background: var(--surface-alt);
          color: var(--text-muted);
          border: 1px solid var(--border);
        }
        .post-badge-member {
          background: #eef2ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
        }
        .post-card-title {
          font-size: 0.9375rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--foreground);
          line-height: 1.5;
          margin: 0;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .post-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-top: auto;
          flex-wrap: wrap;
        }
        .post-card-author {
          font-size: 0.8125rem;
          color: var(--text-muted);
          font-weight: 500;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .post-card-date {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-subtle);
          flex-shrink: 0;
          letter-spacing: 0.01em;
        }

        /* ── Skeleton ── */
        .post-card-skeleton {
          pointer-events: none;
        }
        .skel {
          border-radius: var(--radius-sm);
          background: linear-gradient(90deg, var(--surface-alt) 25%, var(--border-soft) 50%, var(--surface-alt) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skel-badge { height: 1.375rem; width: 3.5rem; border-radius: 999px; }
        .skel-title { height: 1rem; width: 90%; margin-top: 0.25rem; }
        .skel-title-short { width: 60%; }
        .skel-meta { height: 0.75rem; width: 45%; margin-top: 0.25rem; }

        /* ── Empty + Error states ── */
        .posts-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 5rem 2rem;
          border: 1.5px dashed var(--border);
          border-radius: var(--radius-lg);
          text-align: center;
        }
        .posts-state-icon { color: var(--text-subtle); }
        .posts-state-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-muted);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .posts-state-sub {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: var(--text-subtle);
          margin: 0;
          letter-spacing: 0.01em;
        }
        .posts-state-error { border-color: #fecaca; }
        .posts-state-error .posts-state-icon { color: #f87171; }
        .posts-state-error .posts-state-title { color: #dc2626; }
        .posts-state-error .posts-state-sub { color: #f87171; }
        .posts-retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1.125rem;
          border-radius: 999px;
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: background 150ms ease;
          margin-top: 0.5rem;
        }
        .posts-retry-btn:hover { background: #fecaca; }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="posts-hero">
        <div className="posts-hero-grid" />
        <div className="container-page">
          <div className="posts-hero-inner">
            <span className="posts-eyebrow">Board</span>
            <div className="posts-hero-header">
              <div>
                <h1 className="posts-hero-h1">소식</h1>
                <p className="posts-hero-sub">
                  세미콜론의 공지와 블로그 글을 모아봅니다.
                </p>
              </div>
              {isLoggedIn && (
                <Link href="/posts/new" className="posts-write-btn">
                  <IconEdit />
                  글쓰기
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter Tabs ─────────────────────────────────────────── */}
      <div className="posts-tabs-wrap">
        <nav className="posts-tabs" aria-label="게시판 카테고리 필터">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`posts-tab${category === tab.key ? ' posts-tab-active' : ''}`}
              onClick={() => setCategory(tab.key as CategoryKey)}
              aria-pressed={category === tab.key}
              type="button"
            >
              {tab.label}
              <span className="posts-tab-mono">{tab.mono}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ── Posts Grid ──────────────────────────────────────────── */}
      <section className="posts-section">
        <div className="container-page">
          <div className="posts-grid">
            {loading ? (
              // Skeleton placeholders
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : error ? (
              <div className="posts-state posts-state-error">
                <span className="posts-state-icon">
                  <IconAlertTriangle />
                </span>
                <div>
                  <p className="posts-state-title">불러오지 못했습니다</p>
                  <p className="posts-state-sub">{error}</p>
                </div>
                <button
                  className="posts-retry-btn"
                  onClick={() => fetchPosts(category)}
                  type="button"
                >
                  다시 시도
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="posts-state">
                <span className="posts-state-icon">
                  <IconEmpty />
                </span>
                <div>
                  <p className="posts-state-title">게시글이 없어요</p>
                  <p className="posts-state-sub">// no posts found</p>
                </div>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
