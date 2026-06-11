import Link from 'next/link';

export default function NotFound() {
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
        {'// 404 — PAGE NOT FOUND'}
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 900,
          fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)',
          margin: '1rem 0 0.75rem',
        }}
      >
        이 페이지는 조판되지 않았습니다
      </h1>
      <p style={{ color: 'var(--ink-soft)', margin: '0 0 2rem' }}>
        주소가 바뀌었거나 삭제된 페이지일 수 있습니다.
      </p>
      <Link href="/" className="btn btn-ghost">
        ← 첫 페이지로
      </Link>
    </div>
  );
}
