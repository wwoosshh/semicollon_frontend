'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import type { ClubEvent } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────
interface EventFormState {
  title: string;
  startsAt: string;      // datetime-local value
  endsAt: string;        // datetime-local value (optional)
  location: string;
  description: string;
}

const EMPTY_FORM: EventFormState = {
  title: '',
  startsAt: '',
  endsAt: '',
  location: '',
  description: '',
};

// ─── Helpers ──────────────────────────────────────────────────
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toLocalDatetimeValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

function IconPlus() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
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

function IconInbox() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

// ─── Event Form ───────────────────────────────────────────────
function EventForm({
  token,
  initial,
  editingId,
  onDone,
  onCancel,
}: {
  token: string;
  initial: EventFormState;
  editingId: number | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm]               = useState<EventFormState>(initial);
  const [saving, setSaving]           = useState(false);
  const [feedback, setFeedback]       = useState<{ ok: boolean; msg: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EventFormState, string>>>({});

  const showFeedback = (ok: boolean, msg: string) => {
    setFeedback({ ok, msg });
    if (ok) setTimeout(() => setFeedback(null), 3000);
  };

  const setField = (field: keyof EventFormState, val: string) => {
    setForm((p) => ({ ...p, [field]: val }));
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof EventFormState, string>> = {};
    if (!form.title.trim()) errs.title = '제목을 입력해 주세요.';
    if (!form.startsAt) errs.startsAt = '시작 일시를 입력해 주세요.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setFeedback(null);
    try {
      const body: {
        title: string;
        startsAt: string;
        endsAt?: string;
        location?: string;
        description?: string;
      } = {
        title: form.title.trim(),
        startsAt: new Date(form.startsAt).toISOString(),
      };
      if (form.endsAt) body.endsAt = new Date(form.endsAt).toISOString();
      if (form.location.trim()) body.location = form.location.trim();
      if (form.description.trim()) body.description = form.description.trim();

      if (editingId !== null) {
        await api(`/events/${editingId}`, { method: 'PATCH', token, body });
      } else {
        await api('/events', { method: 'POST', token, body });
      }
      onDone();
    } catch (err) {
      showFeedback(false, err instanceof ApiError ? err.message : '저장에 실패했습니다.');
      setSaving(false);
    }
  };

  return (
    <div className="acm-form-panel">
      <div className="acm-form-header">
        <span className="acm-form-label">
          {editingId !== null ? '// EDIT EVENT' : '// NEW EVENT'}
        </span>
        <button type="button" className="acm-cancel-btn" onClick={onCancel} disabled={saving}>
          <IconX />
          취소
        </button>
      </div>

      <div className="acm-form-body">
        {/* Title */}
        <div className="ad-field">
          <label className="ad-label" htmlFor="evm-title">
            제목 <span className="ad-required">*</span>
          </label>
          <input
            id="evm-title"
            type="text"
            className={`ad-input${fieldErrors.title ? ' ad-input-error' : ''}`}
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            disabled={saving}
            placeholder="일정 제목"
          />
          {fieldErrors.title && <p className="ad-field-error" role="alert">{fieldErrors.title}</p>}
        </div>

        {/* StartsAt / EndsAt row */}
        <div className="ad-field-row">
          <div className="ad-field">
            <label className="ad-label" htmlFor="evm-starts">
              시작 일시 <span className="ad-required">*</span>
            </label>
            <input
              id="evm-starts"
              type="datetime-local"
              className={`ad-input ad-input-mono${fieldErrors.startsAt ? ' ad-input-error' : ''}`}
              value={form.startsAt}
              onChange={(e) => setField('startsAt', e.target.value)}
              disabled={saving}
            />
            {fieldErrors.startsAt && (
              <p className="ad-field-error" role="alert">{fieldErrors.startsAt}</p>
            )}
          </div>
          <div className="ad-field">
            <label className="ad-label" htmlFor="evm-ends">종료 일시</label>
            <input
              id="evm-ends"
              type="datetime-local"
              className="ad-input ad-input-mono"
              value={form.endsAt}
              onChange={(e) => setField('endsAt', e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        {/* Location */}
        <div className="ad-field">
          <label className="ad-label" htmlFor="evm-location">장소</label>
          <input
            id="evm-location"
            type="text"
            className="ad-input"
            value={form.location}
            onChange={(e) => setField('location', e.target.value)}
            disabled={saving}
            placeholder="장소 (선택)"
          />
        </div>

        {/* Description */}
        <div className="ad-field">
          <label className="ad-label" htmlFor="evm-desc">설명</label>
          <textarea
            id="evm-desc"
            className="ad-input acm-textarea"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            disabled={saving}
            rows={4}
            placeholder="일정 설명 (선택)"
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`ad-feedback${feedback.ok ? ' ad-feedback-ok' : ' ad-feedback-err'}`}
            role="status"
            aria-live="polite"
          >
            {feedback.ok ? <IconCheck /> : <span aria-hidden="true">!</span>}
            {feedback.msg}
          </div>
        )}

        {/* Actions */}
        <div className="ad-form-actions">
          <button type="button" className="ad-btn-danger" onClick={onCancel} disabled={saving}>
            취소
          </button>
          <button type="button" className="ad-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <IconSpinner /> : null}
            {editingId !== null ? '수정 완료' : '생성'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EventsManager ────────────────────────────────────────────
export default function EventsManager({ token }: { token: string }) {
  const [events, setEvents]           = useState<ClubEvent[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadErr, setLoadErr]         = useState<string | null>(null);
  const [feedback, setFeedback]       = useState<{ ok: boolean; msg: string } | null>(null);
  const [formMode, setFormMode]       = useState<null | 'new' | number>(null);
  const [formInitial, setFormInitial] = useState<EventFormState>(EMPTY_FORM);
  const [deleting, setDeleting]       = useState<number | null>(null);

  const showFeedback = (ok: boolean, msg: string) => {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ── Load ─────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const data = await api<ClubEvent[]>('/events');
      const sorted = [...data].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      );
      setEvents(sorted);
    } catch (err) {
      setLoadErr(err instanceof ApiError ? err.message : '일정 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (ev: ClubEvent) => {
    if (!window.confirm(`"${ev.title}" 일정을 삭제하시겠습니까?`)) return;
    setDeleting(ev.id);
    try {
      await api(`/events/${ev.id}`, { method: 'DELETE', token });
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
      showFeedback(true, '삭제되었습니다.');
    } catch (err) {
      showFeedback(false, err instanceof ApiError ? err.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  // ── Edit open ─────────────────────────────────────────────────
  const handleEdit = (ev: ClubEvent) => {
    setFormInitial({
      title: ev.title,
      startsAt: toLocalDatetimeValue(ev.starts_at),
      endsAt: toLocalDatetimeValue(ev.ends_at),
      location: ev.location ?? '',
      description: ev.description ?? '',
    });
    setFormMode(ev.id);
  };

  // ── Form done ─────────────────────────────────────────────────
  const handleFormDone = () => {
    const wasNew = formMode === 'new';
    setFormMode(null);
    load();
    showFeedback(true, wasNew ? '일정이 생성되었습니다.' : '일정이 수정되었습니다.');
  };

  return (
    <>
      <style>{EVM_STYLES}</style>
      <div className="ad-tab-content">

        {/* Top bar */}
        <div className="acm-topbar">
          <span className="acm-topbar-label">
            {loading ? '// loading...' : `// ${events.length}개 일정`}
          </span>
          {formMode === null && (
            <button
              type="button"
              className="ad-btn-primary acm-new-btn"
              onClick={() => { setFormInitial(EMPTY_FORM); setFormMode('new'); }}
              disabled={loading}
            >
              <IconPlus />
              새 일정
            </button>
          )}
        </div>

        {/* Inline form */}
        {formMode !== null && (
          <EventForm
            token={token}
            initial={formInitial}
            editingId={typeof formMode === 'number' ? formMode : null}
            onDone={handleFormDone}
            onCancel={() => setFormMode(null)}
          />
        )}

        {/* Feedback */}
        {feedback && (
          <div
            className={`ad-feedback${feedback.ok ? ' ad-feedback-ok' : ' ad-feedback-err'}`}
            role="status"
            aria-live="polite"
          >
            {feedback.ok ? <IconCheck /> : <span aria-hidden="true">!</span>}
            {feedback.msg}
          </div>
        )}

        {/* List */}
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
        ) : events.length === 0 ? (
          <div className="ad-empty">
            <div className="ad-empty-icon"><IconInbox /></div>
            <p className="ad-empty-label">등록된 일정이 없습니다.</p>
            <p className="ad-empty-hint">{'// no events found'}</p>
          </div>
        ) : (
          <div className="acm-list">
            {/* Header */}
            <div className="evm-list-header" aria-hidden="true">
              <span>시작 일시</span>
              <span>제목</span>
              <span>장소</span>
              <span />
            </div>
            {events.map((ev) => (
              <div key={ev.id} className="acm-list-row evm-list-row">
                <span className="evm-col-date">{formatDateTime(ev.starts_at)}</span>
                <span className="acm-col-title">{ev.title}</span>
                <span className="evm-col-location">
                  {ev.location ?? <span className="evm-no-location">—</span>}
                </span>
                <span className="acm-col-actions">
                  <button
                    type="button"
                    className="acm-action-btn"
                    onClick={() => handleEdit(ev)}
                    disabled={deleting === ev.id}
                    aria-label={`${ev.title} 수정`}
                  >
                    <IconEdit />
                    수정
                  </button>
                  <button
                    type="button"
                    className="acm-action-btn acm-action-btn-del"
                    onClick={() => handleDelete(ev)}
                    disabled={deleting === ev.id}
                    aria-label={`${ev.title} 삭제`}
                  >
                    {deleting === ev.id ? <IconSpinner size={12} /> : <IconTrash />}
                    삭제
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const EVM_STYLES = `
/* ── Shared acm-* classes (reproduced for standalone use) ── */
.acm-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.acm-topbar-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: var(--ink-faint);
}
.acm-new-btn {
  padding: 0.5rem 1rem;
  font-size: 0.72rem;
}
.acm-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  overflow: hidden;
}
.acm-list-row {
  display: grid;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--hairline);
  transition: background 120ms ease;
}
.acm-list-row:last-child { border-bottom: none; }
.acm-list-row:hover { background: var(--paper-deep); }
.acm-col-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.acm-col-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.acm-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 2px;
  background: transparent;
  border: 1px solid var(--hairline);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
  cursor: pointer;
  transition: border-color 120ms ease, color 120ms ease;
  white-space: nowrap;
}
.acm-action-btn:hover {
  border-color: var(--ink);
  color: var(--ink);
}
.acm-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.acm-action-btn-del:hover {
  border-color: var(--vermilion);
  color: var(--vermilion);
}
.acm-form-panel {
  border: 1px solid var(--hairline);
  border-radius: 2px;
  overflow: hidden;
}
.acm-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1.25rem;
  background: var(--paper-deep);
  border-bottom: 1px solid var(--hairline);
}
.acm-form-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
}
.acm-cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  background: transparent;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-faint);
  cursor: pointer;
  transition: border-color 120ms, color 120ms;
}
.acm-cancel-btn:hover {
  border-color: var(--ink);
  color: var(--ink);
}
.acm-form-body {
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}
.acm-textarea {
  resize: vertical;
  min-height: 6rem;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  line-height: 1.65;
}

/* ── Events-specific ── */
.evm-list-header {
  display: grid;
  grid-template-columns: 10rem 1fr 8rem auto;
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
@media (max-width: 639px) {
  .evm-list-header { display: none; }
}

.evm-list-row {
  grid-template-columns: 10rem 1fr 8rem auto;
}
@media (max-width: 639px) {
  .evm-list-row {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 0.4rem;
  }
  .evm-col-date { grid-column: 1; grid-row: 2; font-size: 0.7rem; }
  .evm-col-location { display: none; }
  .acm-col-actions { grid-column: 2; grid-row: 1 / 3; align-self: center; }
}

.evm-col-date {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-soft);
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.evm-col-location {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-faint);
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.evm-no-location {
  color: var(--hairline);
}
`;
