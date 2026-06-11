'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import type { PostSummary } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────
const TABS = [
  { key: '', label: '전체', mono: 'ALL' },
  { key: 'notice', label: '공지', mono: 'NOTICE' },
  { key: 'blog', label: '블로그', mono: 'BLOG' },
] as const;

type CategoryKey = '' | 'notice' | 'blog';

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// ─── Post Row ─────────────────────────────────────────────────
function PostRow({ post }: { post: PostSummary }) {
  const isNotice = post.category === 'notice';
  const isMember = post.visibility === 'member';
  const authorName = post.profiles?.name ?? '알 수 없음';

  return (
    <Link href={`/posts/${post.id}`} className="post-row vt-rise" style={{ textDecoration: 'none', color: 'inherit' }}>
      <span className="post-row-date">{formatDate(post.created_at)}</span>
      <span className="post-row-author">{authorName.toLowerCase()}</span>
      <span className="post-row-title">{post.title}</span>
      <span className="post-row-right">
        {isMember && (
          <span className="post-row-member">MEMBER</span>
        )}
        <span className="post-row-cat">{isNotice ? 'NOTICE' : 'BLOG'}</span>
      </span>
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
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        const path = category ? `/posts?category=${category}` : '/posts';
        const data = await api<PostSummary[]>(path, { token });
        if (!ignore) setPosts(data);
      } catch (e) {
        if (!ignore) {
          if (e instanceof ApiError) {
            setError(`서버 오류가 발생했습니다. (${e.status})`);
          } else {
            setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
          }
          setPosts([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [category]);

  return (
    <>
      <style>{`
        /* ── Page Header ── */
        .posts-hero {
          border-bottom: 1px solid var(--ink);
        }
        .posts-hero-inner {
          padding: 3.5rem 0 3rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        @media (min-width: 900px) {
          .posts-hero-inner {
            grid-template-columns: 1fr 220px;
            align-items: end;
          }
        }
        .posts-hero-main {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .posts-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--vermilion);
          margin-bottom: 1.25rem;
        }
        .posts-hero-h1 {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(2.25rem, 6vw, 3.75rem);
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0;
        }

        /* Page-level meta (right column) */
        .posts-hero-meta {
          display: none;
        }
        @media (min-width: 900px) {
          .posts-hero-meta {
            display: flex;
            flex-direction: column;
            border-left: 1px solid var(--hairline);
            padding-left: 2rem;
            padding-bottom: 0.25rem;
            gap: 0;
          }
        }
        .posts-meta-row {
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--hairline-soft);
        }
        .posts-meta-row:last-child { border-bottom: none; }
        .posts-meta-k {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-faint);
          display: block;
          margin-bottom: 0.15rem;
        }
        .posts-meta-v {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--ink);
        }

        /* ── Filter Tabs ── */
        .posts-tabs-wrap {
          border-bottom: 1px solid var(--ink);
          background: var(--paper);
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
        }
        .posts-tabs::-webkit-scrollbar { display: none; }
        .posts-tab {
          display: inline-flex;
          align-items: center;
          padding: 0.9rem 0;
          margin-right: 2rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-faint);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          white-space: nowrap;
          transition: color 140ms ease, border-color 140ms ease;
        }
        .posts-tab:hover { color: var(--ink); }
        .posts-tab-active {
          color: var(--ink);
          border-bottom-color: var(--vermilion);
        }

        /* ── List Section ── */
        .posts-list-section {
          padding-bottom: 5rem;
        }
        .posts-list-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 0;
          border-bottom: 1px solid var(--hairline);
        }
        .posts-list-count {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-faint);
        }

        /* ── Post Row (archive index style) ── */
        .post-row {
          display: grid;
          grid-template-columns: 7rem auto 1fr auto;
          align-items: baseline;
          gap: 1rem;
          padding: 1.1rem 0.5rem;
          border-bottom: 1px solid var(--hairline);
          transition: background 140ms ease;
          cursor: pointer;
        }
        @media (max-width: 640px) {
          .post-row {
            grid-template-columns: 1fr auto;
            grid-template-rows: auto auto;
          }
          .post-row-date { order: 1; }
          .post-row-author { display: none; }
          .post-row-title { order: 2; grid-column: 1 / 2; }
          .post-row-right { order: 3; grid-column: 2 / 3; grid-row: 1 / 3; align-self: center; }
        }
        .post-row:hover { background: var(--ink); }

        .post-row-date {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--ink-faint);
          letter-spacing: 0.04em;
          flex-shrink: 0;
          transition: color 140ms ease;
        }
        .post-row:hover .post-row-date { color: rgba(246,244,238,0.45); }

        .post-row-author {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--ink-faint);
          letter-spacing: 0.02em;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 7rem;
          transition: color 140ms ease;
        }
        .post-row:hover .post-row-author { color: rgba(246,244,238,0.35); }

        .post-row-title {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--ink);
          line-height: 1.35;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 140ms ease;
        }
        .post-row:hover .post-row-title { color: var(--paper); }

        .post-row-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .post-row-member {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--vermilion);
          border: 1px solid var(--vermilion);
          padding: 0.15rem 0.375rem;
          line-height: 1.4;
          flex-shrink: 0;
          transition: background 140ms ease, color 140ms ease;
        }
        .post-row:hover .post-row-member {
          background: var(--vermilion);
          color: var(--paper);
        }

        .post-row-cat {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--vermilion);
          white-space: nowrap;
          transition: color 140ms ease;
        }
        .post-row:hover .post-row-cat { color: var(--vermilion); }

        /* ── Loading state ── */
        .posts-loading-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 0.5rem;
          border-bottom: 1px solid var(--hairline);
        }
        .posts-loading-bar {
          height: 1px;
          background: var(--hairline);
          flex: 1;
        }

        /* ── Empty / Error states ── */
        .posts-state {
          padding: 3.5rem 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          letter-spacing: 0.04em;
          color: var(--ink-faint);
        }
        .posts-state-error {
          color: var(--vermilion);
        }
        .posts-retry-btn {
          display: inline-block;
          margin-top: 1rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink);
          background: none;
          border: 1px solid var(--ink);
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease;
        }
        .posts-retry-btn:hover {
          background: var(--ink);
          color: var(--paper);
        }

        /* ── Write button ── */
        .posts-write-wrap {
          padding-top: 0.5rem;
        }
      `}</style>

      {/* ── Page Header ──────────────────────────────────────── */}
      <section className="posts-hero">
        <div className="container-page">
          <div className="posts-hero-inner">
            <div className="posts-hero-main rise">
              <p className="posts-eyebrow rise rise-1">{'// POSTS — BOARD'}</p>
              <h1 className="posts-hero-h1 rise rise-2">게시판</h1>
            </div>
            <aside className="posts-hero-meta rise rise-3">
              <div className="posts-meta-row">
                <span className="posts-meta-k">Section</span>
                <span className="posts-meta-v">POSTS</span>
              </div>
              <div className="posts-meta-row">
                <span className="posts-meta-k">Type</span>
                <span className="posts-meta-v">NOTICE / BLOG</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Filter Tabs ─────────────────────────────────────────── */}
      <div className="posts-tabs-wrap">
        <nav className="container-page posts-tabs" aria-label="게시판 카테고리 필터">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`posts-tab${category === tab.key ? ' posts-tab-active' : ''}`}
              onClick={() => setCategory(tab.key as CategoryKey)}
              aria-pressed={category === tab.key}
              type="button"
            >
              {tab.mono}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Post List ───────────────────────────────────────────── */}
      <section className="posts-list-section">
        <div className="container-page">
          <div className="posts-list-head">
            <span className="section-label">
              <span className="no">●</span>
              {category === 'notice' ? 'NOTICE' : category === 'blog' ? 'BLOG' : 'ALL POSTS'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {!loading && !error && (
                <span className="posts-list-count">
                  {posts.length} {posts.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
              {isLoggedIn && (
                <div className="posts-write-wrap">
                  <Link href="/posts/new" className="btn btn-primary">
                    + 글쓰기
                  </Link>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            // Loading: hairline rows + global loading-line
            <div>
              <div className="posts-loading-row">
                <div className="posts-loading-bar" />
                <div className="loading-line">{'// loading'}</div>
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="posts-loading-row">
                  <div className="posts-loading-bar" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="posts-state posts-state-error">
              <p>{'// 오류: '}{error}</p>
              <button
                className="posts-retry-btn"
                onClick={() => fetchPosts(category)}
                type="button"
              >
                RETRY
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="posts-state">
              <p>{'// 게시글이 없습니다'}</p>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
