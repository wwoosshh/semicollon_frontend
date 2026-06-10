'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import type { AboutContent, AboutHistoryItem, AboutStaffItem, AboutFaqItem } from '@/lib/types';

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

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
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

// ─── Section wrapper ──────────────────────────────────────────
function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="abm-section-head">
      <span className="abm-section-title">{title}</span>
      <span className="abm-section-hint">{hint}</span>
    </div>
  );
}

// ─── AboutManager ─────────────────────────────────────────────
export default function AboutManager({ token }: { token: string }) {
  const [history, setHistory] = useState<AboutHistoryItem[]>([]);
  const [staff, setStaff]     = useState<AboutStaffItem[]>([]);
  const [faq, setFaq]         = useState<AboutFaqItem[]>([]);

  const [loading, setLoading]   = useState(true);
  const [loadErr, setLoadErr]   = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // validation highlight: set of row keys that are invalid
  const [invalidKeys, setInvalidKeys] = useState<Set<string>>(new Set());

  // ── Load ────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const data = await api<AboutContent>('/settings/about');
      setHistory(data.history ?? []);
      setStaff(data.staff ?? []);
      setFaq(data.faq ?? []);
    } catch (err) {
      setLoadErr(err instanceof ApiError ? err.message : '소개 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Validation ──────────────────────────────────────────────
  function validate(): boolean {
    const bad = new Set<string>();
    history.forEach((h, i) => {
      if (!h.year.trim()) bad.add(`history-year-${i}`);
      if (!h.title.trim()) bad.add(`history-title-${i}`);
    });
    staff.forEach((s, i) => {
      if (!s.name.trim()) bad.add(`staff-name-${i}`);
      if (!s.role.trim()) bad.add(`staff-role-${i}`);
    });
    faq.forEach((f, i) => {
      if (!f.q.trim()) bad.add(`faq-q-${i}`);
      if (!f.a.trim()) bad.add(`faq-a-${i}`);
    });
    setInvalidKeys(bad);
    return bad.size === 0;
  }

  // ── Save ─────────────────────────────────────────────────────
  const showFeedback = (ok: boolean, msg: string) => {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = async () => {
    if (!validate()) {
      showFeedback(false, '빈 필드가 있는 행을 확인해 주세요.');
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await api('/admin/settings/about', {
        method: 'PATCH',
        token,
        body: { history, staff, faq },
      });
      showFeedback(true, '소개 정보가 저장되었습니다.');
    } catch (err) {
      showFeedback(false, err instanceof ApiError ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // ── History helpers ──────────────────────────────────────────
  const addHistory = () => setHistory((p) => [...p, { year: '', title: '' }]);
  const removeHistory = (i: number) => setHistory((p) => p.filter((_, idx) => idx !== i));
  const setHistoryField = (i: number, field: keyof AboutHistoryItem, val: string) =>
    setHistory((p) => p.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  // ── Staff helpers ────────────────────────────────────────────
  const addStaff = () => setStaff((p) => [...p, { name: '', role: '', note: '' }]);
  const removeStaff = (i: number) => setStaff((p) => p.filter((_, idx) => idx !== i));
  const setStaffField = (i: number, field: keyof AboutStaffItem, val: string) =>
    setStaff((p) => p.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  // ── FAQ helpers ───────────────────────────────────────────────
  const addFaq = () => setFaq((p) => [...p, { q: '', a: '' }]);
  const removeFaq = (i: number) => setFaq((p) => p.filter((_, idx) => idx !== i));
  const setFaqField = (i: number, field: keyof AboutFaqItem, val: string) =>
    setFaq((p) => p.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  // ── Render ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="ad-tab-content">
        <div className="ad-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="ad-loading-row">
              <div className="ad-loading-bar" />
              {i === 0 && <span className="ad-loading-label">{'// loading...'}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="ad-tab-content">
        <div className="ad-error-box" role="alert">
          <span className="ad-error-tag">ERROR</span>
          <p>{loadErr}</p>
          <button type="button" className="ad-retry-btn" onClick={load}>RETRY</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{ABM_STYLES}</style>
      <div className="ad-tab-content">

        {/* ── 연혁 ── */}
        <div className="abm-section">
          <SectionHeader title="연혁" hint="// history" />
          <div className="abm-rows">
            {history.length === 0 && (
              <p className="abm-empty-hint">{'// 항목 없음 — 아래 버튼으로 추가'}</p>
            )}
            {history.map((h, i) => (
              <div key={i} className={`abm-row${(invalidKeys.has(`history-year-${i}`) || invalidKeys.has(`history-title-${i}`)) ? ' abm-row-invalid' : ''}`}>
                <input
                  type="text"
                  className={`ad-input abm-input-year${invalidKeys.has(`history-year-${i}`) ? ' ad-input-error' : ''}`}
                  placeholder="예: 2026.06"
                  value={h.year}
                  onChange={(e) => { setHistoryField(i, 'year', e.target.value); invalidKeys.delete(`history-year-${i}`); setInvalidKeys(new Set(invalidKeys)); }}
                  disabled={saving}
                  aria-label={`연혁 ${i + 1} 연도`}
                />
                <input
                  type="text"
                  className={`ad-input abm-input-grow${invalidKeys.has(`history-title-${i}`) ? ' ad-input-error' : ''}`}
                  placeholder="활동 내용"
                  value={h.title}
                  onChange={(e) => { setHistoryField(i, 'title', e.target.value); invalidKeys.delete(`history-title-${i}`); setInvalidKeys(new Set(invalidKeys)); }}
                  disabled={saving}
                  aria-label={`연혁 ${i + 1} 제목`}
                />
                <button type="button" className="abm-del-btn" onClick={() => removeHistory(i)} disabled={saving} aria-label={`연혁 ${i + 1} 삭제`}>
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="abm-add-btn" onClick={addHistory} disabled={saving}>
            <IconPlus />항목 추가
          </button>
        </div>

        {/* ── 운영진 ── */}
        <div className="abm-section">
          <SectionHeader title="운영진" hint="// staff" />
          <div className="abm-rows">
            {staff.length === 0 && (
              <p className="abm-empty-hint">{'// 항목 없음 — 아래 버튼으로 추가'}</p>
            )}
            {staff.map((s, i) => (
              <div key={i} className={`abm-row${(invalidKeys.has(`staff-name-${i}`) || invalidKeys.has(`staff-role-${i}`)) ? ' abm-row-invalid' : ''}`}>
                <input
                  type="text"
                  className={`ad-input abm-input-name${invalidKeys.has(`staff-name-${i}`) ? ' ad-input-error' : ''}`}
                  placeholder="이름"
                  value={s.name}
                  onChange={(e) => { setStaffField(i, 'name', e.target.value); invalidKeys.delete(`staff-name-${i}`); setInvalidKeys(new Set(invalidKeys)); }}
                  disabled={saving}
                  aria-label={`운영진 ${i + 1} 이름`}
                />
                <input
                  type="text"
                  className={`ad-input abm-input-role${invalidKeys.has(`staff-role-${i}`) ? ' ad-input-error' : ''}`}
                  placeholder="직책"
                  value={s.role}
                  onChange={(e) => { setStaffField(i, 'role', e.target.value); invalidKeys.delete(`staff-role-${i}`); setInvalidKeys(new Set(invalidKeys)); }}
                  disabled={saving}
                  aria-label={`운영진 ${i + 1} 직책`}
                />
                <input
                  type="text"
                  className="ad-input abm-input-grow"
                  placeholder="비고 (선택)"
                  value={s.note ?? ''}
                  onChange={(e) => setStaffField(i, 'note', e.target.value)}
                  disabled={saving}
                  aria-label={`운영진 ${i + 1} 비고`}
                />
                <button type="button" className="abm-del-btn" onClick={() => removeStaff(i)} disabled={saving} aria-label={`운영진 ${i + 1} 삭제`}>
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="abm-add-btn" onClick={addStaff} disabled={saving}>
            <IconPlus />항목 추가
          </button>
        </div>

        {/* ── FAQ ── */}
        <div className="abm-section">
          <SectionHeader title="FAQ" hint="// frequently asked questions" />
          <div className="abm-rows">
            {faq.length === 0 && (
              <p className="abm-empty-hint">{'// 항목 없음 — 아래 버튼으로 추가'}</p>
            )}
            {faq.map((f, i) => (
              <div key={i} className={`abm-faq-row${(invalidKeys.has(`faq-q-${i}`) || invalidKeys.has(`faq-a-${i}`)) ? ' abm-row-invalid' : ''}`}>
                <div className="abm-faq-fields">
                  <input
                    type="text"
                    className={`ad-input${invalidKeys.has(`faq-q-${i}`) ? ' ad-input-error' : ''}`}
                    placeholder="질문"
                    value={f.q}
                    onChange={(e) => { setFaqField(i, 'q', e.target.value); invalidKeys.delete(`faq-q-${i}`); setInvalidKeys(new Set(invalidKeys)); }}
                    disabled={saving}
                    aria-label={`FAQ ${i + 1} 질문`}
                  />
                  <textarea
                    className={`ad-input abm-textarea${invalidKeys.has(`faq-a-${i}`) ? ' ad-input-error' : ''}`}
                    placeholder="답변"
                    value={f.a}
                    onChange={(e) => { setFaqField(i, 'a', e.target.value); invalidKeys.delete(`faq-a-${i}`); setInvalidKeys(new Set(invalidKeys)); }}
                    disabled={saving}
                    rows={3}
                    aria-label={`FAQ ${i + 1} 답변`}
                  />
                </div>
                <button type="button" className="abm-del-btn abm-del-btn-top" onClick={() => removeFaq(i)} disabled={saving} aria-label={`FAQ ${i + 1} 삭제`}>
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="abm-add-btn" onClick={addFaq} disabled={saving}>
            <IconPlus />항목 추가
          </button>
        </div>

        {/* ── Actions ── */}
        <div className="ad-settings-form">
          {feedback && (
            <div className={`ad-feedback${feedback.ok ? ' ad-feedback-ok' : ' ad-feedback-err'}`} role="status" aria-live="polite">
              {feedback.ok ? <IconCheck /> : <span aria-hidden="true">!</span>}
              {feedback.msg}
            </div>
          )}
          {invalidKeys.size > 0 && (
            <p className="abm-validation-hint">{'// 붉은 테두리 행의 필수 필드를 모두 입력하세요.'}</p>
          )}
          <div className="ad-form-actions">
            <button type="button" className="ad-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <IconSpinner /> : null}
              저장
            </button>
          </div>
        </div>

      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const ABM_STYLES = `
.abm-section {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  overflow: hidden;
}

.abm-section-head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.625rem 1.25rem;
  background: var(--paper-deep);
  border-bottom: 1px solid var(--hairline);
}

.abm-section-title {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink);
}

.abm-section-hint {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  color: var(--ink-faint);
}

.abm-rows {
  display: flex;
  flex-direction: column;
}

.abm-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--hairline);
  transition: background 120ms ease;
}
.abm-row:last-child { border-bottom: none; }
.abm-row-invalid {
  background: var(--vermilion-tint);
}

.abm-faq-row {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--hairline);
  transition: background 120ms ease;
}
.abm-faq-row:last-child { border-bottom: none; }
.abm-faq-row.abm-row-invalid {
  background: var(--vermilion-tint);
}

.abm-faq-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.abm-textarea {
  resize: vertical;
  min-height: 4.5rem;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.abm-input-year {
  width: 7rem;
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  letter-spacing: 0.04em;
}

.abm-input-name {
  width: 8rem;
  flex-shrink: 0;
}

.abm-input-role {
  width: 7rem;
  flex-shrink: 0;
}

.abm-input-grow {
  flex: 1;
  min-width: 0;
}

.abm-del-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  color: var(--ink-faint);
  cursor: pointer;
  transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
}
.abm-del-btn:hover {
  border-color: var(--vermilion);
  color: var(--vermilion);
  background: var(--vermilion-tint);
}
.abm-del-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.abm-del-btn-top {
  margin-top: 0.125rem;
}

.abm-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0.75rem 1rem;
  padding: 0.3rem 0.75rem;
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
  transition: border-color 120ms ease, color 120ms ease;
  align-self: flex-start;
}
.abm-add-btn:hover {
  border-color: var(--ink);
  color: var(--ink);
}
.abm-add-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.abm-empty-hint {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--ink-faint);
  letter-spacing: 0.06em;
  padding: 1rem 1.25rem;
  margin: 0;
}

.abm-validation-hint {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--vermilion);
  letter-spacing: 0.04em;
  margin: 0;
}
`;
