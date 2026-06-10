'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ClubEvent } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────

function toYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatMonthLabel(year: number, month: number): string {
  return `${year}.${String(month + 1).padStart(2, '0')}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatDateFull(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${mo}.${day}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function buildCalendarGrid(year: number, month: number): Array<{ date: Date | null; dayNum: number | null }> {
  const days: Array<{ date: Date | null; dayNum: number | null }> = [];
  const firstDow = getFirstDayOfWeek(year, month);
  const totalDays = getDaysInMonth(year, month);

  // leading empty cells
  for (let i = 0; i < firstDow; i++) {
    days.push({ date: null, dayNum: null });
  }
  // actual days
  for (let d = 1; d <= totalDays; d++) {
    days.push({ date: new Date(year, month, d), dayNum: d });
  }
  // trailing empty cells to complete last row
  const remainder = days.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      days.push({ date: null, dayNum: null });
    }
  }
  return days;
}

function groupEventsByDate(events: ClubEvent[]): Record<string, ClubEvent[]> {
  const map: Record<string, ClubEvent[]> = {};
  for (const ev of events) {
    const key = toYYYYMMDD(new Date(ev.starts_at));
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  }
  return map;
}

// ─── Modal ────────────────────────────────────────────────────

function EventModal({
  date,
  events,
  onClose,
}: {
  date: Date;
  events: ClubEvent[];
  onClose: () => void;
}) {
  // Esc key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="cal-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="cal-modal"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Header */}
        <div className="cal-modal-head">
          <div>
            <span className="cal-modal-eyebrow">// EVENT</span>
            <h2 className="cal-modal-date">{formatDateFull(events[0].starts_at)}</h2>
          </div>
          <button
            className="cal-modal-close"
            onClick={onClose}
            aria-label="닫기"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Event list */}
        <div className="cal-modal-list">
          {events.map((ev, idx) => (
            <div key={ev.id} className="cal-modal-item">
              {idx > 0 && <div className="cal-modal-rule" />}
              <div className="cal-modal-item-inner">
                <div className="cal-modal-time">
                  <span className="cal-modal-time-start">{formatTime(ev.starts_at)}</span>
                  {ev.ends_at && (
                    <>
                      <span className="cal-modal-time-sep"> — </span>
                      <span className="cal-modal-time-end">{formatTime(ev.ends_at)}</span>
                    </>
                  )}
                </div>
                <h3 className="cal-modal-title">{ev.title}</h3>
                {ev.location && (
                  <div className="cal-modal-meta">
                    <span className="cal-modal-meta-k">LOC</span>
                    <span className="cal-modal-meta-v">{ev.location}</span>
                  </div>
                )}
                {ev.description && (
                  <p className="cal-modal-desc">{ev.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Cell ────────────────────────────────────────────

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const MAX_VISIBLE_EVENTS = 2; // titles shown in cell before "+N"

// ─── Main Component ───────────────────────────────────────────

export default function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<ClubEvent[]>([]);

  const fetchEvents = useCallback(async (y: number, mo: number) => {
    setLoading(true);
    setError(null);
    const from = toYYYYMMDD(new Date(y, mo, 1));
    const to = toYYYYMMDD(new Date(y, mo + 1, 0));
    try {
      const data = await api<ClubEvent[]>(`/events?from=${from}&to=${to}`, {
        cache: 'no-store',
      } as RequestInit);
      setEvents(data);
    } catch {
      setError('일정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(year, month);
  }, [year, month, fetchEvents]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const calGrid = buildCalendarGrid(year, month);
  const eventMap = groupEventsByDate(events);

  const openModal = (date: Date, dayEvents: ClubEvent[]) => {
    if (dayEvents.length === 0) return;
    setSelectedDate(date);
    setSelectedEvents(dayEvents);
  };
  const closeModal = () => {
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  // sorted events for the month index list
  const monthEvents = [...events].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  );

  const todayKey = toYYYYMMDD(today);

  return (
    <>
      <style>{`
        /* ── Page hero ── */
        .cal-hero {
          border-bottom: 1px solid var(--ink);
        }
        .cal-hero-inner {
          padding: 3.5rem 0 3rem;
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 900px) {
          .cal-hero-inner {
            grid-template-columns: 1fr 220px;
            align-items: end;
          }
        }
        .cal-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--vermilion);
          margin-bottom: 1.25rem;
        }
        .cal-hero-h1 {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(2.25rem, 6vw, 3.75rem);
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0;
        }
        .cal-hero-meta {
          display: none;
        }
        @media (min-width: 900px) {
          .cal-hero-meta {
            display: flex;
            flex-direction: column;
            border-left: 1px solid var(--hairline);
            padding-left: 2rem;
            padding-bottom: 0.25rem;
            gap: 0;
          }
        }
        .cal-meta-row {
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--hairline-soft);
        }
        .cal-meta-row:last-child { border-bottom: none; }
        .cal-meta-k {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-faint);
          display: block;
          margin-bottom: 0.15rem;
        }
        .cal-meta-v {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--ink);
        }

        /* ── Calendar section ── */
        .cal-section {
          padding: 2.5rem 0 4rem;
        }

        /* ── Month nav ── */
        .cal-nav {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--hairline);
          margin-bottom: 0;
        }
        .cal-nav-label {
          font-family: var(--font-mono);
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--ink);
        }
        .cal-nav-btns {
          display: flex;
          gap: 0;
        }
        .cal-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          background: none;
          border: 1px solid var(--hairline);
          border-radius: 0;
          font-family: var(--font-mono);
          font-size: 1rem;
          color: var(--ink-soft);
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
          line-height: 1;
        }
        .cal-nav-btn + .cal-nav-btn {
          border-left: none;
        }
        .cal-nav-btn:hover {
          background: var(--ink);
          color: var(--paper);
          border-color: var(--ink);
        }

        /* ── Grid ── */
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-left: 1px solid var(--hairline);
          border-top: 1px solid var(--hairline);
        }

        /* Day-of-week headers */
        .cal-dow {
          border-right: 1px solid var(--hairline);
          border-bottom: 1px solid var(--hairline);
          padding: 0.4rem 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-align: center;
          color: var(--ink-faint);
          background: var(--paper-deep);
        }
        .cal-dow:first-child { color: var(--vermilion); }
        .cal-dow:last-child  { color: var(--vermilion); opacity: 0.7; }

        /* Day cells */
        .cal-cell {
          border-right: 1px solid var(--hairline);
          border-bottom: 1px solid var(--hairline);
          min-height: 5.5rem;
          padding: 0.4rem 0.5rem 0.3rem;
          position: relative;
          transition: background 140ms ease;
          vertical-align: top;
        }
        @media (max-width: 640px) {
          .cal-cell { min-height: 3.25rem; padding: 0.3rem; }
        }

        .cal-cell-empty {
          background: var(--paper-deep);
          opacity: 0.55;
        }

        .cal-cell-has-events {
          cursor: pointer;
        }
        .cal-cell-has-events:hover {
          background: var(--paper-deep);
        }

        .cal-cell-today .cal-day-num {
          color: var(--vermilion) !important;
          font-weight: 600;
        }

        .cal-day-num {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
          line-height: 1;
          display: block;
          margin-bottom: 0.3rem;
        }

        /* Vermilion dot for days with events */
        .cal-event-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          background: var(--vermilion);
          border-radius: 0;
          margin-bottom: 0.35rem;
          flex-shrink: 0;
        }

        /* Event title pills in cell (desktop) */
        .cal-cell-events {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        @media (max-width: 640px) {
          .cal-cell-events { display: none; }
        }

        .cal-cell-ev-title {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.02em;
          color: var(--ink);
          background: var(--vermilion-tint);
          border-left: 2px solid var(--vermilion);
          padding: 0.1rem 0.3rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease;
          line-height: 1.5;
        }
        .cal-cell-ev-title:hover {
          background: var(--vermilion);
          color: var(--paper);
        }

        .cal-cell-ev-more {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          letter-spacing: 0.04em;
          color: var(--ink-faint);
          padding: 0.1rem 0.3rem;
          cursor: pointer;
        }
        .cal-cell-ev-more:hover { color: var(--vermilion); }

        /* Mobile: just dot */
        .cal-cell-dot-wrap {
          display: none;
          margin-top: 0.2rem;
        }
        @media (max-width: 640px) {
          .cal-cell-dot-wrap { display: flex; }
        }

        /* ── Month index list (visible always, prominent on mobile) ── */
        .cal-index {
          margin-top: 3rem;
          border-top: 1px solid var(--ink);
        }
        .cal-index-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 0;
          border-bottom: 1px solid var(--hairline);
        }
        .cal-index-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-soft);
        }
        .cal-index-count {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          color: var(--ink-faint);
        }
        .cal-index-row {
          display: grid;
          grid-template-columns: 7rem 1fr auto;
          align-items: baseline;
          gap: 1.25rem;
          padding: 1rem 0.5rem;
          border-bottom: 1px solid var(--hairline);
          cursor: pointer;
          transition: background 140ms ease;
        }
        @media (max-width: 480px) {
          .cal-index-row {
            grid-template-columns: 5.5rem 1fr auto;
            gap: 0.75rem;
          }
        }
        .cal-index-row:hover { background: var(--ink); }
        .cal-index-date {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--ink-faint);
          letter-spacing: 0.04em;
          transition: color 140ms ease;
        }
        .cal-index-row:hover .cal-index-date { color: rgba(246,244,238,0.45); }
        .cal-index-title {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 140ms ease;
        }
        .cal-index-row:hover .cal-index-title { color: var(--paper); }
        .cal-index-time {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--vermilion);
          white-space: nowrap;
          transition: color 140ms ease;
        }
        .cal-index-row:hover .cal-index-time { color: rgba(246,244,238,0.6); }

        /* ── State messages ── */
        .cal-state {
          padding: 3rem 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          letter-spacing: 0.04em;
          color: var(--ink-faint);
        }
        .cal-state-error { color: var(--vermilion); }
        .cal-loading-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0.5rem;
          border-bottom: 1px solid var(--hairline);
        }
        .cal-loading-bar {
          height: 1px;
          background: var(--hairline);
          flex: 1;
        }
        .cal-loading-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          color: var(--ink-faint);
          animation: blink 1.2s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
        .cal-retry-btn {
          margin-top: 1rem;
          display: inline-block;
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
        .cal-retry-btn:hover { background: var(--ink); color: var(--paper); }

        /* ── Modal ── */
        .cal-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(28,26,21,0.55);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .cal-modal {
          background: var(--paper);
          border: 1px solid var(--ink);
          border-radius: 0;
          width: 100%;
          max-width: 540px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: none;
        }
        .cal-modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 1.25rem;
          border-bottom: 1px solid var(--hairline);
        }
        .cal-modal-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          color: var(--vermilion);
          display: block;
          margin-bottom: 0.4rem;
        }
        .cal-modal-date {
          font-family: var(--font-mono);
          font-weight: 600;
          font-size: 1.1rem;
          letter-spacing: 0.04em;
          color: var(--ink);
          margin: 0;
        }
        .cal-modal-close {
          background: none;
          border: 1px solid var(--hairline);
          color: var(--ink-soft);
          font-family: var(--font-mono);
          font-size: 1.25rem;
          line-height: 1;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 0;
          transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }
        .cal-modal-close:hover {
          background: var(--ink);
          color: var(--paper);
          border-color: var(--ink);
        }
        .cal-modal-list {
          padding: 0.5rem 0;
        }
        .cal-modal-item {
          padding: 0;
        }
        .cal-modal-rule {
          height: 1px;
          background: var(--hairline);
          margin: 0 1.5rem;
        }
        .cal-modal-item-inner {
          padding: 1.25rem 1.5rem;
        }
        .cal-modal-time {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: var(--vermilion);
          margin-bottom: 0.45rem;
        }
        .cal-modal-time-sep { color: var(--ink-faint); }
        .cal-modal-time-end { color: var(--ink-faint); }
        .cal-modal-title {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--ink);
          margin: 0 0 0.65rem;
          line-height: 1.3;
        }
        .cal-modal-meta {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          margin-bottom: 0.5rem;
        }
        .cal-modal-meta-k {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-faint);
          flex-shrink: 0;
        }
        .cal-modal-meta-v {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--ink-soft);
        }
        .cal-modal-desc {
          font-size: 0.9rem;
          line-height: 1.75;
          color: var(--ink-soft);
          margin: 0.5rem 0 0;
        }
      `}</style>

      {/* ── Page Hero ─────────────────────────────────────────── */}
      <section className="cal-hero">
        <div className="container-page">
          <div className="cal-hero-inner">
            <div className="rise">
              <p className="cal-eyebrow rise rise-1">{'// CALENDAR — 일정'}</p>
              <h1 className="cal-hero-h1 rise rise-2">일정</h1>
            </div>
            <aside className="cal-hero-meta rise rise-3">
              <div className="cal-meta-row">
                <span className="cal-meta-k">Section</span>
                <span className="cal-meta-v">CALENDAR</span>
              </div>
              <div className="cal-meta-row">
                <span className="cal-meta-k">View</span>
                <span className="cal-meta-v">MONTHLY</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Calendar ──────────────────────────────────────────── */}
      <section className="cal-section">
        <div className="container-page">

          {/* Month nav */}
          <div className="cal-nav">
            <span className="cal-nav-label">{formatMonthLabel(year, month)}</span>
            <div className="cal-nav-btns">
              <button
                className="cal-nav-btn"
                onClick={prevMonth}
                aria-label="이전 달"
                type="button"
              >
                ←
              </button>
              <button
                className="cal-nav-btn"
                onClick={nextMonth}
                aria-label="다음 달"
                type="button"
              >
                →
              </button>
            </div>
          </div>

          {/* Day-of-week headers */}
          <div className="cal-grid">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="cal-dow">{d}</div>
            ))}

            {/* Cells */}
            {calGrid.map((cell, idx) => {
              if (!cell.date || !cell.dayNum) {
                return <div key={`empty-${idx}`} className="cal-cell cal-cell-empty" />;
              }
              const dateKey = toYYYYMMDD(cell.date);
              const dayEvents = eventMap[dateKey] ?? [];
              const hasEvents = dayEvents.length > 0;
              const isToday = dateKey === todayKey;

              const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
              const overflowCount = dayEvents.length - MAX_VISIBLE_EVENTS;

              return (
                <div
                  key={dateKey}
                  className={[
                    'cal-cell',
                    hasEvents ? 'cal-cell-has-events' : '',
                    isToday ? 'cal-cell-today' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => hasEvents && openModal(cell.date!, dayEvents)}
                  role={hasEvents ? 'button' : undefined}
                  tabIndex={hasEvents ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (hasEvents && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      openModal(cell.date!, dayEvents);
                    }
                  }}
                  aria-label={hasEvents ? `${cell.dayNum}일 — 일정 ${dayEvents.length}건` : undefined}
                >
                  <span className="cal-day-num">{String(cell.dayNum).padStart(2, '0')}</span>

                  {/* Desktop: event titles */}
                  {hasEvents && (
                    <div className="cal-cell-events">
                      {visibleEvents.map((ev) => (
                        <span key={ev.id} className="cal-cell-ev-title">
                          {ev.title}
                        </span>
                      ))}
                      {overflowCount > 0 && (
                        <span className="cal-cell-ev-more">+{overflowCount}</span>
                      )}
                    </div>
                  )}

                  {/* Mobile: dot only */}
                  {hasEvents && (
                    <div className="cal-cell-dot-wrap">
                      <span className="cal-event-dot" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Month event index ────────────────────────────── */}
          <div className="cal-index">
            <div className="cal-index-head">
              <span className="section-label">
                <span className="no">●</span>
                이번 달 일정
              </span>
              {!loading && !error && (
                <span className="cal-index-count">
                  {monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'}
                </span>
              )}
            </div>

            {loading ? (
              <div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="cal-loading-row">
                    <div className="cal-loading-bar" />
                    {i === 0 && (
                      <span className="cal-loading-label">{'// loading...'}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="cal-state cal-state-error">
                <p>{'// 오류: '}{error}</p>
                <button
                  className="cal-retry-btn"
                  onClick={() => fetchEvents(year, month)}
                  type="button"
                >
                  RETRY
                </button>
              </div>
            ) : monthEvents.length === 0 ? (
              <div className="cal-state">
                <p>{'// 이번 달 일정이 없습니다'}</p>
              </div>
            ) : (
              <div>
                {monthEvents.map((ev) => {
                  const evDate = new Date(ev.starts_at);
                  const evDateKey = toYYYYMMDD(evDate);
                  const allDayEvents = eventMap[evDateKey] ?? [ev];
                  return (
                    <div
                      key={ev.id}
                      className="cal-index-row"
                      onClick={() => openModal(evDate, allDayEvents)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openModal(evDate, allDayEvents);
                        }
                      }}
                    >
                      <span className="cal-index-date">{formatDateFull(ev.starts_at)}</span>
                      <span className="cal-index-title">{ev.title}</span>
                      <span className="cal-index-time">{formatTime(ev.starts_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Event Modal ───────────────────────────────────────── */}
      {selectedDate && selectedEvents.length > 0 && (
        <EventModal
          date={selectedDate}
          events={selectedEvents}
          onClose={closeModal}
        />
      )}
    </>
  );
}
