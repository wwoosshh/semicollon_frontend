'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ─── Schema ───────────────────────────────────────────────────
const schema = z.object({
  email: z.string().min(1, '이메일을 입력해 주세요.').email('올바른 이메일 형식을 입력해 주세요.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});

type FormValues = z.infer<typeof schema>;

// ─── Spinner ──────────────────────────────────────────────────
function IconSpinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ animation: 'auth-spin 0.75s linear infinite' }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ─── Login Form ───────────────────────────────────────────────
export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setServerError('이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    router.push('/');
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="auth-page">
        {/* 왼쪽 아이덴티티 패널 */}
        <aside className="auth-side" aria-hidden="true">
          <div className="auth-side-inner">
            <Link href="/" className="auth-side-logo">
              Semicollon<span className="auth-side-semi">;</span>
            </Link>
            <p className="auth-side-tagline">
              한 줄의 끝에서,<br />같이 다음 줄을 쓴다<span style={{ color: 'var(--vermilion)' }}>;</span>
            </p>
            <div className="auth-side-meta">
              <div className="auth-side-meta-row">
                <span className="auth-side-meta-k">Type</span>
                <span className="auth-side-meta-v">Member Portal</span>
              </div>
              <div className="auth-side-meta-row">
                <span className="auth-side-meta-k">Access</span>
                <span className="auth-side-meta-v">부원 전용</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 오른쪽 폼 패널 */}
        <main className="auth-main">
          <div className="auth-form-wrap">
            {/* 헤더 */}
            <div className="auth-form-header">
              <Link href="/" className="auth-mobile-logo">
                Semicollon<span style={{ color: 'var(--vermilion)' }}>;</span>
              </Link>
              <p className="auth-form-eyebrow">SIGN IN</p>
              <h1 className="auth-form-title">로그인</h1>
              <p className="auth-form-subtitle">세미콜론 부원 계정으로 로그인하세요.</p>
            </div>

            {/* 폼 */}
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* 서버 에러 */}
              {serverError && (
                <div className="auth-server-error" role="alert">
                  <span className="auth-server-error-tag">ERROR</span>
                  <p className="auth-server-error-text">{serverError}</p>
                </div>
              )}

              {/* 01 이메일 */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-email">
                  <span className="auth-field-no">01</span>
                  이메일
                  <span className="auth-required" aria-hidden="true"> *</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  className={`auth-input${errors.email ? ' auth-input-error' : ''}`}
                  placeholder="hong@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="login-email-error" className="auth-error" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* 02 비밀번호 */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-password">
                  <span className="auth-field-no">02</span>
                  비밀번호
                  <span className="auth-required" aria-hidden="true"> *</span>
                </label>
                <input
                  id="login-password"
                  type="password"
                  className={`auth-input${errors.password ? ' auth-input-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  {...register('password')}
                />
                {errors.password && (
                  <p id="login-password-error" className="auth-error" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* 제출 */}
              <div className="auth-submit-row">
                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <IconSpinner />
                      로그인 중…
                    </>
                  ) : (
                    '로그인'
                  )}
                </button>
              </div>
            </form>

            {/* 푸터 링크 */}
            <div className="auth-form-footer">
              <p className="auth-footer-text">
                아직 계정이 없으신가요?{' '}
                <Link href="/signup" className="auth-footer-link">
                  부원 가입
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const STYLES = `
@keyframes auth-spin {
  to { transform: rotate(360deg); }
}
@keyframes auth-rise {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── 2단 레이아웃: 왼쪽 아이덴티티 | 오른쪽 폼 ── */
.auth-page {
  min-height: calc(100dvh - 3.75rem);
  display: flex;
  flex-direction: column;
}
@media (min-width: 760px) {
  .auth-page {
    flex-direction: row;
  }
}

/* 왼쪽 패널 — 잉크 반전 */
.auth-side {
  display: none;
}
@media (min-width: 760px) {
  .auth-side {
    display: flex;
    flex-direction: column;
    width: 300px;
    flex-shrink: 0;
    background: var(--ink);
    border-right: 1px solid var(--ink);
  }
}
@media (min-width: 1024px) {
  .auth-side { width: 360px; }
}
.auth-side-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem 2.5rem;
}
.auth-side-logo {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
  color: var(--paper);
  text-decoration: none;
}
.auth-side-semi { color: var(--vermilion); }
.auth-side-tagline {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 1.45rem;
  line-height: 1.5;
  color: var(--paper);
  margin: 0;
  flex: 1;
  display: flex;
  align-items: center;
}
.auth-side-meta {
  border-top: 1px solid rgba(246, 244, 238, 0.15);
  padding-top: 1.5rem;
}
.auth-side-meta-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(246, 244, 238, 0.08);
}
.auth-side-meta-row:last-child { border-bottom: none; }
.auth-side-meta-k {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(246, 244, 238, 0.4);
}
.auth-side-meta-v {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: rgba(246, 244, 238, 0.75);
}

/* 오른쪽 폼 패널 */
.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  background: var(--paper);
}
.auth-form-wrap {
  width: 100%;
  max-width: 420px;
  animation: auth-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.auth-mobile-logo {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1rem;
  color: var(--ink);
  text-decoration: none;
  margin-bottom: 2rem;
}
@media (min-width: 760px) {
  .auth-mobile-logo { display: none; }
}

/* 폼 헤더 */
.auth-form-header {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--ink);
}
.auth-form-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vermilion);
  margin-bottom: 0.75rem;
}
.auth-form-title {
  font-family: var(--font-serif);
  font-weight: 900;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 0 0 0.5rem;
}
.auth-form-subtitle {
  font-size: 0.9rem;
  color: var(--ink-soft);
  margin: 0;
  line-height: 1.65;
}

/* 폼 */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 서버 에러 */
.auth-server-error {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--vermilion);
  background: var(--vermilion-tint);
  margin-bottom: 1.5rem;
}
.auth-server-error-tag {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vermilion);
  padding: 0.15rem 0.4rem;
  border: 1px solid var(--vermilion);
  line-height: 1.4;
  margin-top: 0.05rem;
}
.auth-server-error-text {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--vermilion-deep);
  margin: 0;
  line-height: 1.6;
}

/* 필드 */
.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-bottom: 1px solid var(--hairline);
  padding: 1.25rem 0 1rem;
}
.auth-field:first-of-type {
  border-top: 1px solid var(--hairline);
}
.auth-label {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 0.625rem;
  cursor: pointer;
}
.auth-field-no {
  color: var(--vermilion);
  font-weight: 600;
}
.auth-required { color: var(--vermilion); }
.auth-input {
  width: 100%;
  padding: 0.5625rem 0.75rem;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  line-height: 1.6;
  outline: none;
  transition: border-color 120ms ease;
  -webkit-appearance: none;
  appearance: none;
}
.auth-input::placeholder { color: var(--ink-faint); font-size: 0.875rem; }
.auth-input:focus {
  border-color: var(--ink);
  border-width: 2px;
}
.auth-input-error { border-color: var(--vermilion); }
.auth-input-error:focus {
  border-color: var(--vermilion);
  border-width: 2px;
}
.auth-error {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--vermilion);
  margin: 0.5rem 0 0;
}

/* 제출 */
.auth-submit-row {
  padding-top: 2rem;
}
.auth-submit-btn {
  width: 100%;
}
.auth-submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* 폼 푸터 */
.auth-form-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--hairline-soft);
}
.auth-footer-text {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: var(--ink-faint);
  margin: 0;
}
.auth-footer-link {
  color: var(--ink);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 120ms ease;
}
.auth-footer-link:hover { color: var(--vermilion); }
`;
