'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

// ─── Types ────────────────────────────────────────────────────
export interface Member {
  id: string;
  name: string;
  generation: number;
  role: 'admin' | 'member';
  created_at: string;
  email: string;
}

// ─── Icons ────────────────────────────────────────────────────
function IconSpinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
      style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}

function IconInbox() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────
function formatDateOnly(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// ─── Role Badge ───────────────────────────────────────────────
function RoleBadge({ role }: { role: 'admin' | 'member' }) {
  return (
    <span className={`mm-role-badge mm-role-${role}`}>
      {role === 'admin' ? 'ADMIN' : 'MEMBER'}
    </span>
  );
}

// ─── MembersManager ───────────────────────────────────────────
export default function MembersManager({ token }: { token: string }) {
  const { profile } = useAuth();
  const myId = profile?.id ?? '';

  const [members, setMembers]     = useState<Member[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadErr, setLoadErr]     = useState<string | null>(null);
  const [feedback, setFeedback]   = useState<{ ok: boolean; msg: string } | null>(null);
  const [roleBusy, setRoleBusy]   = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState<string | null>(null);

  const showFeedback = (ok: boolean, msg: string) => {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ── Load ─────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const data = await api<Member[]>('/admin/members', { token });
      setMembers(data);
    } catch (err) {
      setLoadErr(err instanceof ApiError ? err.message : '부원 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // ── Role toggle ───────────────────────────────────────────────
  const handleRoleToggle = async (m: Member) => {
    const newRole: 'admin' | 'member' = m.role === 'admin' ? 'member' : 'admin';
    const label = newRole === 'admin' ? '관리자' : '일반 부원';
    if (!window.confirm(`${m.name}의 역할을 "${label}"(으)로 변경하시겠습니까?`)) return;
    setRoleBusy(m.id);
    try {
      await api(`/admin/members/${m.id}/role`, { method: 'PATCH', token, body: { role: newRole } });
      setMembers((prev) => prev.map((x) => x.id === m.id ? { ...x, role: newRole } : x));
      showFeedback(true, `${m.name}의 역할이 변경되었습니다.`);
    } catch (err) {
      showFeedback(false, err instanceof ApiError ? err.message : '역할 변경에 실패했습니다.');
    } finally {
      setRoleBusy(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (m: Member) => {
    if (!window.confirm(`"${m.name}"을(를) 삭제하시겠습니까?\n\n⚠️ 계정이 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`)) return;
    if (!window.confirm(`정말로 삭제하시겠습니까? 계정이 영구 삭제됩니다.`)) return;
    setDeleteBusy(m.id);
    try {
      await api(`/admin/members/${m.id}`, { method: 'DELETE', token });
      setMembers((prev) => prev.filter((x) => x.id !== m.id));
      showFeedback(true, `${m.name} 계정이 삭제되었습니다.`);
    } catch (err) {
      showFeedback(false, err instanceof ApiError ? err.message : '삭제에 실패했습니다.');
    } finally {
      setDeleteBusy(null);
    }
  };

  return (
    <>
      <style>{MM_STYLES}</style>
      <div className="ad-tab-content">

        {/* Top bar */}
        <div className="acm-topbar">
          <span className="acm-topbar-label">
            {loading ? '// loading...' : `// ${members.length}명`}
          </span>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`ad-feedback${feedback.ok ? ' ad-feedback-ok' : ' ad-feedback-err'}`} role="status" aria-live="polite">
            {feedback.ok ? <IconCheck /> : <span aria-hidden="true">!</span>}
            {feedback.msg}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="ad-loading">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="ad-loading-row">
                <div className="ad-loading-bar" />
                {i === 0 && <span className="ad-loading-label">{'// loading...'}</span>}
              </div>
            ))}
          </div>
        ) : loadErr ? (
          <div className="ad-error-box" role="alert">
            <span className="ad-error-tag">ERROR</span>
            <p>{loadErr}</p>
            <button type="button" className="ad-retry-btn" onClick={load}>RETRY</button>
          </div>
        ) : members.length === 0 ? (
          <div className="ad-empty">
            <div className="ad-empty-icon"><IconInbox /></div>
            <p className="ad-empty-label">아직 부원이 없습니다.</p>
            <p className="ad-empty-hint">{'// no members found'}</p>
          </div>
        ) : (
          <div className="mm-list">
            {/* Header */}
            <div className="mm-list-header" aria-hidden="true">
              <span>기수</span>
              <span>이름</span>
              <span>이메일</span>
              <span>가입일</span>
              <span>역할</span>
              <span />
            </div>
            {members.map((m) => {
              const isSelf = m.id === myId;
              const isBusy = roleBusy === m.id || deleteBusy === m.id;
              return (
                <div key={m.id} className="mm-list-row">
                  <span className="mm-col-gen">{m.generation}</span>
                  <span className="mm-col-name">
                    {m.name}
                    {isSelf && <span className="mm-self-tag">(나)</span>}
                  </span>
                  <span className="mm-col-email">{m.email}</span>
                  <span className="mm-col-date">{formatDateOnly(m.created_at)}</span>
                  <span className="mm-col-role"><RoleBadge role={m.role} /></span>
                  <span className="mm-col-actions">
                    {!isSelf && (
                      <>
                        <button
                          type="button"
                          className="acm-action-btn"
                          onClick={() => handleRoleToggle(m)}
                          disabled={isBusy}
                          aria-label={`${m.name} 역할 변경`}
                        >
                          {roleBusy === m.id ? <IconSpinner size={12} /> : <IconShield />}
                          역할 변경
                        </button>
                        <button
                          type="button"
                          className="acm-action-btn acm-action-btn-del"
                          onClick={() => handleDelete(m)}
                          disabled={isBusy}
                          aria-label={`${m.name} 삭제`}
                        >
                          {deleteBusy === m.id ? <IconSpinner size={12} /> : <IconTrash />}
                          삭제
                        </button>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const MM_STYLES = `
/* ── Member list ── */
.mm-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  overflow: hidden;
}

.mm-list-header {
  display: grid;
  grid-template-columns: 3.5rem 7rem 1fr 7rem 5.5rem auto;
  gap: 1rem;
  padding: 0.5rem 1.25rem;
  background: var(--paper-deep);
  border-bottom: 1px solid var(--hairline);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--ink-faint);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
@media (max-width: 767px) {
  .mm-list-header { display: none; }
}

.mm-list-row {
  display: grid;
  grid-template-columns: 3.5rem 7rem 1fr 7rem 5.5rem auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--hairline);
  transition: background 120ms ease;
}
.mm-list-row:last-child { border-bottom: none; }
.mm-list-row:hover { background: var(--paper-deep); }

@media (max-width: 767px) {
  .mm-list-row {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto auto;
    gap: 0.375rem 0.75rem;
    padding: 0.875rem 1rem;
  }
  .mm-col-gen   { display: none; }
  .mm-col-email { grid-column: 1; font-size: 0.72rem; }
  .mm-col-date  { display: none; }
  .mm-col-name  { grid-column: 1; grid-row: 1; }
  .mm-col-role  { grid-column: 1; grid-row: 2; }
  .mm-col-actions { grid-column: 2; grid-row: 1 / 4; align-self: center; }
}

.mm-col-gen {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-soft);
  letter-spacing: 0.04em;
}

.mm-col-name {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.mm-self-tag {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--ink-faint);
}

.mm-col-email {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-soft);
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mm-col-date {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-faint);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.mm-col-role {
  display: flex;
  align-items: center;
}

.mm-col-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

/* ── Role badges ── */
.mm-role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.45rem;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid;
  white-space: nowrap;
}
.mm-role-admin {
  color: var(--vermilion);
  border-color: var(--vermilion);
  background: transparent;
}
.mm-role-member {
  color: var(--ink-faint);
  border-color: var(--hairline);
  background: transparent;
}
`;
