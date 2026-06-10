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
  { key: '', label: '전체', mono: 'all' },
  { key: 'project', label: '프로젝트', mono: 'project' },
  { key: 'study', label: '스터디', mono: 'study' },
  { key: 'event', label: '행사', mono: 'event' },
] as const;

type ActivityType = Activity['type'];

// Per-type color motifs for thumbnail placeholders
const TYPE_MOTIF: Record<ActivityType, { bg: string; line: string; char: string }> = {
  project: { bg: '#eef2ff', line: '#4f46e5', char: '<>' },
  study:   { bg: '#f0fdf4', line: '#16a34a', char: '{}' },
  event:   { bg: '#fff7ed', line: '#ea580c', char: '#!' },
};

const TYPE_BADGE: Record<ActivityType, { bg: string; color: string; label: string }> = {
  project: { bg: 'var(--accent-light)', color: 'var(--accent)', label: '프로젝트' },
  study:   { bg: '#dcfce7', color: '#15803d', label: '스터디' },
  event:   { bg: '#ffedd5', color: '#c2410c', label: '행사' },
};

// ─── SVG Icons ─────────────────────────────────────────────────
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function IconEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="8" width="32" height="32" rx="6" />
      <path d="M16 24h16M24 16v16" opacity="0.35" />
    </svg>
  );
}

