'use client';

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 1.25rem',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          letterSpacing: '0.06em',
          color: 'var(--vermilion)',
          margin: 0,
        }}
      >
        {'// RUNTIME ERROR'}
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 900,
          fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)',
          margin: '1rem 0 0.75rem',
        }}
      >
        문제가 발생했습니다
      </h1>
      <p style={{ color: 'var(--ink-soft)', margin: '0 0 2rem' }}>
        일시적인 오류일 수 있습니다. 다시 시도해 주세요.
      </p>
      <button type="button" className="btn btn-primary" onClick={() => reset()}>
        다시 시도 →
      </button>
    </div>
  );
}
