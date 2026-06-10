'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { api, ApiError } from '../lib/api';

// ─── Schema ───────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, '이름을 입력해 주세요.'),
  contact: z.string().min(1, '연락처를 입력해 주세요.'),
  motivation: z.string().min(1, '지원 동기를 입력해 주세요.'),
  experience: z.string(),
});

type FormValues = z.infer<typeof schema>;

// ─── Icons ────────────────────────────────────────────────────
function IconCheck() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

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

// ─── Success Screen ───────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="af-success">
      <div className="af-success-icon">
        <IconCheck />
      </div>
      <div className="af-success-body">
        <p className="af-success-eyebrow">Application Received</p>
        <h2 className="af-success-title">지원이 완료되었습니다</h2>
        <p className="af-success-desc">
          지원해 주셔서 감사합니다! 검토 후 등록하신 연락처로 결과를 안내해 드리겠습니다.
          <br />
          <strong>다음 절차:</strong> 서류 검토 → 면접 안내 → 최종 합류 여부 통보
        </p>
        <Link href="/" className="btn btn-primary af-success-link">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

// ─── Apply Form ───────────────────────────────────────────────
export default function ApplyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', contact: '', motivation: '', experience: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await api('/applications', {
        method: 'POST',
        body: {
          name: data.name,
          contact: data.contact,
          answers: {
            motivation: data.motivation,
            experience: data.experience ?? '',
          },
        },
      });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
  };

  if (submitted) {
    return (
      <>
        <style>{FORM_STYLES}</style>
        <SuccessScreen />
      </>
    );
  }

  return (
    <>
      <style>{FORM_STYLES}</style>
      <form className="af-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Server error banner */}
        {serverError && (
          <div className="af-server-error" role="alert">
            <span className="af-server-error-icon" aria-hidden="true">!</span>
            <p className="af-server-error-text">{serverError}</p>
          </div>
        )}

        {/* 이름 */}
        <div className="af-field">
          <label className="af-label" htmlFor="af-name">
            이름 <span className="af-required" aria-hidden="true">*</span>
          </label>
          <input
            id="af-name"
            className={`af-input${errors.name ? ' af-input-error' : ''}`}
            type="text"
            placeholder="홍길동"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'af-name-error' : undefined}
            {...register('name')}
          />
          {errors.name && (
            <p id="af-name-error" className="af-error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* 연락처 */}
        <div className="af-field">
          <label className="af-label" htmlFor="af-contact">
            연락처 <span className="af-required" aria-hidden="true">*</span>
          </label>
          <input
            id="af-contact"
            className={`af-input${errors.contact ? ' af-input-error' : ''}`}
            type="text"
            placeholder="010-0000-0000 또는 이메일"
            aria-invalid={!!errors.contact}
            aria-describedby={errors.contact ? 'af-contact-error' : undefined}
            {...register('contact')}
          />
          {errors.contact && (
            <p id="af-contact-error" className="af-error" role="alert">
              {errors.contact.message}
            </p>
          )}
        </div>

        {/* 지원 동기 */}
        <div className="af-field">
          <label className="af-label" htmlFor="af-motivation">
            지원 동기 <span className="af-required" aria-hidden="true">*</span>
          </label>
          <textarea
            id="af-motivation"
            className={`af-textarea${errors.motivation ? ' af-input-error' : ''}`}
            placeholder="세미콜론에 지원하게 된 동기를 적어 주세요."
            rows={5}
            aria-invalid={!!errors.motivation}
            aria-describedby={errors.motivation ? 'af-motivation-error' : undefined}
            {...register('motivation')}
          />
          {errors.motivation && (
            <p id="af-motivation-error" className="af-error" role="alert">
              {errors.motivation.message}
            </p>
          )}
        </div>

        {/* 경험/자기소개 (선택) */}
        <div className="af-field">
          <label className="af-label" htmlFor="af-experience">
            경험 / 자기소개
            <span className="af-optional"> (선택)</span>
          </label>
          <textarea
            id="af-experience"
            className="af-textarea"
            placeholder="관련 경험이나 자기소개를 자유롭게 적어 주세요."
            rows={4}
            {...register('experience')}
          />
        </div>

        {/* Submit */}
        <div className="af-footer">
          <button
            type="submit"
            className="btn btn-primary af-submit-btn"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <IconSpinner />
                제출 중…
              </>
            ) : (
              '지원서 제출하기'
            )}
          </button>
          <p className="af-footer-note">
            <span className="af-required">*</span> 표시 항목은 필수입니다.
          </p>
        </div>
      </form>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const FORM_STYLES = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes af-slide-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes af-pop-in {
  0%   { opacity: 0; transform: scale(0.88); }
  60%  { transform: scale(1.04); }
  100% { opacity: 1; transform: scale(1); }
}

/* Form container */
.af-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: af-slide-in 0.35s ease both;
}

/* Server error */
.af-server-error {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  background: #fff7ed;
  border: 1px solid #fed7aa;
}
.af-server-error-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #ea580c;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  font-family: var(--font-mono);
}
.af-server-error-text {
  font-size: 0.9375rem;
  color: #9a3412;
  margin: 0;
  line-height: 1.6;
}

/* Field */
.af-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Label */
.af-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--foreground);
  letter-spacing: -0.01em;
}
.af-required {
  color: var(--accent);
}
.af-optional {
  font-weight: 400;
  font-size: 0.8125rem;
  color: var(--text-subtle);
  margin-left: 0.25rem;
}

/* Input / Textarea */
.af-input,
.af-textarea {
  width: 100%;
  padding: 0.6875rem 1rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.6;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  -webkit-appearance: none;
  appearance: none;
}
.af-input::placeholder,
.af-textarea::placeholder {
  color: var(--text-subtle);
}
.af-input:focus,
.af-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.af-textarea {
  resize: vertical;
  min-height: 100px;
}
.af-input-error {
  border-color: #f87171;
}
.af-input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px #fee2e2;
}

/* Field error message */
.af-error {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #dc2626;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.af-error::before {
  content: '!';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.6875rem;
  font-weight: 800;
  font-family: var(--font-mono);
  flex-shrink: 0;
}

/* Submit row */
.af-footer {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding-top: 0.5rem;
}
@media (min-width: 480px) {
  .af-footer {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
  }
}
.af-submit-btn {
  min-width: 10rem;
  padding: 0.75rem 2rem;
}
.af-submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}
.af-footer-note {
  font-size: 0.8125rem;
  color: var(--text-subtle);
  margin: 0;
  line-height: 1.5;
}

/* Success */
.af-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.75rem;
  padding: 3rem 1rem;
  animation: af-pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}
.af-success-icon {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgb(79 70 229 / 0.3);
}
.af-success-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  max-width: 440px;
}
.af-success-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0;
}
.af-success-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--foreground);
  margin: 0;
  line-height: 1.2;
}
.af-success-desc {
  font-size: 0.9375rem;
  color: var(--text-muted);
  line-height: 1.8;
  margin: 0;
}
.af-success-desc strong {
  color: var(--foreground);
  font-weight: 600;
}
.af-success-link {
  margin-top: 0.5rem;
}
`;
