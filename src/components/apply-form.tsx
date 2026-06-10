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
      style={{ animation: 'af-spin 0.75s linear infinite' }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ─── Success Screen ───────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="af-success rise">
      <style>{FORM_STYLES}</style>
      {/* 인쇄물풍 접수증 헤더 */}
      <div className="af-success-stamp">
        <span className="af-success-stamp-no">APPLICATION RECEIVED</span>
      </div>

      <h2 className="af-success-headline">
        접수되었습니다<span style={{ color: 'var(--vermilion)' }}>;</span>
      </h2>

      <div className="af-success-meta">
        <div className="af-success-meta-row">
          <span className="af-success-meta-k">STATUS</span>
          <span className="af-success-meta-v" style={{ color: 'var(--vermilion)' }}>● RECEIVED</span>
        </div>
        <div className="af-success-meta-row">
          <span className="af-success-meta-k">NEXT</span>
          <span className="af-success-meta-v">서류 검토 → 면접 안내</span>
        </div>
        <div className="af-success-meta-row">
          <span className="af-success-meta-k">CONTACT</span>
          <span className="af-success-meta-v">등록하신 연락처로 결과 안내</span>
        </div>
      </div>

      <hr className="af-success-rule" />

      <p className="af-success-note">
        지원해 주셔서 감사합니다. 검토 후 결과를 연락드리겠습니다.
      </p>

      <div className="af-success-steps">
        <div className="af-success-step">
          <span className="af-success-step-no">01</span>
          <span className="af-success-step-label">서류 검토</span>
        </div>
        <span className="af-success-step-arrow">→</span>
        <div className="af-success-step">
          <span className="af-success-step-no">02</span>
          <span className="af-success-step-label">면접 안내</span>
        </div>
        <span className="af-success-step-arrow">→</span>
        <div className="af-success-step">
          <span className="af-success-step-no">03</span>
          <span className="af-success-step-label">최종 합류</span>
        </div>
      </div>

      <Link href="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
        홈으로 돌아가기
      </Link>
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
    return <SuccessScreen />;
  }

  return (
    <>
      <style>{FORM_STYLES}</style>
      <form className="af-form" onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* 서버 에러 배너 */}
        {serverError && (
          <div className="af-server-error" role="alert">
            <span className="af-server-error-tag">ERROR</span>
            <p className="af-server-error-text">{serverError}</p>
          </div>
        )}

        {/* 01 이름 */}
        <div className="af-field">
          <label className="af-label" htmlFor="af-name">
            <span className="af-field-no">01</span>
            이름
            <span className="af-required" aria-hidden="true"> *</span>
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

        {/* 02 연락처 */}
        <div className="af-field">
          <label className="af-label" htmlFor="af-contact">
            <span className="af-field-no">02</span>
            연락처
            <span className="af-required" aria-hidden="true"> *</span>
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

        {/* 03 지원 동기 */}
        <div className="af-field">
          <label className="af-label" htmlFor="af-motivation">
            <span className="af-field-no">03</span>
            지원 동기
            <span className="af-required" aria-hidden="true"> *</span>
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

        {/* 04 경험/자기소개 (선택) */}
        <div className="af-field">
          <label className="af-label" htmlFor="af-experience">
            <span className="af-field-no">04</span>
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

        {/* 제출 */}
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
@keyframes af-spin {
  to { transform: rotate(360deg); }
}
@keyframes af-slide-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── 폼 컨테이너 — 왼쪽 정렬 서류 양식 ── */
.af-form {
  display: flex;
  flex-direction: column;
  gap: 0;
  animation: af-slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ── 서버 에러 ── */
.af-server-error {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--vermilion);
  background: var(--vermilion-tint);
  margin-bottom: 0;
}
.af-server-error-tag {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vermilion);
  padding: 0.15rem 0.4rem;
  border: 1px solid var(--vermilion);
  line-height: 1.4;
  margin-top: 0.1rem;
}
.af-server-error-text {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--vermilion-deep);
  margin: 0;
  line-height: 1.6;
}

/* ── 필드 — 괘선으로 구획 ── */
.af-field {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-bottom: 1px solid var(--hairline);
  padding: 1.5rem 0 1.25rem;
}
.af-field:first-of-type {
  border-top: 1px solid var(--hairline);
  margin-top: 1.75rem;
}

/* ── 라벨 — 모노 대문자 소형 ── */
.af-label {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 0.75rem;
  cursor: pointer;
}
.af-field-no {
  color: var(--vermilion);
  font-weight: 600;
}
.af-required {
  color: var(--vermilion);
}
.af-optional {
  font-weight: 400;
  font-size: 0.65rem;
  color: var(--ink-faint);
  letter-spacing: 0.08em;
}

/* ── 인풋 / 텍스트에어리어 — 직각 + 잉크 보더 ── */
.af-input,
.af-textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--hairline);
  border-radius: 2px;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  line-height: 1.65;
  outline: none;
  transition: border-color 120ms ease;
  -webkit-appearance: none;
  appearance: none;
}
.af-input::placeholder,
.af-textarea::placeholder {
  color: var(--ink-faint);
  font-size: 0.875rem;
}
.af-input:focus,
.af-textarea:focus {
  border-color: var(--ink);
  border-width: 2px;
}
.af-textarea {
  resize: vertical;
  min-height: 100px;
}
.af-input-error {
  border-color: var(--vermilion);
  border-width: 1px;
}
.af-input-error:focus {
  border-color: var(--vermilion);
  border-width: 2px;
}

/* ── 에러 메시지 — 버밀리온 모노 ── */
.af-error {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--vermilion);
  margin: 0.5rem 0 0;
}

/* ── 제출 푸터 ── */
.af-footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 2rem;
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
}
.af-submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.af-footer-note {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  color: var(--ink-faint);
  margin: 0;
}

/* ── 성공 화면 — 인쇄물풍 접수증 ── */
.af-success {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  padding: 0;
}
.af-success-stamp {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}
.af-success-stamp-no {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vermilion);
  border: 1px solid var(--vermilion);
  padding: 0.2rem 0.6rem;
}
.af-success-headline {
  font-family: var(--font-serif);
  font-weight: 900;
  font-size: clamp(2rem, 6vw, 3.25rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 0 0 2rem;
}
.af-success-meta {
  width: 100%;
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--hairline);
}
.af-success-meta-row {
  display: grid;
  grid-template-columns: 7rem 1fr;
  align-items: baseline;
  gap: 1.25rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--hairline-soft);
}
.af-success-meta-row:last-child {
  border-bottom: none;
}
.af-success-meta-k {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-faint);
}
.af-success-meta-v {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--ink);
}
.af-success-rule {
  width: 100%;
  border: 0;
  border-top: 1px solid var(--hairline);
  margin: 1.75rem 0;
}
.af-success-note {
  font-size: 0.9375rem;
  color: var(--ink-soft);
  line-height: 1.8;
  margin: 0 0 1.5rem;
}
.af-success-steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1.25rem 0;
  border-top: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
  width: 100%;
}
.af-success-step {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}
.af-success-step-no {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--vermilion);
}
.af-success-step-label {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--ink);
}
.af-success-step-arrow {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-faint);
}
`;
