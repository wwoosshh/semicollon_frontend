'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { api, ApiError } from '@/lib/api';
import type { Application, RecruitInfo } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────
type Tab = 'applications' | 'recruit' | 'invite';
type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';

// ─── Icons ────────────────────────────────────────────────────
function IconSpinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function IconChevronUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 15l-6-6-6 6" />
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

function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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

function IconShield() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────
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

function formatDateOnly(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function toLocalDatetimeValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_LABELS: Record<Application['status'], string> = {
  pending: '검토중',
  accepted: '합격',
  rejected: '불합격',
};

const FILTER_LABELS: Record<StatusFilter, string> = {
  all: '전체',
  pending: '검토중',
  accepted: '합격',
  rejected: '불합격',
};

// ─── Sub-components ───────────────────────────────────────────

function StatusBadge({ status }: { status: Application['status'] }) {
  return (
    <span
      className={`ad-badge ad-badge-${status}`}
      aria-label={`상태: ${STATUS_LABELS[status]}`}
    >
      {status === 'pending' && <IconClock />}
      {status === 'accepted' && <IconCheck />}
      {status === 'rejected' && <IconX />}
      {STATUS_LABELS[status]}
    </span>
  );
}

function ApplicationRow({
  app,
  token,
  onStatusChange,
}: {
  app: Application;
  token: string;
  onStatusChange: (id: number, status: Application['status']) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState<Application['status'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatus = async (status: Application['status']) => {
    if (updating) return;
    setError(null);
    setUpdating(status);
    try {
      await api(`/admin/applications/${app.id}/status`, {
        method: 'PATCH',
        token,
        body: { status },
      });
      onStatusChange(app.id, status);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setUpdating(null);
    }
  };

  const answerEntries = Object.entries(app.answers);

  return (
    <div className={`ad-app-row${expanded ? ' ad-app-row-expanded' : ''}`}>
      {/* Summary row */}
      <button
        type="button"
        className="ad-app-summary"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
        aria-label={`${app.name} 지원서 ${expanded ? '접기' : '펼치기'}`}
      >
        <span className="ad-app-name">{app.name}</span>
        <span className="ad-app-contact">{app.contact}</span>
        <span className="ad-app-date">{formatDateTime(app.created_at)}</span>
        <StatusBadge status={app.status} />
        <span className="ad-app-chevron" aria-hidden="true">
          {expanded ? <IconChevronUp /> : <IconChevronDown />}
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="ad-app-detail">
          {/* Answers */}
          {answerEntries.length > 0 ? (
            <div className="ad-answers">
              {answerEntries.map(([question, answer]) => (
                <div key={question} className="ad-answer-item">
                  <p className="ad-answer-q">{question}</p>
                  <p className="ad-answer-a">{answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="ad-no-answers">답변 내용이 없습니다.</p>
          )}

          {/* Error */}
          {error && (
            <div className="ad-inline-error" role="alert">
              <span className="ad-inline-error-tag">ERROR</span>
              {error}
            </div>
          )}

          {/* Status actions */}
          <div className="ad-status-actions">
            <span className="ad-status-actions-label">상태 변경:</span>
            <button
              type="button"
              className={`ad-status-btn ad-status-btn-pending${app.status === 'pending' ? ' ad-status-btn-active' : ''}`}
              onClick={() => handleStatus('pending')}
              disabled={!!updating || app.status === 'pending'}
            >
              {updating === 'pending' ? <IconSpinner size={13} /> : <IconClock />}
              검토중
            </button>
            <button
              type="button"
              className={`ad-status-btn ad-status-btn-accepted${app.status === 'accepted' ? ' ad-status-btn-active' : ''}`}
              onClick={() => handleStatus('accepted')}
              disabled={!!updating || app.status === 'accepted'}
            >
              {updating === 'accepted' ? <IconSpinner size={13} /> : <IconCheck />}
              합격
            </button>
            <button
              type="button"
              className={`ad-status-btn ad-status-btn-rejected${app.status === 'rejected' ? ' ad-status-btn-active' : ''}`}
              onClick={() => handleStatus('rejected')}
              disabled={!!updating || app.status === 'rejected'}
            >
              {updating === 'rejected' ? <IconSpinner size={13} /> : <IconX />}
              불합격
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Applications ────────────────────────────────────────
function ApplicationsTab({ token }: { token: string }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const data = await api<Application[]>(`/admin/applications${params}`, { token });
      setApps(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '지원자 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filter, token]);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const handleStatusChange = useCallback((id: number, status: Application['status']) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  return (
    <div className="ad-tab-content">
      {/* Filter bar */}
      <div className="ad-filter-bar" role="group" aria-label="상태 필터">
        {(Object.keys(FILTER_LABELS) as StatusFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            className={`ad-filter-btn${filter === f ? ' ad-filter-btn-active' : ''}`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="ad-loading" aria-label="불러오는 중">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ad-loading-row">
              <div className="ad-loading-bar" />
              {i === 0 && <span className="ad-loading-label">{'// loading...'}</span>}
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="ad-error-box" role="alert">
          <span className="ad-error-tag">ERROR</span>
          <p>{error}</p>
          <button type="button" className="ad-retry-btn" onClick={loadApps}>
            RETRY
          </button>
        </div>
      ) : apps.length === 0 ? (
        <div className="ad-empty">
          <div className="ad-empty-icon">
            <IconInbox />
          </div>
          <p className="ad-empty-label">
            {filter === 'all' ? '아직 지원자가 없습니다.' : `${FILTER_LABELS[filter]} 상태의 지원자가 없습니다.`}
          </p>
          <p className="ad-empty-hint">{'// no applications found'}</p>
        </div>
      ) : (
        <div className="ad-app-list" role="list" aria-label="지원자 목록">
          {/* Table header */}
          <div className="ad-app-header" aria-hidden="true">
            <span>이름</span>
            <span>연락처</span>
            <span>제출일</span>
            <span>상태</span>
            <span />
          </div>
          {apps.map((app) => (
            <div key={app.id} role="listitem">
              <ApplicationRow
                app={app}
                token={token}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Recruit Settings ────────────────────────────────────
function RecruitTab({ token }: { token: string }) {
  const [recruit, setRecruit] = useState<RecruitInfo | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [startVal, setStartVal] = useState('');
  const [endVal, setEndVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [ending, setEnding] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    api<RecruitInfo>('/settings/recruit')
      .then((data) => {
        setRecruit(data);
        setStartVal(toLocalDatetimeValue(data.start));
        setEndVal(toLocalDatetimeValue(data.end));
      })
      .catch(() => {})
      .finally(() => setLoadingInitial(false));
  }, []);

  const showFeedback = (ok: boolean, msg: string) => {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const body: { start: string | null; end: string | null } = {
        start: startVal ? new Date(startVal).toISOString() : null,
        end: endVal ? new Date(endVal).toISOString() : null,
      };
      const data = await api<RecruitInfo>('/admin/settings/recruit', {
        method: 'PATCH',
        token,
        body,
      });
      setRecruit(data);
      showFeedback(true, '모집 기간이 저장되었습니다.');
    } catch (err) {
      showFeedback(false, err instanceof ApiError ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleEnd = async () => {
    setEnding(true);
    setFeedback(null);
    try {
      const data = await api<RecruitInfo>('/admin/settings/recruit', {
        method: 'PATCH',
        token,
        body: { start: null, end: null },
      });
      setRecruit(data);
      setStartVal('');
      setEndVal('');
      showFeedback(true, '모집이 종료되었습니다.');
    } catch (err) {
      showFeedback(false, err instanceof ApiError ? err.message : '모집 종료에 실패했습니다.');
    } finally {
      setEnding(false);
    }
  };

  const isBusy = saving || ending;

  return (
    <div className="ad-tab-content">
      {/* 현재 모집 상태 */}
      <div className="ad-info-card">
        <div className="ad-info-card-header">
          <span className="ad-info-card-label">현재 모집 상태</span>
        </div>
        {loadingInitial ? (
          <div className="ad-loading">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="ad-loading-row">
                <div className="ad-loading-bar" />
              </div>
            ))}
          </div>
        ) : recruit ? (
          <div className="ad-recruit-status">
            <span className={`ad-recruit-badge${recruit.isRecruiting ? ' ad-recruit-badge-active' : ''}`}>
              {recruit.isRecruiting ? '모집 중' : '모집 종료'}
            </span>
            {(recruit.start || recruit.end) && (
              <div className="ad-recruit-dates">
                {recruit.start && (
                  <span>시작: <strong>{formatDateOnly(recruit.start)}</strong></span>
                )}
                {recruit.start && recruit.end && <span className="ad-dot" aria-hidden="true">·</span>}
                {recruit.end && (
                  <span>마감: <strong>{formatDateOnly(recruit.end)}</strong></span>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="ad-no-data">정보를 불러오지 못했습니다.</p>
        )}
      </div>

      {/* Form */}
      <div className="ad-settings-form">
        <div className="ad-field-row">
          <div className="ad-field">
            <label className="ad-label" htmlFor="recruit-start">
              모집 시작일시
            </label>
            <input
              id="recruit-start"
              type="datetime-local"
              className="ad-input"
              value={startVal}
              onChange={(e) => setStartVal(e.target.value)}
              disabled={isBusy}
            />
          </div>
          <div className="ad-field">
            <label className="ad-label" htmlFor="recruit-end">
              모집 마감일시
            </label>
            <input
              id="recruit-end"
              type="datetime-local"
              className="ad-input"
              value={endVal}
              onChange={(e) => setEndVal(e.target.value)}
              disabled={isBusy}
            />
          </div>
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

        <div className="ad-form-actions">
          <button
            type="button"
            className="ad-btn-danger"
            onClick={handleEnd}
            disabled={isBusy}
          >
            {ending ? <IconSpinner size={14} /> : null}
            모집 종료
          </button>
          <button
            type="button"
            className="ad-btn-primary"
            onClick={handleSave}
            disabled={isBusy}
          >
            {saving ? <IconSpinner size={14} /> : null}
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Invite Code ─────────────────────────────────────────
function InviteTab({ token }: { token: string }) {
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const showFeedback = (ok: boolean, msg: string) => {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = async () => {
    setCodeError(null);
    if (code.length < 6) {
      setCodeError('초대 코드는 6자 이상이어야 합니다.');
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await api('/admin/settings/invite-code', {
        method: 'PATCH',
        token,
        body: { code },
      });
      setCode('');
      showFeedback(true, '변경되었습니다.');
    } catch (err) {
      showFeedback(false, err instanceof ApiError ? err.message : '변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ad-tab-content">
      {/* Security notice */}
      <div className="ad-notice">
        <span className="ad-notice-icon">
          <IconShield />
        </span>
        <p className="ad-notice-text">
          새 코드를 설정하면 기존 코드는 즉시 무효화됩니다. 보안상 현재 코드는 표시되지 않습니다.
        </p>
      </div>

      <div className="ad-settings-form">
        <div className="ad-field">
          <label className="ad-label" htmlFor="invite-code">
            새 초대 코드 <span className="ad-required" aria-hidden="true">*</span>
          </label>
          <p className="ad-field-hint">영문·숫자 조합 6자 이상을 권장합니다.</p>
          <input
            id="invite-code"
            type="text"
            className={`ad-input ad-input-mono${codeError ? ' ad-input-error' : ''}`}
            placeholder="예: SEC2025"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (codeError) setCodeError(null);
            }}
            disabled={saving}
            minLength={6}
            aria-invalid={!!codeError}
            aria-describedby={codeError ? 'invite-code-error' : undefined}
          />
          {codeError && (
            <p id="invite-code-error" className="ad-field-error" role="alert">
              {codeError}
            </p>
          )}
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

        <div className="ad-form-actions">
          <button
            type="button"
            className="ad-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <IconSpinner size={14} /> : null}
            코드 변경
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <>
      <style>{STYLES}</style>
      <div className="ad-page" aria-label="로딩 중" aria-busy="true">
        <div className="ad-container">
          <div className="ad-header">
            <p className="ad-eyebrow">{'// ADMIN — DASHBOARD'}</p>
            <div className="ad-skel ad-skel-title" />
          </div>
          <div className="ad-panel">
            <div className="ad-skel-tabs">
              {[0, 1, 2].map((i) => (
                <div key={i} className="ad-skel ad-skel-tab" />
              ))}
            </div>
            <div className="ad-skel-body">
              {[0, 1, 2].map((i) => (
                <div key={i} className="ad-loading-row">
                  <div className="ad-loading-bar" />
                  {i === 0 && <span className="ad-loading-label">{'// loading...'}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('applications');

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      router.replace('/');
    }
  }, [loading, profile, router]);

  if (loading || !session || profile?.role !== 'admin') {
    return <DashboardSkeleton />;
  }

  const token = session.access_token;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'applications', label: '지원자 관리', icon: <IconUsers /> },
    { id: 'recruit', label: '모집 설정', icon: <IconCalendar /> },
    { id: 'invite', label: '초대 코드', icon: <IconKey /> },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="ad-page">
        <div className="ad-container">
          {/* 페이지 헤더 */}
          <div className="ad-header">
            <p className="ad-eyebrow">{'// ADMIN — DASHBOARD'}</p>
            <h1 className="ad-title">관리자 대시보드</h1>
          </div>

          <hr className="ad-rule" />

          {/* 패널 */}
          <div className="ad-panel">
            {/* Tab nav */}
            <nav className="ad-tabs" aria-label="관리 메뉴">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`ad-tab${activeTab === t.id ? ' ad-tab-active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                  aria-selected={activeTab === t.id}
                  role="tab"
                >
                  <span className="ad-tab-icon" aria-hidden="true">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>

            {/* Tab content */}
            <div role="tabpanel" aria-label={tabs.find((t) => t.id === activeTab)?.label}>
              {activeTab === 'applications' && <ApplicationsTab token={token} />}
              {activeTab === 'recruit' && <RecruitTab token={token} />}
              {activeTab === 'invite' && <InviteTab token={token} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const STYLES = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes ad-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

/* ── 페이지 셸 ── */
.ad-page {
  min-height: calc(100dvh - 3.75rem);
  padding: 3rem 1.25rem 5rem;
}
@media (min-width: 640px) {
  .ad-page { padding: 4rem 2rem 6rem; }
}
@media (min-width: 1024px) {
  .ad-page { padding: 5rem 2.5rem 7rem; }
}

.ad-container {
  max-width: 960px;
  margin-inline: auto;
  animation: ad-fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ── 헤더 ── */
.ad-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0;
}
.ad-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vermilion);
  margin: 0;
}
.ad-title {
  font-family: var(--font-serif);
  font-weight: 900;
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 0;
}
.ad-rule {
  border: 0;
  border-top: 1px solid var(--ink);
  margin: 1.75rem 0 2rem;
}

/* ── 패널 — 직각 보더 상자 ── */
.ad-panel {
  background: var(--paper);
  border: 1px solid var(--hairline);
  border-radius: 2px;
  overflow: hidden;
}

/* ── 탭 ── */
.ad-tabs {
  display: flex;
  border-bottom: 1px solid var(--ink);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.ad-tabs::-webkit-scrollbar { display: none; }

.ad-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.375rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-faint);
  background: var(--paper-deep);
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color 140ms ease, border-color 140ms ease, background 140ms ease;
  margin-bottom: -1px;
}
.ad-tab:hover {
  color: var(--ink);
  background: var(--paper);
}
.ad-tab-active {
  color: var(--ink);
  border-bottom-color: var(--vermilion);
  background: var(--paper);
}
.ad-tab-icon {
  display: flex;
  align-items: center;
  opacity: 0.6;
}
.ad-tab-active .ad-tab-icon {
  opacity: 1;
}

/* ── 탭 콘텐츠 ── */
.ad-tab-content {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
@media (min-width: 640px) {
  .ad-tab-content { padding: 2rem 2.25rem; }
}

/* ── 필터 바 — 직각 태그 ── */
.ad-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.ad-filter-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
  background: transparent;
  border: 1px solid var(--hairline);
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
}
.ad-filter-btn:hover {
  border-color: var(--ink);
  color: var(--ink);
}
.ad-filter-btn-active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}

/* ── 지원자 목록 ── */
.ad-app-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  overflow: hidden;
}
.ad-app-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto auto;
  gap: 1rem;
  padding: 0.625rem 1.25rem;
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
  .ad-app-header { display: none; }
}

/* ── 지원자 행 ── */
.ad-app-row {
  border-bottom: 1px solid var(--hairline);
}
.ad-app-row:last-child {
  border-bottom: none;
}
.ad-app-row-expanded {
  background: var(--paper-deep);
}

.ad-app-summary {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem 1rem;
  align-items: center;
  padding: 0.875rem 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 140ms ease;
  font-family: var(--font-sans);
}
@media (min-width: 640px) {
  .ad-app-summary {
    grid-template-columns: 1fr 1fr 1fr auto auto;
  }
}
.ad-app-summary:hover {
  background: var(--paper-deep);
}
.ad-app-row-expanded .ad-app-summary {
  background: var(--paper-deep);
}

.ad-app-name {
  font-family: var(--font-serif);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.ad-app-contact {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.ad-app-date {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-faint);
  letter-spacing: 0.02em;
}
@media (max-width: 639px) {
  .ad-app-contact { display: none; }
  .ad-app-date { display: none; }
}
.ad-app-chevron {
  color: var(--ink-faint);
  display: flex;
  align-items: center;
}

/* ── 상태 배지 — 모노 대문자 직각 태그 ── */
.ad-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid;
}
/* pending: 잉크 페인트 */
.ad-badge-pending {
  background: var(--paper-deep);
  color: var(--ink-soft);
  border-color: var(--hairline);
}
/* accepted: 버밀리온 보더 + 글자 */
.ad-badge-accepted {
  background: transparent;
  color: var(--vermilion);
  border-color: var(--vermilion);
}
/* rejected: 잉크 보더 + 흐림 */
.ad-badge-rejected {
  background: transparent;
  color: var(--ink-faint);
  border-color: var(--hairline);
  text-decoration: line-through;
  text-decoration-color: var(--ink-faint);
}

/* ── 상세 ── */
.ad-app-detail {
  padding: 1.25rem 1.5rem 1.5rem;
  border-top: 1px solid var(--hairline);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ad-answers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.ad-answer-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  border-left: 2px solid var(--hairline);
  padding-left: 1rem;
}
.ad-answer-q {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin: 0;
}
.ad-answer-a {
  font-size: 0.9375rem;
  color: var(--ink-soft);
  margin: 0;
  line-height: 1.75;
  white-space: pre-wrap;
}
.ad-no-answers {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
  margin: 0;
}

/* ── 인라인 에러 ── */
.ad-inline-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--vermilion);
  background: var(--vermilion-tint);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--vermilion-deep);
}
.ad-inline-error-tag {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--vermilion);
  padding: 0.1rem 0.35rem;
  border: 1px solid var(--vermilion);
  line-height: 1.4;
}

/* ── 상태 변경 버튼 ── */
.ad-status-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid var(--hairline);
}
.ad-status-actions-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin-right: 0.25rem;
}
.ad-status-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
}
.ad-status-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.ad-status-btn-pending {
  color: var(--ink-soft);
  background: transparent;
  border-color: var(--hairline);
}
.ad-status-btn-pending:not(:disabled):hover,
.ad-status-btn-pending.ad-status-btn-active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
.ad-status-btn-accepted {
  color: var(--vermilion);
  background: transparent;
  border-color: var(--vermilion);
}
.ad-status-btn-accepted:not(:disabled):hover,
.ad-status-btn-accepted.ad-status-btn-active {
  background: var(--vermilion);
  color: var(--paper);
}
.ad-status-btn-rejected {
  color: var(--ink-faint);
  background: transparent;
  border-color: var(--hairline);
}
.ad-status-btn-rejected:not(:disabled):hover,
.ad-status-btn-rejected.ad-status-btn-active {
  background: var(--ink-faint);
  color: var(--paper);
  border-color: var(--ink-faint);
}

/* ── 로딩 / 빈 상태 / 에러 ── */
.ad-loading {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
}
.ad-loading-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--hairline);
}
.ad-loading-bar {
  height: 1px;
  background: var(--hairline);
  flex: 1;
}
.ad-loading-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: var(--ink-faint);
  animation: blink 1.2s step-end infinite;
}

.ad-error-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--vermilion);
  background: var(--vermilion-tint);
}
.ad-error-tag {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--vermilion);
  padding: 0.15rem 0.4rem;
  border: 1px solid var(--vermilion);
  line-height: 1.4;
}
.ad-error-box > p {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--vermilion-deep);
  margin: 0;
}
.ad-retry-btn {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.4rem 0.875rem;
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--ink);
  border-radius: 2px;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
}
.ad-retry-btn:hover {
  background: var(--ink);
  color: var(--paper);
}

.ad-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 3rem 0.5rem;
}
.ad-empty-icon {
  color: var(--ink-faint);
  margin-bottom: 0.25rem;
}
.ad-empty-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-soft);
  margin: 0;
}
.ad-empty-hint {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
  margin: 0;
}

/* ── 모집 상태 카드 ── */
.ad-info-card {
  background: var(--paper);
  border: 1px solid var(--hairline);
  border-radius: 2px;
  overflow: hidden;
}
.ad-info-card-header {
  padding: 0.625rem 1.25rem;
  border-bottom: 1px solid var(--hairline);
  background: var(--paper-deep);
}
.ad-info-card-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--ink-faint);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.ad-recruit-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  flex-wrap: wrap;
}
/* 모집 배지 — 직각 태그 */
.ad-recruit-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: transparent;
  color: var(--ink-faint);
  border: 1px solid var(--hairline);
}
.ad-recruit-badge-active {
  color: var(--vermilion);
  border-color: var(--vermilion);
}
.ad-recruit-dates {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.ad-recruit-dates strong {
  color: var(--ink);
  font-weight: 600;
}
.ad-dot {
  color: var(--ink-faint);
}
.ad-no-data {
  padding: 1rem 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--ink-faint);
  margin: 0;
  letter-spacing: 0.04em;
}

/* ── 설정 폼 ── */
.ad-settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.ad-field-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 540px) {
  .ad-field-row { grid-template-columns: 1fr 1fr; }
}
.ad-field {
  display: flex;
  flex-direction: column;
  gap: 0.4375rem;
}
.ad-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
  cursor: pointer;
}
.ad-required {
  color: var(--vermilion);
}
.ad-field-hint {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
  margin: 0;
}
.ad-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  line-height: 1.5;
  outline: none;
  transition: border-color 120ms ease;
  -webkit-appearance: none;
  appearance: none;
}
.ad-input::placeholder {
  color: var(--ink-faint);
}
.ad-input:focus {
  border-color: var(--ink);
  border-width: 2px;
}
.ad-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ad-input-mono {
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
}
.ad-input-error {
  border-color: var(--vermilion);
}
.ad-input-error:focus {
  border-color: var(--vermilion);
  border-width: 2px;
}
.ad-field-error {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--vermilion);
  margin: 0;
}

/* ── 피드백 ── */
.ad-feedback {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  align-self: flex-start;
}
.ad-feedback-ok {
  background: transparent;
  color: var(--ink);
  border-color: var(--ink);
}
.ad-feedback-err {
  background: var(--vermilion-tint);
  color: var(--vermilion-deep);
  border-color: var(--vermilion);
}

/* ── 폼 액션 ── */
.ad-form-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid var(--hairline);
}

.ad-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4375rem;
  padding: 0.875rem 1.625rem;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  border: 1px solid var(--ink);
  border-radius: 2px;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease;
}
.ad-btn-primary:hover {
  background: var(--vermilion);
  border-color: var(--vermilion);
}
.ad-btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ad-btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4375rem;
  padding: 0.875rem 1.375rem;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  border: 1px solid var(--ink);
  border-radius: 2px;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;
}
.ad-btn-danger:hover {
  background: var(--ink);
  color: var(--paper);
}
.ad-btn-danger:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ── 공지 박스 ── */
.ad-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--hairline);
  background: var(--paper-deep);
  border-left: 2px solid var(--ink-soft);
}
.ad-notice-icon {
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  margin-top: 0.0625rem;
  flex-shrink: 0;
}
.ad-notice-text {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-soft);
  margin: 0;
  line-height: 1.65;
  letter-spacing: 0.02em;
}

/* ── 스켈레톤 ── */
.ad-skel {
  background: var(--hairline-soft);
  animation: blink 1.5s ease-in-out infinite;
}
.ad-skel-title {
  height: 2.5rem;
  width: 14rem;
  margin-bottom: 0;
}
.ad-skel-tabs {
  display: flex;
  gap: 0.75rem;
  border-bottom: 1px solid var(--ink);
  padding: 0.875rem 1.375rem;
  background: var(--paper-deep);
}
.ad-skel-tab {
  height: 1rem;
  width: 5rem;
}
.ad-skel-body {
  padding: 2rem 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}
`;
