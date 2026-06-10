'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import type { PostComment } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// ─── Comments Component ───────────────────────────────────────
export default function Comments({ postId }: { postId: string }) {
  const { profile, session } = useAuth();

  const [comments, setComments] = useState<PostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 삭제 버튼: 관리자 또는 댓글 작성자 본인
  const isAdmin = profile?.role === 'admin';
  const isMember = !!session && !!profile;
  const canDelete = (c: PostComment) =>
    isAdmin || (!!profile && c.author?.id === profile.id);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    setFetchError(null);
    try {
      const token = await getAccessToken();
      const data = await api<PostComment[]>(`/posts/${postId}/comments`, { token });
      setComments(data);
    } catch (e) {
      if (e instanceof ApiError) {
        setFetchError(`// error ${e.status}: ${e.message}`);
      } else {
        setFetchError('// 댓글을 불러오지 못했습니다');
      }
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getAccessToken();
      await api(`/posts/${postId}/comments`, {
        method: 'POST',
        token,
        body: { content: draft.trim() },
      });
      setDraft('');
      await loadComments();
    } catch (e) {
      if (e instanceof ApiError) {
        setSubmitError(`// ${e.status === 403 ? '부원만 댓글을 작성할 수 있습니다' : e.message}`);
      } else {
        setSubmitError('// 댓글 작성에 실패했습니다');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: number) {
    try {
      const token = await getAccessToken();
      await api(`/comments/${commentId}`, { method: 'DELETE', token });
      await loadComments();
    } catch (e) {
      if (e instanceof ApiError) {
        alert(`삭제 실패: ${e.message}`);
      }
    }
  }

  return (
    <>
      <style>{`
        /* ── Comments Section ── */
        .cmt-section {
          margin-top: 4rem;
          border-top: 1px solid var(--ink);
          padding-top: 0;
        }

        /* Header row */
        .cmt-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding: 1.125rem 0 0;
          margin-bottom: 0;
        }
        .cmt-header-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
          font-weight: 600;
        }
        .cmt-header-count {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          color: var(--ink-faint);
        }

        /* Hairline below header */
        .cmt-rule {
          border: 0;
          border-top: 1px solid var(--hairline);
          margin: 0.875rem 0 0;
        }

        /* ── Comment rows — ledger lines ── */
        .cmt-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .cmt-row {
          border-bottom: 1px solid var(--hairline);
          padding: 1.125rem 0;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.5rem 1rem;
          align-items: start;
        }
        .cmt-row-main {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          min-width: 0;
        }
        .cmt-meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .cmt-author {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          color: var(--ink);
          font-weight: 600;
          white-space: nowrap;
        }
        .cmt-author-anon {
          color: var(--ink-faint);
          font-style: normal;
        }
        .cmt-meta-sep {
          font-family: var(--font-mono);
          font-size: 0.45rem;
          color: var(--hairline);
          user-select: none;
          line-height: 1;
        }
        .cmt-date {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.06em;
          color: var(--ink-faint);
        }
        .cmt-body {
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          color: var(--ink-soft);
          line-height: 1.75;
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
        }

        /* Delete button */
        .cmt-del-btn {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-faint);
          background: transparent;
          border: 1px solid var(--hairline);
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          transition: color 140ms ease, border-color 140ms ease, background 140ms ease;
          white-space: nowrap;
          align-self: start;
          margin-top: 0.1rem;
        }
        .cmt-del-btn:hover {
          color: var(--paper);
          background: var(--vermilion);
          border-color: var(--vermilion);
        }

        /* ── Status states ── */
        .cmt-status {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: var(--ink-faint);
          padding: 1.5rem 0;
          border-bottom: 1px solid var(--hairline);
        }
        .cmt-error-text {
          color: var(--vermilion);
        }

        /* ── Comment form — document style ── */
        .cmt-form-wrap {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--hairline);
        }
        .cmt-form-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-faint);
          display: block;
          margin-bottom: 0.625rem;
        }
        .cmt-textarea {
          display: block;
          width: 100%;
          min-height: 6rem;
          background: var(--paper-deep);
          border: 1px solid var(--hairline);
          border-radius: 0;
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          color: var(--ink);
          line-height: 1.75;
          padding: 0.75rem 1rem;
          resize: vertical;
          outline: none;
          transition: border-color 140ms ease;
          appearance: none;
          -webkit-appearance: none;
        }
        .cmt-textarea:focus {
          border-color: var(--ink);
        }
        .cmt-textarea::placeholder {
          color: var(--ink-faint);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.04em;
        }
        .cmt-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
        }
        .cmt-submit-error {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          color: var(--vermilion);
          margin: 0;
        }
        .cmt-submit-btn {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          background: var(--ink);
          color: var(--paper);
          border: 1px solid var(--ink);
          padding: 0.625rem 1.25rem;
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
          line-height: 1;
          border-radius: 0;
          appearance: none;
          -webkit-appearance: none;
          white-space: nowrap;
        }
        .cmt-submit-btn:hover:not(:disabled) {
          background: var(--vermilion);
          border-color: var(--vermilion);
          color: #fff;
        }
        .cmt-submit-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* ── Logged-out notice ── */
        .cmt-guest-notice {
          margin-top: 2rem;
          padding: 1.25rem 1.5rem;
          border: 1px solid var(--hairline);
          background: var(--paper-deep);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .cmt-guest-text {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          color: var(--ink-faint);
          margin: 0;
        }
        .cmt-guest-link {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink);
          text-decoration: none;
          border-bottom: 1px solid var(--ink);
          padding-bottom: 0.1rem;
          transition: color 140ms ease, border-color 140ms ease;
          white-space: nowrap;
        }
        .cmt-guest-link:hover {
          color: var(--vermilion);
          border-color: var(--vermilion);
        }
      `}</style>

      <section className="cmt-section" aria-label="댓글">
        {/* Header */}
        <div className="cmt-header">
          <span className="cmt-header-label">
            Comments{' '}
            {!loadingComments && !fetchError && (
              <span className="cmt-header-count">— {comments.length}</span>
            )}
          </span>
        </div>
        <hr className="cmt-rule" />

        {/* Comment list */}
        {loadingComments ? (
          <div className="cmt-status">{'// loading...'}</div>
        ) : fetchError ? (
          <div className={`cmt-status cmt-error-text`}>{fetchError}</div>
        ) : comments.length === 0 ? (
          <div className="cmt-status">{'// 첫 댓글을 남겨보세요'}</div>
        ) : (
          <ul className="cmt-list" role="list">
            {comments.map((c) => (
              <li key={c.id} className="cmt-row">
                <div className="cmt-row-main">
                  <div className="cmt-meta">
                    {c.author ? (
                      <span className="cmt-author">{c.author.name}</span>
                    ) : (
                      <span className="cmt-author cmt-author-anon">탈퇴한 부원</span>
                    )}
                    <span className="cmt-meta-sep" aria-hidden="true">◆</span>
                    <span className="cmt-date">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="cmt-body">{c.content}</p>
                </div>
                {canDelete(c) && (
                  <button
                    className="cmt-del-btn"
                    onClick={() => handleDelete(c.id)}
                    aria-label="댓글 삭제"
                    type="button"
                  >
                    DEL
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Compose area */}
        {isMember ? (
          <div className="cmt-form-wrap">
            <form onSubmit={handleSubmit}>
              <label htmlFor={`cmt-input-${postId}`} className="cmt-form-label">
                새 댓글
              </label>
              <textarea
                id={`cmt-input-${postId}`}
                className="cmt-textarea"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="// 내용을 입력하세요"
                disabled={submitting}
                aria-label="댓글 내용"
              />
              <div className="cmt-form-footer">
                {submitError ? (
                  <p className="cmt-submit-error">{submitError}</p>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="cmt-submit-btn"
                  disabled={submitting || !draft.trim()}
                >
                  {submitting ? 'Posting...' : '댓글 달기'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="cmt-guest-notice">
            <p className="cmt-guest-text">{'// 부원으로 로그인하면 댓글을 남길 수 있습니다'}</p>
            <Link href="/login" className="cmt-guest-link">
              로그인 →
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
