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

// ─── Icons ────────────────────────────────────────────────────
function IconSpinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ animation: 'spin 0.75s linear infinite' }}
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
        <div className="auth-grid" aria-hidden="true" />
        <div className="auth-card">
          {/* Header */}
          <div className="auth-card-header">
            <Link href="/" className="auth-logo">
              Semicollon<span className="auth-logo-dot">;</span>
            </Link>
            <span className="auth-eyebrow">Sign in</span>
            <h1 className="auth-title">로그인</h1>
            <p className="auth-subtitle">세미콜론 부원 계정으로 로그인하세요.</p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Server error */}
            {serverError && (
              <div className="auth-server-error" role="alert">
                <span className="auth-server-error-icon" aria-hidden="true">!</span>
                <p className="auth-server-error-text">{serverError}</p>
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">
                이메일 <span className="auth-required" aria-hidden="true">*</span>
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

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">
                비밀번호 <span className="auth-required" aria-hidden="true">*</span>
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

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit-btn"
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
          </form>

          {/* Footer links */}
          <div className="auth-card-footer">
            <p className="auth-footer-text">
              아직 계정이 없으신가요?{' '}
              <Link href="/signup" className="auth-footer-link">
                부원 가입
              </Link>
            </p>
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
@keyframes auth-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.auth-page {
  position: relative;
  min-height: calc(100dvh - 3.75rem);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.25rem;
  overflow: hidden;
}

.auth-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 100%);
  pointer-events: none;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: auth-fade-up 0.35s ease both;
}

.auth-card-header {
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.auth-logo {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1rem;
  color: var(--foreground);
  text-decoration: none;
  margin-bottom: 1.25rem;
  letter-spacing: -0.03em;
}
.auth-logo-dot {
  color: var(--accent);
}

.auth-eyebrow {
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
  margin-bottom: 0.5rem;
}

.auth-title {
  font-size: 1.625rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--foreground);
  margin: 0;
  line-height: 1.2;
}

.auth-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}

.auth-form {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Server error */
.auth-server-error {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius);
  background: #fff7ed;
  border: 1px solid #fed7aa;
}
.auth-server-error-icon {
  flex-shrink: 0;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  background: #ea580c;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 800;
  font-family: var(--font-mono);
}
.auth-server-error-text {
  font-size: 0.9rem;
  color: #9a3412;
  margin: 0;
  line-height: 1.6;
}

/* Fields */
.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0.4375rem;
}
.auth-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--foreground);
  letter-spacing: -0.01em;
}
.auth-required {
  color: var(--accent);
}
.auth-input {
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
.auth-input::placeholder {
  color: var(--text-subtle);
}
.auth-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.auth-input-error {
  border-color: #f87171;
}
.auth-input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px #fee2e2;
}
.auth-error {
  font-size: 0.8rem;
  font-weight: 500;
  color: #dc2626;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.auth-error::before {
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

/* Submit */
.auth-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 150ms ease, box-shadow 150ms ease, transform 100ms ease;
  box-shadow: 0 2px 8px rgb(79 70 229 / 0.25);
  margin-top: 0.25rem;
}
.auth-submit-btn:hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 14px rgb(79 70 229 / 0.35);
}
.auth-submit-btn:active {
  transform: translateY(1px);
}
.auth-submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* Card footer */
.auth-card-footer {
  padding: 1.25rem 2rem 1.75rem;
  border-top: 1px solid var(--border-soft);
  text-align: center;
}
.auth-footer-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
}
.auth-footer-link {
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
  transition: color 150ms ease;
}
.auth-footer-link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}
`;
