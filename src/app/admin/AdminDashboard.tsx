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
              <span className="ad-inline-error-icon">!</span>
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
          <IconSpinner size={20} />
          <span>불러오는 중…</span>
        </div>
      ) : error ? (
        <div className="ad-error-box" role="alert">
          <span className="ad-error-icon">!</span>
          <p>{error}</p>
          <button type="button" className="ad-retry-btn" onClick={loadApps}>
            다시 시도
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
          <p className="ad-empty-hint">// no applications found</p>
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
      {/* Current status card */}
      <div className="ad-info-card">
        <div className="ad-info-card-header">
          <span className="ad-info-card-label">현재 모집 상태</span>
        </div>
        {loadingInitial ? (
          <div className="ad-loading" aria-label="불러오는 중">
            <IconSpinner size={16} />
            <span>불러오는 중…</span>
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
        <div className="ad-grid" aria-hidden="true" />
        <div className="ad-container">
          <div className="ad-header">
            <div className="ad-skel ad-skel-eyebrow" />
            <div className="ad-skel ad-skel-title" />
          </div>
          <div className="ad-panel">
            <div className="ad-skel-tabs">
              <div className="ad-skel ad-skel-tab" />
              <div className="ad-skel ad-skel-tab" />
              <div className="ad-skel ad-skel-tab" />
            </div>
            <div className="ad-skel-body">
              <div className="ad-skel ad-skel-row" />
              <div className="ad-skel ad-skel-row" />
              <div className="ad-skel ad-skel-row" style={{ width: '75%' }} />
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
        <div className="ad-grid" aria-hidden="true" />
        <div className="ad-container">
          {/* Page header */}
          <div className="ad-header">
            <span className="ad-eyebrow">Admin</span>
            <h1 className="ad-title">관리자 대시보드</h1>
          </div>

          {/* Panel */}
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
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ad-skel-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

/* ── Page shell ── */
.ad-page {
  position: relative;
  min-height: calc(100dvh - 3.75rem);
  padding: 3rem 1.25rem 5rem;
  overflow: hidden;
}
@media (min-width: 640px) {
  .ad-page { padding: 4rem 2rem 6rem; }
}
@media (min-width: 1024px) {
  .ad-page { padding: 5rem 2.5rem 7rem; }
}

.ad-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 80% 40% at 50% 0%, black 20%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 40% at 50% 0%, black 20%, transparent 100%);
  pointer-events: none;
}

.ad-container {
  position: relative;
  max-width: 960px;
  margin-inline: auto;
  animation: ad-fade-up 0.35s ease both;
}

/* ── Header ── */
.ad-header {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 2.5rem;
}

.ad-eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  background: var(--accent-light);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid var(--accent-muted);
  align-self: flex-start;
}

.ad-title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  color: var(--foreground);
  margin: 0;
}

/* ── Panel ── */
.ad-panel {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  overflow: hidden;
}

/* ── Tabs ── */
.ad-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
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
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color 150ms ease, border-color 150ms ease, background 150ms ease;
  margin-bottom: -1px;
}
.ad-tab:hover {
  color: var(--foreground);
  background: var(--surface-alt);
}
.ad-tab-active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  background: var(--background);
}
.ad-tab-icon {
  display: flex;
  align-items: center;
  opacity: 0.8;
}
.ad-tab-active .ad-tab-icon {
  opacity: 1;
  color: var(--accent);
}

/* ── Tab content ── */
.ad-tab-content {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
@media (min-width: 640px) {
  .ad-tab-content { padding: 2rem 2.25rem; }
}

/* ── Filter bar ── */
.ad-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.ad-filter-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--surface);
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: all 150ms ease;
  font-family: var(--font-sans);
}
.ad-filter-btn:hover {
  border-color: var(--text-subtle);
  color: var(--foreground);
}
.ad-filter-btn-active {
  background: var(--accent-light);
  color: var(--accent);
  border-color: var(--accent-muted);
}

/* ── App list ── */
.ad-app-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.ad-app-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto auto;
  gap: 1rem;
  padding: 0.625rem 1.25rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-subtle);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
