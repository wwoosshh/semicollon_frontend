export default function Home() {
  return (
    <section
      style={{
        minHeight: 'calc(100dvh - 3.75rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        padding: '4rem 1.25rem',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '640px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
        }}
      >
        {/* Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 1rem',
            borderRadius: '999px',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1em',
            }}
          >
            ;
          </span>
          개발 동아리 세미콜론
        </span>

        {/* Heading */}
        <h1
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--foreground)',
            margin: 0,
          }}
        >
          코드로 연결되는
          <br />
          <span style={{ color: 'var(--accent)' }}>우리의 이야기</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-muted)',
            lineHeight: 1.75,
            margin: 0,
            maxWidth: '480px',
          }}
        >
          세미콜론은 함께 배우고, 만들고, 성장하는 개발 동아리입니다.
          <br />
          새로운 시작을 기다리고 있습니다.
        </p>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            gap: '0.875rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <a href="/recruit" className="btn btn-primary">
            지금 지원하기
          </a>
          <a href="/about" className="btn btn-ghost">
            동아리 소개
          </a>
        </div>

        {/* Monospace decorative note */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: 'var(--text-subtle)',
            margin: 0,
            marginTop: '0.5rem',
          }}
        >
          {/* Hero content will be expanded in Task 3 */}
          {'// more content coming soon'}
        </p>
      </div>
    </section>
  );
}
