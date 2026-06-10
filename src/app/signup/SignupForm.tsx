'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api, ApiError } from '@/lib/api';

// ─── Schema ───────────────────────────────────────────────────
const schema = z.object({
  email: z.string().min(1, '이메일을 입력해 주세요.').email('올바른 이메일 형식을 입력해 주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  name: z.string().min(1, '이름을 입력해 주세요.'),
  generation: z
    .string()
    .min(1, '기수를 입력해 주세요.')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
      message: '기수는 양의 정수여야 합니다.',
    }),
  inviteCode: z.string().min(1, '초대 코드를 입력해 주세요.'),
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

// ─── Signup Form ──────────────────────────────────────────────
export default function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', name: '', generation: '', inviteCode: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await api('/auth/signup', {
        method: 'POST',
        body: {
          email: data.email,
          password: data.password,
          name: data.name,
          generation: Number(data.generation),
          inviteCode: data.inviteCode,
        },
      });
      // Auto sign in after successful signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) {
        // Signup succeeded but auto-login failed — redirect to login
        router.push('/login');
        return;
      }
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
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
                <span className="auth-side-meta-v">초대 코드 필요</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 오른쪽 폼 패널 */}
        <main className="auth-main">
          <div className="auth-form-wrap">
            {/* 모바일 로고 */}
            <Link href="/" className="auth-mobile-logo">
              Semicollon<span style={{ color: 'var(--vermilion)' }}>;</span>
            </Link>

            {/* 헤더 */}
            <div className="auth-form-header">
              <p className="auth-form-eyebrow">SIGN UP</p>
              <h1 className="auth-form-title">부원 가입</h1>
              <p className="auth-form-subtitle">운영진으로부터 받은 초대 코드로 가입하세요.</p>
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

              {/* 01 이름 + 02 기수 — 2열 */}
              <div className="auth-row-2col">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="signup-name">
                    <span className="auth-field-no">01</span>
                    이름
                    <span className="auth-required" aria-hidden="true"> *</span>
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    className={`auth-input${errors.name ? ' auth-input-error' : ''}`}
                    placeholder="홍길동"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'signup-name-error' : undefined}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p id="signup-name-error" className="auth-error" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="signup-generation">
                    <span className="auth-field-no">02</span>
                    기수
                    <span className="auth-required" aria-hidden="true"> *</span>
                  </label>
                  <input
                    id="signup-generation"
                    type="number"
                    min="1"
                    className={`auth-input${errors.generation ? ' auth-input-error' : ''}`}
                    placeholder="1"
                    aria-invalid={!!errors.generation}
                    aria-describedby={errors.generation ? 'signup-generation-error' : undefined}
                    {...register('generation')}
                  />
                  {errors.generation && (
                    <p id="signup-generation-error" className="auth-error" role="alert">
                      {errors.generation.message}
                    </p>
                  )}
                </div>
              </div>

              {/* 03 이메일 */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-email">
                  <span className="auth-field-no">03</span>
                  이메일
                  <span className="auth-required" aria-hidden="true"> *</span>
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className={`auth-input${errors.email ? ' auth-input-error' : ''}`}
                  placeholder="hong@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'signup-email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="signup-email-error" className="auth-error" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* 04 비밀번호 */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-password">
                  <span className="auth-field-no">04</span>
                  비밀번호
                  <span className="auth-required" aria-hidden="true"> *</span>
                </label>
                <input
                  id="signup-password"
                  type="password"
                  className={`auth-input${errors.password ? ' auth-input-error' : ''}`}
                  placeholder="8자 이상"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'signup-password-error' : undefined}
                  {...register('password')}
                />
                {errors.password && (
                  <p id="signup-password-error" className="auth-error" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* 05 초대 코드 */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-invite">
                  <span className="auth-field-no">05</span>
                  초대 코드
                  <span className="auth-required" aria-hidden="true"> *</span>
                </label>
                <input
                  id="signup-invite"
                  type="text"
                  className={`auth-input${errors.inviteCode ? ' auth-input-error' : ''}`}
                  placeholder="운영진에게 받은 초대 코드"
                  autoComplete="off"
                  aria-invalid={!!errors.inviteCode}
                  aria-describedby={errors.inviteCode ? 'signup-invite-error' : undefined}
                  {...register('inviteCode')}
                />
                {errors.inviteCode && (
                  <p id="signup-invite-error" className="auth-error" role="alert">
                    {errors.inviteCode.message}
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
                      가입 중…
                    </>
                  ) : (
                    '가입하기'
                  )}
                </button>
              </div>
            </form>

            {/* 푸터 링크 */}
            <div className="auth-form-footer">
              <p className="auth-footer-text">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="auth-footer-link">
                  로그인
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

/* ── 2단 레이아웃 ── */
.auth-page {
  min-height: calc(100dvh - 3.75rem);
  display: flex;
  flex-direction: column;
}
@media (min-width: 760px) {
  .auth-page { flex-direction: row; }
}

/* 왼쪽 패널 */
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
  align-items: flex-start;
  justify-content: center;
  padding: 3rem 1.5rem 4rem;
  background: var(--paper);
  overflow-y: auto;
}
@media (min-width: 760px) {
  .auth-main { align-items: center; }
}
.auth-form-wrap {
  width: 100%;
  max-width: 460px;
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

/* 2열 행 */
.auth-row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-top: 1px solid var(--hairline);
}
.auth-row-2col .auth-field {
  border-bottom: 1px solid var(--hairline);
  border-top: none;
}
.auth-row-2col .auth-field:first-child {
  border-right: 1px solid var(--hairline);
  padding-right: 1rem;
}
.auth-row-2col .auth-field:last-child {
  padding-left: 1rem;
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

/* 푸터 */
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