@media (max-width: 639px) {
  .ad-app-header { display: none; }
}

/* ── App row ── */
.ad-app-row {
  border-bottom: 1px solid var(--border-soft);
}
.ad-app-row:last-child {
  border-bottom: none;
}
.ad-app-row-expanded {
  background: var(--surface);
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
  transition: background 150ms ease;
  font-family: var(--font-sans);
}
@media (min-width: 640px) {
  .ad-app-summary {
    grid-template-columns: 1fr 1fr 1fr auto auto;
  }
}
.ad-app-summary:hover {
  background: var(--surface);
}
.ad-app-row-expanded .ad-app-summary {
  background: var(--surface-alt);
}

.ad-app-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.01em;
}
.ad-app-contact {
  font-size: 0.875rem;
  color: var(--text-muted);
}
.ad-app-date {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-subtle);
}
@media (max-width: 639px) {
  .ad-app-contact { display: none; }
  .ad-app-date { display: none; }
}
.ad-app-chevron {
  color: var(--text-subtle);
  display: flex;
  align-items: center;
}

/* ── Status Badge ── */
.ad-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.ad-badge-pending {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.ad-badge-accepted {
  background: var(--accent-light);
  color: var(--accent);
  border: 1px solid var(--accent-muted);
}
.ad-badge-rejected {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* ── App detail ── */
.ad-app-detail {
  padding: 1.25rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-soft);
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
}
.ad-answer-q {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--foreground);
  margin: 0;
  letter-spacing: -0.01em;
}
.ad-answer-a {
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.7;
  white-space: pre-wrap;
}
.ad-no-answers {
  font-size: 0.9rem;
  color: var(--text-subtle);
  font-family: var(--font-mono);
  margin: 0;
}

/* Inline error */
.ad-inline-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius);
  background: #fef2f2;
  border: 1px solid #fecaca;
  font-size: 0.875rem;
  color: #b91c1c;
}
.ad-inline-error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: #dc2626;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  font-family: var(--font-mono);
  flex-shrink: 0;
}

/* ── Status action buttons ── */
.ad-status-actions {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border-soft);
}
.ad-status-actions-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-subtle);
  margin-right: 0.25rem;
}
.ad-status-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1.5px solid;
  cursor: pointer;
  transition: all 150ms ease;
  font-family: var(--font-sans);
}
.ad-status-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ad-status-btn-pending {
  color: #475569;
  background: #f8fafc;
  border-color: #e2e8f0;
}
.ad-status-btn-pending:not(:disabled):hover,
.ad-status-btn-pending.ad-status-btn-active {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
}
.ad-status-btn-accepted {
  color: var(--accent);
  background: var(--accent-light);
  border-color: var(--accent-muted);
}
.ad-status-btn-accepted:not(:disabled):hover,
.ad-status-btn-accepted.ad-status-btn-active {
  background: #e0e7ff;
  border-color: var(--accent);
}
.ad-status-btn-rejected {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fecaca;
}
.ad-status-btn-rejected:not(:disabled):hover,
.ad-status-btn-rejected.ad-status-btn-active {
  background: #fee2e2;
  border-color: #ef4444;
}

/* ── Empty / Loading / Error states ── */
.ad-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 3rem 1rem;
  color: var(--text-subtle);
  font-size: 0.9375rem;
}

.ad-error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1.5rem;
  border: 1.5px dashed #fecaca;
  border-radius: var(--radius-lg);
  text-align: center;
}
.ad-error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  font-size: 1rem;
  font-weight: 800;
  font-family: var(--font-mono);
}
.ad-error-box > p {
  font-size: 0.9375rem;
  color: #b91c1c;
  margin: 0;
}
.ad-retry-btn {
  padding: 0.5rem 1.125rem;
  border-radius: 999px;
  background: transparent;
  color: var(--foreground);
  border: 1.5px solid var(--border);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  font-family: var(--font-sans);
}
.ad-retry-btn:hover {
  background: var(--surface);
  border-color: var(--text-subtle);
}

