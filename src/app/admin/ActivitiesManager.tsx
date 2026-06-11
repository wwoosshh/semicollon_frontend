'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Activity } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── Types ────────────────────────────────────────────────────
type ActivityType = 'project' | 'study' | 'event';

interface FormState {
  title: string;
  description: string;
  type: ActivityType;
  year: string;
  tags: string;
  thumbnailUrl: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  type: 'project',
  year: String(new Date().getFullYear()),
  tags: '',
  thumbnailUrl: '',
};

const TYPE_LABELS: Record<ActivityType, string> = {
  project: 'PROJECT',
  study: 'STUDY',
  event: 'EVENT',
};

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

function IconImage() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
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

// ─── TypeBadge ────────────────────────────────────────────────
function TypeBadge({ type }: { type: ActivityType }) {
  return (
    <span className={`acm-type-badge acm-type-${type}`}>
      {TYPE_LABELS[type]}
    </span>
  );
}

// ─── Activity Form ────────────────────────────────────────────
function ActivityForm({
  token,
  initial,
  editingId,
  onDone,
  onCancel,
}: {
  token: string;
  initial: FormState;
  editingId: number | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm]             = useState<FormState>(initial);
  const [saving, setSaving]         = useState(false);
  const [feedback, setFeedback]     = useState<{ ok: boolean; msg: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [thumbPreview, setThumbPreview] = useState<string>(initial.thumbnailUrl);
  const [thumbUploading, setThumbUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const showFeedback = (ok: boolean, msg: string) => {
    setFeedback({ ok, msg });
    if (ok) setTimeout(() => setFeedback(null), 3000);
  };

  // ── Thumbnail upload ────────────────────────────────────────
  const MAX_UPLOAD = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const handleThumbFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      showFeedback(false, '이미지 파일(jpg/png/webp/gif)만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_UPLOAD) {
      showFeedback(false, '파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    const preview = URL.createObjectURL(file);
    setThumbPreview(preview);
    setThumbUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(d?.message ?? '업로드에 실패했습니다.');
      }
      const data = (await res.json()) as { url: string };
      setForm((p) => ({ ...p, thumbnailUrl: data.url }));
    } catch (err) {
      setThumbPreview('');
      showFeedback(false, err instanceof Error ? err.message : '업로드에 실패했습니다.');
    } finally {
      setThumbUploading(false);
    }
  };

  const removeThumb = () => {
    if (thumbPreview && thumbPreview.startsWith('blob:')) URL.revokeObjectURL(thumbPreview);
    setThumbPreview('');
    setForm((p) => ({ ...p, thumbnailUrl: '' }));
  };

  // ── Validate ────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errs.title = '제목을 입력해 주세요.';
    if (!form.description.trim()) errs.description = '설명을 입력해 주세요.';
    const y = Number(form.year);
    if (!form.year || isNaN(y) || y < 2000 || y > 2100) errs.year = '올바른 연도를 입력해 주세요.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setFeedback(null);
    try {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        year: Number(form.year),
        tags,
        ...(form.thumbnailUrl ? { thumbnailUrl: form.thumbnailUrl } : { thumbnailUrl: null }),
      };

      if (editingId !== null) {
        await api(`/admin/activities/${editingId}`, { method: 'PATCH', token, body });
      } else {
        await api('/activities', { method: 'POST', token, body });
      }
      onDone();
    } catch (err) {
      showFeedback(false, err instanceof ApiError ? err.message : '저장에 실패했습니다.');
      setSaving(false);
    }
  };

  const setField = (field: keyof FormState, val: string) => {
    setForm((p) => ({ ...p, [field]: val }));
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="acm-form-panel">
      <div className="acm-form-header">
        <span className="acm-form-label">
          {editingId !== null ? '// EDIT ACTIVITY' : '// NEW ACTIVITY'}
        </span>
        <button type="button" className="acm-cancel-btn" onClick={onCancel} disabled={saving}>
          <IconX />
          취소
        </button>
      </div>

      <div className="acm-form-body">
        {/* Title */}
        <div className="ad-field">
          <label className="ad-label" htmlFor="acm-title">제목 <span className="ad-required">*</span></label>
          <input
            id="acm-title"
            type="text"
            className={`ad-input${fieldErrors.title ? ' ad-input-error' : ''}`}
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            disabled={saving}
            placeholder="활동 제목"
          />
          {fieldErrors.title && <p className="ad-field-error" role="alert">{fieldErrors.title}</p>}
        </div>

        {/* Type + Year row */}
        <div className="ad-field-row">
          <div className="ad-field">
            <label className="ad-label" htmlFor="acm-type">유형 <span className="ad-required">*</span></label>
            <select
              id="acm-type"
              className="ad-input acm-select"
              value={form.type}
              onChange={(e) => setField('type', e.target.value)}
              disabled={saving}
            >
              <option value="project">Project</option>
              <option value="study">Study</option>
              <option value="event">Event</option>
            </select>
          </div>
          <div className="ad-field">
            <label className="ad-label" htmlFor="acm-year">연도 <span className="ad-required">*</span></label>
            <input
              id="acm-year"
              type="number"
              className={`ad-input ad-input-mono${fieldErrors.year ? ' ad-input-error' : ''}`}
              value={form.year}
              onChange={(e) => setField('year', e.target.value)}
              disabled={saving}
              min={2000}
              max={2100}
              placeholder="2026"
            />
            {fieldErrors.year && <p className="ad-field-error" role="alert">{fieldErrors.year}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="ad-field">
          <label className="ad-label" htmlFor="acm-desc">설명 <span className="ad-required">*</span></label>
          <textarea
            id="acm-desc"
            className={`ad-input acm-textarea${fieldErrors.description ? ' ad-input-error' : ''}`}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            disabled={saving}
            rows={4}
            placeholder="활동 설명"
          />
          {fieldErrors.description && <p className="ad-field-error" role="alert">{fieldErrors.description}</p>}
        </div>

        {/* Tags */}
        <div className="ad-field">
          <label className="ad-label" htmlFor="acm-tags">태그</label>
          <p className="ad-field-hint">쉼표로 구분 (예: React, TypeScript)</p>
          <input
            id="acm-tags"
            type="text"
            className="ad-input"
            value={form.tags}
            onChange={(e) => setField('tags', e.target.value)}
            disabled={saving}
            placeholder="태그1, 태그2, ..."
          />
        </div>

        {/* Thumbnail */}
        <div className="ad-field">
          <label className="ad-label">썸네일</label>
          {thumbPreview ? (
            <div className="acm-thumb-preview">
              {thumbUploading ? (
                <div className="acm-thumb-uploading">
                  <IconSpinner size={20} />
                  <span className="acm-thumb-uploading-label">{'// uploading...'}</span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbPreview} alt="썸네일 미리보기" className="acm-thumb-img" />
              )}
              <button type="button" className="acm-thumb-remove" onClick={removeThumb} disabled={saving || thumbUploading} aria-label="썸네일 제거">
                <IconX />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="acm-thumb-pick-btn"
              onClick={() => fileRef.current?.click()}
              disabled={saving}
            >
              <IconImage />
              이미지 선택
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleThumbFile}
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`ad-feedback${feedback.ok ? ' ad-feedback-ok' : ' ad-feedback-err'}`} role="status" aria-live="polite">
            {feedback.ok ? <IconCheck /> : <span aria-hidden="true">!</span>}
            {feedback.msg}
          </div>
        )}

        {/* Actions */}
        <div className="ad-form-actions">
          <button type="button" className="ad-btn-danger" onClick={onCancel} disabled={saving}>취소</button>
          <button type="button" className="ad-btn-primary" onClick={handleSubmit} disabled={saving || thumbUploading}>
            {saving ? <IconSpinner /> : null}
            {editingId !== null ? '수정 완료' : '생성'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ActivitiesManager ────────────────────────────────────────
export default function ActivitiesManager({ token }: { token: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadErr, setLoadErr]       = useState<string | null>(null);
  const [feedback, setFeedback]     = useState<{ ok: boolean; msg: string } | null>(null);

  // form state: null = list view, 'new' = create, number = edit by id
  const [formMode, setFormMode]     = useState<null | 'new' | number>(null);
  const [formInitial, setFormInitial] = useState<FormState>(EMPTY_FORM);

  const [deleting, setDeleting]     = useState<number | null>(null);

  const showFeedback = (ok: boolean, msg: string) => {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ── Load ─────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const data = await api<Activity[]>('/activities');
      setActivities(data);
    } catch (err) {
      setLoadErr(err instanceof ApiError ? err.message : '활동 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (act: Activity) => {
    if (!window.confirm(`"${act.title}" 활동을 삭제하시겠습니까?`)) return;
    setDeleting(act.id);
    try {
      await api(`/admin/activities/${act.id}`, { method: 'DELETE', token });
      setActivities((p) => p.filter((a) => a.id !== act.id));
      showFeedback(true, '삭제되었습니다.');
    } catch (err) {
      showFeedback(false, err instanceof ApiError ? err.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  // ── Edit open ─────────────────────────────────────────────────
  const handleEdit = (act: Activity) => {
    setFormInitial({
      title: act.title,
      description: act.description,
      type: act.type,
      year: String(act.year),
      tags: act.tags.join(', '),
      thumbnailUrl: act.thumbnail_url ?? '',
    });
    setFormMode(act.id);
  };

  // ── Form done ─────────────────────────────────────────────────
  const handleFormDone = () => {
    setFormMode(null);
    load();
    showFeedback(true, formMode === 'new' ? '활동이 생성되었습니다.' : '활동이 수정되었습니다.');
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <style>{ACM_STYLES}</style>
      <div className="ad-tab-content">

        {/* Top bar */}
        <div className="acm-topbar">
          <span className="acm-topbar-label">
            {loading ? '// loading...' : `// ${activities.length}개 활동`}
          </span>
          {formMode === null && (
            <button
              type="button"
              className="ad-btn-primary acm-new-btn"
              onClick={() => { setFormInitial(EMPTY_FORM); setFormMode('new'); }}
              disabled={loading}
            >
              <IconPlus />
              새 활동
            </button>
          )}
        </div>

        {/* Inline form */}
        {formMode !== null && (
          <ActivityForm
            token={token}
            initial={formInitial}
            editingId={typeof formMode === 'number' ? formMode : null}
            onDone={handleFormDone}
            onCancel={() => setFormMode(null)}
          />
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`ad-feedback${feedback.ok ? ' ad-feedback-ok' : ' ad-feedback-err'}`} role="status" aria-live="polite">
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
        ) : activities.length === 0 ? (
          <div className="ad-empty">
            <div className="ad-empty-icon"><IconInbox /></div>
            <p className="ad-empty-label">아직 활동이 없습니다.</p>
            <p className="ad-empty-hint">{'// no activities found'}</p>
          </div>
        ) : (
          <div className="acm-list">
            {/* Header */}
            <div className="acm-list-header" aria-hidden="true">
              <span>연도</span>
              <span>유형</span>
              <span>제목</span>
              <span />
            </div>
            {activities.map((act) => (
              <div key={act.id} className="acm-list-row">
                <span className="acm-col-year">{act.year}</span>
                <span className="acm-col-type"><TypeBadge type={act.type} /></span>
                <span className="acm-col-title">{act.title}</span>
                <span className="acm-col-actions">
                  <button
                    type="button"
                    className="acm-action-btn"
                    onClick={() => handleEdit(act)}
                    disabled={deleting === act.id}
                    aria-label={`${act.title} 수정`}
                  >
                    <IconEdit />
                    수정
                  </button>
                  <button
                    type="button"
                    className="acm-action-btn acm-action-btn-del"
                    onClick={() => handleDelete(act)}
                    disabled={deleting === act.id}
                    aria-label={`${act.title} 삭제`}
                  >
                    {deleting === act.id ? <IconSpinner size={12} /> : <IconTrash />}
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
const ACM_STYLES = `
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

/* ── Activity list ── */
.acm-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  overflow: hidden;
}

.acm-list-header {
  display: grid;
  grid-template-columns: 4rem 6rem 1fr auto;
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
  .acm-list-header { display: none; }
}

.acm-list-row {
  display: grid;
  grid-template-columns: 4rem 6rem 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--hairline);
  transition: background 120ms ease;
}
.acm-list-row:last-child { border-bottom: none; }
.acm-list-row:hover { background: var(--paper-deep); }

@media (max-width: 639px) {
  .acm-list-row {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 0.5rem;
  }
  .acm-col-year { display: none; }
  .acm-col-type { grid-column: 1; }
  .acm-col-title { grid-column: 1; }
  .acm-col-actions { grid-column: 2; grid-row: 1 / 3; }
}

.acm-col-year {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-soft);
  letter-spacing: 0.04em;
}

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

/* ── Type badge ── */
.acm-type-badge {
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
.acm-type-project {
  color: var(--vermilion);
  border-color: var(--vermilion);
  background: transparent;
}
.acm-type-study {
  color: var(--ink-soft);
  border-color: var(--hairline);
  background: transparent;
}
.acm-type-event {
  color: var(--ink);
  border-color: var(--ink);
  background: transparent;
}

/* ── Action buttons ── */
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

/* ── Form panel ── */
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

.acm-select {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
}

/* ── Thumbnail ── */
.acm-thumb-preview {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 9rem;
  height: 6rem;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  overflow: hidden;
  background: var(--paper-deep);
}

.acm-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.acm-thumb-uploading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  color: var(--ink-faint);
}

.acm-thumb-uploading-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  color: var(--ink-faint);
}

.acm-thumb-remove {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  background: var(--ink);
  color: var(--paper);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 120ms;
}
.acm-thumb-remove:hover { opacity: 1; }

.acm-thumb-pick-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.875rem;
  background: transparent;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
  cursor: pointer;
  transition: border-color 120ms, color 120ms;
  align-self: flex-start;
}
.acm-thumb-pick-btn:hover {
  border-color: var(--ink);
  color: var(--ink);
}
.acm-thumb-pick-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
`;
