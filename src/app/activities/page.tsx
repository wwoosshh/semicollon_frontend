import type { Metadata } from 'next';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Activity } from '@/lib/types';

export const metadata: Metadata = {
  title: '활동 | 세미콜론',
  description: '세미콜론의 프로젝트·스터디·행사 아카이브',
};

// ─── Data ─────────────────────────────────────────────────────
async function fetchActivities(type?: string): Promise<Activity[]> {
  try {
    const path = type ? `/activities?type=${type}` : '/activities';
    return await api<Activity[]>(path, { cache: 'no-store' });
  } catch (e) {
    if (e instanceof ApiError) return [];
    return [];
  }
}

// ─── Constants ────────────────────────────────────────────────
const TABS = [
  { key: '', label: '전체', mono: 'ALL' },
  { key: 'project', label: '프로젝트', mono: 'PROJECT' },
  { key: 'study', label: '스터디', mono: 'STUDY' },
  { key: 'event', label: '행사', mono: 'EVENT' },
] as const;

type ActivityType = Activity['type'];

const TYPE_LABEL: Record<ActivityType, string> = {
  project: 'PROJECT',
  study:   'STUDY',
  event:   'EVENT',
};

// ─── Activity Row (archive index style) ───────────────────────
function ActivityRow({ activity, index }: { activity: Activity; index: number }) {
  const typeLabel = TYPE_LABEL[activity.type];
  const idx = String(index + 1).padStart(2, '0');

  return (
    <Link href={`/activities/${activity.id}`} className="act-row vt-rise" style={{ textDecoration: 'none', color: 'inherit' }}>
      {/* Left column: index + meta + title */}
      <div className="act-row-main">
        <span className="act-row-idx" aria-hidden="true">{idx}</span>
        <div className="act-row-body">
          <div className="act-row-meta">
            <span className="act-row-year">{activity.year}</span>
            <span className="act-row-dot" aria-hidden="true">●</span>
            <span className="act-row-type">{typeLabel}</span>
          </div>
          <h2 className="act-row-title">{activity.title}</h2>
          {activity.tags.length > 0 && (
            <p className="act-row-tags">
              {activity.tags.slice(0, 5).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Right column: thumbnail (only if present) */}
      {activity.thumbnail_url && (
        <div className="act-row-thumb-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activity.thumbnail_url}
            alt=""
            className="act-row-thumb"
          />
        </div>
      )}
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const typeParam = typeof sp.type === 'string' ? sp.type : undefined;
  const activeType = TABS.find((t) => t.key === typeParam)?.key ?? '';

  const activities = await fetchActivities(activeType || undefined);

  return (
    <>
      <style>{`
        /* ── Page Header ── */
        .act-hero {
          border-bottom: 1px solid var(--ink);
        }
        .act-hero-inner {
          padding: 3.5rem 0 3rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        @media (min-width: 900px) {
          .act-hero-inner {
            grid-template-columns: 1fr 220px;
            align-items: end;
          }
        }
        .act-hero-main {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .act-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--vermilion);
          margin-bottom: 1.25rem;
        }
        .act-hero-h1 {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(2.25rem, 6vw, 3.75rem);
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0;
        }

        /* Page-level meta (right column) */
        .act-hero-meta {
          display: none;
        }
        @media (min-width: 900px) {
          .act-hero-meta {
            display: flex;
            flex-direction: column;
            border-left: 1px solid var(--hairline);
            padding-left: 2rem;
            padding-bottom: 0.25rem;
            gap: 0;
          }
        }
        .act-meta-row {
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--hairline-soft);
        }
        .act-meta-row:last-child { border-bottom: none; }
        .act-meta-k {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-faint);
          display: block;
          margin-bottom: 0.15rem;
        }
        .act-meta-v {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--ink);
        }

        /* ── Filter Tabs ── */
        .act-tabs-wrap {
          border-bottom: 1px solid var(--ink);
          background: var(--paper);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .act-tabs {
          display: flex;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .act-tabs::-webkit-scrollbar { display: none; }
        .act-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 0;
          margin-right: 2rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-faint);
          text-decoration: none;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: color 140ms ease, border-color 140ms ease;
        }
        .act-tab:hover {
          color: var(--ink);
        }
        .act-tab-active {
          color: var(--ink);
          border-bottom-color: var(--vermilion);
        }

        /* ── Archive Index List ── */
        .act-list-section {
          padding-bottom: 5rem;
        }
        .act-list-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 0;
          border-bottom: 1px solid var(--hairline);
        }
        .act-list-count {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-faint);
        }

        /* ── Activity Row ── */
        .act-row {
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1.4rem 0.5rem;
          border-bottom: 1px solid var(--hairline);
          transition: background 140ms ease;
          cursor: pointer;
        }
        .act-row:hover {
          background: var(--ink);
        }

        .act-row-main {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          flex: 1;
          min-width: 0;
        }

        .act-row-idx {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--ink-faint);
          letter-spacing: 0.06em;
          flex-shrink: 0;
          padding-top: 0.2rem;
          min-width: 1.5rem;
          transition: color 140ms ease;
        }
        .act-row:hover .act-row-idx {
          color: var(--vermilion);
        }

        .act-row-body {
          flex: 1;
          min-width: 0;
        }

        .act-row-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.3rem;
        }
        .act-row-year {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          color: var(--ink-faint);
          transition: color 140ms ease;
        }
        .act-row:hover .act-row-year {
          color: rgba(246,244,238,0.45);
        }
        .act-row-dot {
          font-size: 0.35rem;
          color: var(--vermilion);
          line-height: 1;
          transition: color 140ms ease;
        }
        .act-row:hover .act-row-dot {
          color: var(--vermilion);
        }
        .act-row-type {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--vermilion);
          transition: color 140ms ease;
        }
        .act-row:hover .act-row-type {
          color: var(--vermilion);
        }

        .act-row-title {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--ink);
          line-height: 1.35;
          margin: 0 0 0.35rem;
          transition: color 140ms ease;
        }
        .act-row:hover .act-row-title {
          color: var(--paper);
        }

        .act-row-tags {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--ink-faint);
          margin: 0;
          letter-spacing: 0.02em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 140ms ease;
        }
        .act-row:hover .act-row-tags {
          color: rgba(246,244,238,0.4);
        }

        /* Thumbnail — small, right-aligned, grayscale default */
        .act-row-thumb-wrap {
          flex-shrink: 0;
          width: 5.5rem;
          height: 4rem;
          overflow: hidden;
          border: 1px solid var(--hairline);
          align-self: center;
          transition: border-color 140ms ease;
        }
        @media (min-width: 640px) {
          .act-row-thumb-wrap {
            width: 7.5rem;
            height: 5rem;
          }
        }
        .act-row:hover .act-row-thumb-wrap {
          border-color: var(--ink-soft);
        }
        .act-row-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(100%);
          transition: filter 220ms ease;
        }
        .act-row:hover .act-row-thumb {
          filter: grayscale(0%);
        }

        /* ── Empty State ── */
        .act-empty {
          padding: 4rem 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--ink-faint);
          letter-spacing: 0.04em;
        }
      `}</style>

      {/* ── Page Header ──────────────────────────────────────── */}
      <section className="act-hero">
        <div className="container-page">
          <div className="act-hero-inner">
            <div className="act-hero-main rise">
              <p className="act-eyebrow rise rise-1">{'// ACTIVITIES — ARCHIVE'}</p>
              <h1 className="act-hero-h1 rise rise-2">활동 아카이브</h1>
            </div>
            <aside className="act-hero-meta rise rise-3">
              <div className="act-meta-row">
                <span className="act-meta-k">Section</span>
                <span className="act-meta-v">ACTIVITIES</span>
              </div>
              <div className="act-meta-row">
                <span className="act-meta-k">Type</span>
                <span className="act-meta-v">PROJECT / STUDY / EVENT</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Filter Tabs ─────────────────────────────────────────── */}
      <div className="act-tabs-wrap">
        <nav className="container-page act-tabs" aria-label="활동 유형 필터">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key ? `/activities?type=${tab.key}` : '/activities'}
              className={`act-tab${activeType === tab.key ? ' act-tab-active' : ''}`}
              aria-current={activeType === tab.key ? 'page' : undefined}
            >
              {tab.mono}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Archive Index ────────────────────────────────────────── */}
      <section className="act-list-section">
        <div className="container-page">
          <div className="act-list-head">
            <span className="section-label">
              <span className="no">●</span>
              {activeType
                ? TYPE_LABEL[activeType as ActivityType]
                : 'ALL ACTIVITIES'}
            </span>
            <span className="act-list-count">
              {activities.length} {activities.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {activities.length === 0 ? (
            <p className="act-empty">{'// 등록된 활동이 없습니다'}</p>
          ) : (
            <div>
              {activities.map((activity, i) => (
                <ActivityRow key={activity.id} activity={activity} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