.ad-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1.5rem;
  text-align: center;
}
.ad-empty-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--surface-alt);
  color: var(--text-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}
.ad-empty-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
}
.ad-empty-hint {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--text-subtle);
  margin: 0;
}

/* ── Recruit status display ── */
.ad-info-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.ad-info-card-header {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface-alt);
}
.ad-info-card-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-subtle);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ad-recruit-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  flex-wrap: wrap;
}
.ad-recruit-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.875rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.ad-recruit-badge-active {
  background: var(--accent-light);
  color: var(--accent);
  border-color: var(--accent-muted);
}
.ad-recruit-dates {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: var(--text-muted);
}
.ad-recruit-dates strong {
  color: var(--foreground);
  font-weight: 600;
}
.ad-dot {
  color: var(--text-subtle);
}
.ad-no-data {
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  color: var(--text-subtle);
  margin: 0;
}

/* ── Settings form ── */
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
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--foreground);
  letter-spacing: -0.01em;
}
.ad-required {
  color: var(--accent);
}
.ad-field-hint {
  font-size: 0.8rem;
  color: var(--text-subtle);
  margin: 0;
}
.ad-input {
  width: 100%;
  padding: 0.6875rem 1rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.5;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  -webkit-appearance: none;
  appearance: none;
}
.ad-input::placeholder {
  color: var(--text-subtle);
}
.ad-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.ad-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.ad-input-mono {
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}
.ad-input-error {
  border-color: #f87171;
}
.ad-input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px #fee2e2;
}
.ad-field-error {
  font-size: 0.8rem;
  font-weight: 500;
  color: #dc2626;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.ad-field-error::before {
  content: '!';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.65rem;
  font-weight: 800;
  font-family: var(--font-mono);
  flex-shrink: 0;
}

/* ── Feedback ── */
.ad-feedback {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
  align-self: flex-start;
}
.ad-feedback-ok {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.ad-feedback-err {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* ── Form actions ── */
.ad-form-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-soft);
}

.ad-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4375rem;
  padding: 0.6875rem 1.625rem;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 150ms ease, box-shadow 150ms ease, transform 100ms ease;
  box-shadow: 0 2px 8px rgb(79 70 229 / 0.25);
}
.ad-btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 14px rgb(79 70 229 / 0.35);
}
.ad-btn-primary:active { transform: translateY(1px); }
.ad-btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.ad-btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4375rem;
  padding: 0.6875rem 1.375rem;
  border-radius: 999px;
  background: transparent;
  color: #b91c1c;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  border: 1.5px solid #fecaca;
  cursor: pointer;
  transition: all 150ms ease;
}
.ad-btn-danger:hover {
  background: #fef2f2;
  border-color: #ef4444;
}
.ad-btn-danger:active { transform: translateY(1px); }
.ad-btn-danger:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

/* ── Notice box ── */
.ad-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  border-radius: var(--radius);
  background: var(--accent-light);
  border: 1px solid var(--accent-muted);
}
.ad-notice-icon {
  color: var(--accent);
  display: flex;
  align-items: center;
  margin-top: 0.0625rem;
  flex-shrink: 0;
}
.ad-notice-text {
  font-size: 0.9rem;
  color: #3730a3;
  margin: 0;
  line-height: 1.65;
}

/* ── Skeleton ── */
.ad-skel {
  border-radius: var(--radius);
  background: var(--surface-alt);
  animation: ad-skel-pulse 1.5s ease-in-out infinite;
}
.ad-skel-eyebrow {
  height: 1.5rem;
  width: 4rem;
  border-radius: 999px;
  margin-bottom: 0.5rem;
}
.ad-skel-title {
  height: 2.5rem;
  width: 14rem;
  margin-bottom: 2.5rem;
}
.ad-skel-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  padding: 0.875rem 1.375rem;
  background: var(--surface);
  gap: 0.75rem;
}
.ad-skel-tab {
  height: 1.25rem;
  width: 5rem;
}
.ad-skel-body {
  padding: 2rem 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.ad-skel-row {
  height: 3rem;
  width: 100%;
  border-radius: var(--radius);
}
`;