// ─── Thumbnail placeholder SVG (inline) ───────────────────────
function MotifBlock({ type, title }: { type: ActivityType; title: string }) {
  const m = TYPE_MOTIF[type];
  // Use first two characters of title as large typographic motif
  const glyph = title.slice(0, 2);
  return (
    <div
      aria-hidden="true"
      style={{
        background: m.bg,
        borderBottom: `1px solid var(--border)`,
        height: '11rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Background grid lines */}
      <svg
        width="100%" height="100%"
        viewBox="0 0 320 176"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Diagonal stripe lines */}
        {[-3,-2,-1,0,1,2,3,4,5,6,7].map((i) => (
          <line
            key={i}
            x1={i * 48 - 48}
            y1="0"
            x2={i * 48 + 176}
            y2="176"
            stroke={m.line}
            strokeWidth="0.75"
            opacity="0.12"
          />
        ))}
        {/* Corner accent bracket */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="52"
          fontWeight="800"
          fill={m.line}
          opacity="0.10"
          letterSpacing="-2"
        >
          {m.char}
        </text>
      </svg>
      {/* Large initials */}
      <span
        style={{
          position: 'relative',
          fontFamily: 'var(--font-mono)',
          fontSize: '2.75rem',
          fontWeight: 800,
          color: m.line,
          opacity: 0.55,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {glyph}
      </span>
    </div>
  );
}

// ─── Activity Card ─────────────────────────────────────────────
function ActivityCard({ activity }: { activity: Activity }) {
  const badge = TYPE_BADGE[activity.type];
  return (
    <Link href={`/activities/${activity.id}`} className="act-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      {/* Thumbnail or motif block */}
      {activity.thumbnail_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={activity.thumbnail_url}
          alt={activity.title}
          style={{ width: '100%', height: '11rem', objectFit: 'cover', display: 'block', borderBottom: '1px solid var(--border)' }}
        />
      ) : (
        <MotifBlock type={activity.type} title={activity.title} />
      )}

      <div className="act-card-body">
        {/* Year + type badge row */}
        <div className="act-card-meta-row">
          <span className="act-year">{activity.year}</span>
          <span
            className="act-badge"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        </div>

        {/* Title */}
        <h2 className="act-title">{activity.title}</h2>

        {/* Description excerpt */}
        {activity.description && (
          <p className="act-desc">{activity.description}</p>
        )}

        {/* Tags */}
        {activity.tags.length > 0 && (
          <div className="act-tags">
            {activity.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="act-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
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
        /* ── Page Hero ── */
        .act-hero {
          position: relative;
          overflow: hidden;
          padding: 5rem 1.25rem 3.5rem;
        }
        @media (min-width: 640px) {
          .act-hero { padding: 6rem 2rem 4rem; }
        }
        @media (min-width: 1024px) {
          .act-hero { padding: 7rem 2.5rem 5rem; }
        }
        .act-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border-soft) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%);
          pointer-events: none;
        }
        .act-hero-inner {
          position: relative;
          max-width: 680px;
        }
        .act-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.3rem 0.875rem;
          border-radius: 999px;
          background: var(--accent-light);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          border: 1px solid var(--accent-muted);
        }
        .act-hero-h1 {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.15;
          color: var(--foreground);
          margin: 0 0 1rem;
        }
        .act-hero-sub {
          font-size: 1.0625rem;
          color: var(--text-muted);
          line-height: 1.8;
          margin: 0;
          max-width: 480px;
        }

        /* ── Filter Tabs ── */
        .act-tabs-wrap {
          border-bottom: 1px solid var(--border);
          background: var(--background);
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
          padding-inline: 1.25rem;
          max-width: 1140px;
          margin-inline: auto;
        }
        .act-tabs::-webkit-scrollbar { display: none; }
        @media (min-width: 640px) {
          .act-tabs { padding-inline: 2rem; }
        }
        @media (min-width: 1024px) {
          .act-tabs { padding-inline: 2.5rem; }
        }
        .act-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.9375rem 0.75rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-muted);
          text-decoration: none;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: color 150ms ease, border-color 150ms ease;
          letter-spacing: -0.01em;
        }
        .act-tab:hover {
          color: var(--foreground);
        }
        .act-tab-active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        .act-tab-mono {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          opacity: 0.6;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        /* ── Cards Section ── */
        .act-section {
          padding: 3rem 1.25rem 5rem;
        }
        @media (min-width: 640px) {
          .act-section { padding: 3.5rem 2rem 5rem; }
        }
        @media (min-width: 1024px) {
          .act-section { padding: 4rem 2.5rem 6rem; }
        }
        .act-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 560px) {
          .act-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .act-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ── Card ── */
        .act-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease;
        }
        .act-card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-2px);
          border-color: var(--accent-muted);
        }
        .act-card-body {
          padding: 1.375rem 1.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          flex: 1;
        }
        .act-card-meta-row {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-wrap: wrap;
        }
        .act-year {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-subtle);
          letter-spacing: 0.04em;
        }
        .act-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.1875rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .act-title {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--foreground);
          line-height: 1.45;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .act-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.65;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .act-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-top: 0.25rem;
        }
        .act-tag {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(--text-muted);
          background: var(--surface-alt);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.125rem 0.5rem;
          letter-spacing: 0.01em;
        }

        /* ── Empty State ── */
        .act-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 5rem 2rem;
          border: 1.5px dashed var(--border);
          border-radius: var(--radius-lg);
          text-align: center;
          color: var(--text-subtle);
        }
        .act-empty-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-muted);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .act-empty-sub {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: var(--text-subtle);
          margin: 0;
          letter-spacing: 0.01em;
        }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="act-hero">
        <div className="act-hero-grid" />
        <div className="container-page">
          <div className="act-hero-inner">
            <span className="act-eyebrow">Archive</span>
            <h1 className="act-hero-h1">활동 아카이브</h1>
            <p className="act-hero-sub">
              세미콜론이 쌓아온 프로젝트·스터디·행사의 기록입니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── Filter Tabs ─────────────────────────────────────────── */}
      <div className="act-tabs-wrap">
        <nav className="act-tabs" aria-label="활동 유형 필터">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key ? `/activities?type=${tab.key}` : '/activities'}
              className={`act-tab${activeType === tab.key ? ' act-tab-active' : ''}`}
              aria-current={activeType === tab.key ? 'page' : undefined}
            >
              {tab.label}
              <span className="act-tab-mono">{tab.mono}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Cards ───────────────────────────────────────────────── */}
      <section className="act-section">
        <div className="container-page">
          <div className="act-grid">
            {activities.length === 0 ? (
              <div className="act-empty">
                <IconEmpty />
                <div>
                  <p className="act-empty-title">아직 등록된 활동이 없어요</p>
                  <p className="act-empty-sub">// activities not found</p>
                </div>
              </div>
            ) : (
              activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
