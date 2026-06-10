import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { Activity } from '@/lib/types';

// ─── Data ─────────────────────────────────────────────────────
async function fetchActivity(id: string): Promise<Activity> {
  return api<Activity>(`/activities/${id}`, { cache: 'no-store' });
}

// ─── Metadata ─────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const activity = await fetchActivity(id);
    return {
      title: `${activity.title} | 세미콜론`,
      description: activity.description ?? undefined,
    };
  } catch {
    return { title: '활동 | 세미콜론' };
  }
}

// ─── Constants ────────────────────────────────────────────────
const TYPE_BADGE: Record<Activity['type'], { bg: string; color: string; label: string }> = {
  project: { bg: 'var(--accent-light)', color: 'var(--accent)', label: '프로젝트' },
  study:   { bg: '#dcfce7', color: '#15803d', label: '스터디' },
  event:   { bg: '#ffedd5', color: '#c2410c', label: '행사' },
};

// ─── SVG Icons ─────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 8H3M7 12l-4-4 4-4" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let activity: Activity;
  try {
    activity = await fetchActivity(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    notFound();
  }

  const badge = TYPE_BADGE[activity.type];

  return (
    <>
      <style>{`
        /* ── Detail Page ── */
        .detail-wrap {
          min-height: 60vh;
          padding: 4rem 1.25rem 6rem;
        }
        @media (min-width: 640px) {
          .detail-wrap { padding: 5rem 2rem 7rem; }
        }
        @media (min-width: 1024px) {
          .detail-wrap { padding: 5.5rem 2.5rem 7rem; }
        }
        .detail-inner {
          max-width: 760px;
        }

        /* Back link */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 2.5rem;
          transition: color 150ms ease, gap 150ms ease;
          letter-spacing: -0.01em;
        }
        .back-link:hover {
          color: var(--accent);
          gap: 0.5625rem;
        }

        /* Header block */
        .detail-header {
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 2rem;
        }
        .detail-meta-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1.125rem;
        }
        .detail-year {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-subtle);
          letter-spacing: 0.06em;
        }
        .detail-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .detail-h1 {
          font-size: clamp(1.75rem, 4.5vw, 2.75rem);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.18;
          color: var(--foreground);
          margin: 0;
        }

        /* Thumbnail */
        .detail-thumbnail {
          width: 100%;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow: hidden;
          margin-bottom: 2.5rem;
          box-shadow: var(--shadow-sm);
        }
        .detail-thumbnail img {
          width: 100%;
          max-height: 24rem;
          object-fit: cover;
          display: block;
        }

        /* Body */
        .detail-body {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .detail-description {
          font-size: 1.0625rem;
          color: var(--text-muted);
          line-height: 1.85;
          white-space: pre-wrap;
          margin: 0;
        }

        /* Tags */
        .detail-tags-section {}
        .detail-tags-label {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-subtle);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .detail-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .detail-tag {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-muted);
          background: var(--surface-alt);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.3125rem 0.75rem;
          letter-spacing: 0.01em;
          transition: border-color 150ms ease, color 150ms ease;
        }
        .detail-tag:hover {
          border-color: var(--accent-muted);
          color: var(--accent);
        }

        /* Divider */
        .detail-hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 0;
        }
      `}</style>

      <div className="detail-wrap">
        <div className="container-page">
          <div className="detail-inner">
            {/* Back link */}
            <Link href="/activities" className="back-link">
              <IconBack />
              활동 목록으로
            </Link>

            {/* Thumbnail */}
            {activity.thumbnail_url && (
              <div className="detail-thumbnail">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activity.thumbnail_url} alt={activity.title} />
              </div>
            )}

            {/* Header */}
            <div className="detail-header">
              <div className="detail-meta-row">
                <span className="detail-year">{activity.year}</span>
                <span
                  className="detail-badge"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              </div>
              <h1 className="detail-h1">{activity.title}</h1>
            </div>

            <div className="detail-body">
              {/* Description */}
              {activity.description && (
                <p className="detail-description">{activity.description}</p>
              )}

              {/* Tags */}
              {activity.tags.length > 0 && (
                <>
                  <hr className="detail-hr" />
                  <div className="detail-tags-section">
                    <p className="detail-tags-label">
                      <IconTag />
                      Tags
                    </p>
                    <div className="detail-tags">
                      {activity.tags.map((tag) => (
                        <span key={tag} className="detail-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
