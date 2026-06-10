import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
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
const TYPE_LABEL: Record<Activity['type'], string> = {
  project: 'PROJECT',
  study:   'STUDY',
  event:   'EVENT',
};

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
  } catch {
    // 404든 일시적 오류든 상세를 보여줄 수 없으므로 동일하게 처리
    notFound();
  }

  const typeLabel = TYPE_LABEL[activity.type];

  return (
    <>
      <style>{`
        /* ── Detail Page ── */
        .detail-page {
          min-height: 60vh;
        }

        /* ── Page header ── */
        .detail-hero {
          border-bottom: 1px solid var(--ink);
        }
        .detail-hero-inner {
          padding: 3rem 0 3rem;
          max-width: 760px;
        }

        /* Back link */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-faint);
          text-decoration: none;
          margin-bottom: 2.25rem;
          transition: color 140ms ease;
        }
        .back-link:hover {
          color: var(--vermilion);
        }
        .back-link-arrow {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          line-height: 1;
        }

        /* Meta + headline block */
        .detail-meta-line {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .detail-meta-year {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          color: var(--ink-faint);
        }
        .detail-meta-sep {
          font-family: var(--font-mono);
          font-size: 0.35rem;
          color: var(--vermilion);
          line-height: 1;
        }
        .detail-meta-type {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--vermilion);
        }
        .detail-meta-tags-inline {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          color: var(--ink-faint);
        }
        .detail-h1 {
          font-family: var(--font-serif);
          font-weight: 900;
          font-size: clamp(1.875rem, 5vw, 3rem);
          line-height: 1.18;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0;
        }

        /* ── Body section ── */
        .detail-body-section {
          padding: 3rem 0 5rem;
          max-width: 760px;
        }

        /* Thumbnail —괘선 프레임 */
        .detail-thumb-frame {
          border: 1px solid var(--hairline);
          margin-bottom: 2.5rem;
          overflow: hidden;
        }
        .detail-thumb-frame img {
          width: 100%;
          max-height: 26rem;
          object-fit: cover;
          display: block;
        }

        /* Description */
        .detail-description {
          font-size: 1.0rem;
          color: var(--ink-soft);
          line-height: 1.9;
          white-space: pre-wrap;
          margin: 0;
        }

        /* Tags */
        .detail-tags-block {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--hairline);
        }
        .detail-tags-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-faint);
          margin-bottom: 0.75rem;
          display: block;
        }
        .detail-tags-text {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--ink-soft);
          letter-spacing: 0.03em;
          line-height: 1.6;
          margin: 0;
        }
      `}</style>

      <div className="detail-page">
        {/* ── Page Header ─────────────────────────────────────── */}
        <section className="detail-hero">
          <div className="container-page">
            <div className="detail-hero-inner rise">
              {/* Back link */}
              <Link href="/activities" className="back-link rise rise-1">
                <span className="back-link-arrow">←</span>
                INDEX
              </Link>

              {/* Meta line */}
              <div className="detail-meta-line rise rise-2">
                <span className="detail-meta-year">{activity.year}</span>
                <span className="detail-meta-sep" aria-hidden="true">●</span>
                <span className="detail-meta-type">{typeLabel}</span>
                {activity.tags.length > 0 && (
                  <>
                    <span className="detail-meta-sep" aria-hidden="true">●</span>
                    <span className="detail-meta-tags-inline">
                      {activity.tags.slice(0, 4).join(', ')}
                    </span>
                  </>
                )}
              </div>

              {/* Headline */}
              <h1 className="detail-h1 rise rise-3">{activity.title}</h1>
            </div>
          </div>
        </section>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="container-page">
          <div className="detail-body-section rise rise-4">
            {/* Thumbnail — 괘선 프레임, 본문 위에 */}
            {activity.thumbnail_url && (
              <div className="detail-thumb-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activity.thumbnail_url} alt={activity.title} />
              </div>
            )}

            {/* Description */}
            {activity.description && (
              <p className="detail-description">{activity.description}</p>
            )}

            {/* Tags — 모노 텍스트, 쉼표 구분 */}
            {activity.tags.length > 0 && (
              <div className="detail-tags-block">
                <span className="detail-tags-label">Tags</span>
                <p className="detail-tags-text">
                  {activity.tags.join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
