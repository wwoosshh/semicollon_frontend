'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { api, ApiError } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── Schema ───────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(1, '제목을 입력해 주세요.'),
  category: z.enum(['blog', 'notice']),
  visibility: z.enum(['public', 'member']),
  content: z.string().min(1, '본문을 입력해 주세요.'),
});

type FormValues = z.infer<typeof schema>;

// ─── Types ────────────────────────────────────────────────────
interface UploadedImage {
  id: string;
  url: string;
  previewUrl: string;
  name: string;
  uploading: boolean;
  error: string | null;
}

interface PostResponse {
  id: number;
}

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

function IconImage() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconAlertCircle() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  );
}

// ─── Post Editor ──────────────────────────────────────────────
export default function PostEditor() {
  const router = useRouter();
  const { session, profile, loading: authLoading } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in once auth resolves
  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [authLoading, session, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', category: 'blog', visibility: 'public', content: '' },
  });

  // ── Image upload ─────────────────────────────────────────
  const MAX_UPLOAD = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Array.from(e.target.files ?? []);
    if (!raw.length) return;
    e.target.value = '';

    const files: File[] = [];
    for (const file of raw) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setServerError('이미지 파일(jpg/png/webp/gif)만 업로드할 수 있습니다.');
        continue;
      }
      if (file.size > MAX_UPLOAD) {
        setServerError('파일 크기는 5MB 이하여야 합니다.');
        continue;
      }
      files.push(file);
    }
    if (!files.length) return;

    const newImages: UploadedImage[] = files.map((file) => ({
      id: crypto.randomUUID(),
      url: '',
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      uploading: true,
      error: null,
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Upload each file individually
    await Promise.all(
      files.map(async (file, idx) => {
        const image = newImages[idx];
        try {
          const token = session?.access_token ?? '';
          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch(`${API_URL}/uploads`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
            // DO NOT set Content-Type — browser sets multipart boundary automatically
          });

          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as { message?: string } | null;
            throw new Error(data?.message ?? '업로드에 실패했습니다.');
          }

          const data = (await res.json()) as { url: string };
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, url: data.url, uploading: false } : img
            )
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : '업로드에 실패했습니다.';
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, uploading: false, error: msg } : img
            )
          );
        }
      })
    );
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  // ── Submit ───────────────────────────────────────────────
  const onSubmit = async (data: FormValues) => {
    setServerError(null);

    const pendingUploads = images.filter((img) => img.uploading);
    if (pendingUploads.length > 0) {
      setServerError('이미지 업로드가 진행 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    const imageUrls = images
      .filter((img) => img.url && !img.error)
      .map((img) => img.url);

    try {
      const token = session?.access_token ?? '';
      const post = await api<PostResponse>('/posts', {
        method: 'POST',
        token,
        body: {
          title: data.title,
          content: data.content,
          category: data.category,
          visibility: data.visibility,
          ...(imageUrls.length > 0 ? { imageUrls } : {}),
        },
      });
      router.push(`/posts/${post.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('글 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
  };

  // Show nothing while auth is loading to avoid flash
  if (authLoading || !session) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="pe-loading" aria-label="로딩 중">
          <div className="pe-loading-inner">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="pe-loading-row">
                <div className="pe-loading-bar" />
                {i === 0 && <span className="pe-loading-label">{'// loading...'}</span>}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <>
      <style>{STYLES}</style>
      <div className="pe-page">
        <div className="pe-container">

          {/* ── 페이지 헤더 ────────────────────────────────── */}
          <div className="pe-header">
            <p className="pe-eyebrow">{'// POSTS — NEW ENTRY'}</p>
            <h1 className="pe-title">새 글 작성</h1>
          </div>

          <hr className="pe-rule" />

          <form className="pe-form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* 서버 에러 */}
            {serverError && (
              <div className="pe-server-error" role="alert">
                <span className="pe-server-error-tag">ERROR</span>
                <p className="pe-server-error-text">{serverError}</p>
              </div>
            )}

            {/* 01 제목 */}
            <div className="pe-field">
              <label className="pe-label" htmlFor="pe-title">
                <span className="pe-field-no">01</span>
                제목
                <span className="pe-required" aria-hidden="true"> *</span>
              </label>
              <input
                id="pe-title"
                type="text"
                className={`pe-input pe-title-input${errors.title ? ' pe-input-error' : ''}`}
                placeholder="글 제목을 입력해 주세요"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'pe-title-error' : undefined}
                {...register('title')}
              />
              {errors.title && (
                <p id="pe-title-error" className="pe-error" role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* 02 카테고리 + 공개 범위 */}
            <div className="pe-field pe-field-meta">
              <div className="pe-field pe-field-inline">
                <label className="pe-label" htmlFor="pe-category">
                  <span className="pe-field-no">02</span>
                  카테고리
                  <span className="pe-required" aria-hidden="true"> *</span>
                </label>
                <select
                  id="pe-category"
                  className={`pe-select${errors.category ? ' pe-input-error' : ''}`}
                  aria-invalid={!!errors.category}
                  {...register('category')}
                >
                  <option value="blog">블로그</option>
                  {isAdmin && <option value="notice">공지</option>}
                </select>
                {errors.category && (
                  <p className="pe-error" role="alert">{errors.category.message}</p>
                )}
              </div>

              <div className="pe-field pe-field-inline">
                <label className="pe-label" htmlFor="pe-visibility">
                  <span className="pe-field-no">03</span>
                  공개 범위
                  <span className="pe-required" aria-hidden="true"> *</span>
                </label>
                <select
                  id="pe-visibility"
                  className={`pe-select${errors.visibility ? ' pe-input-error' : ''}`}
                  aria-invalid={!!errors.visibility}
                  {...register('visibility')}
                >
                  <option value="public">전체 공개</option>
                  <option value="member">부원 공개</option>
                </select>
                {errors.visibility && (
                  <p className="pe-error" role="alert">{errors.visibility.message}</p>
                )}
              </div>
            </div>

            {/* 04 본문 */}
            <div className="pe-field">
              <label className="pe-label" htmlFor="pe-content">
                <span className="pe-field-no">04</span>
                본문
                <span className="pe-required" aria-hidden="true"> *</span>
              </label>
              <textarea
                id="pe-content"
                className={`pe-textarea${errors.content ? ' pe-input-error' : ''}`}
                placeholder="글 내용을 입력해 주세요…"
                rows={14}
                aria-invalid={!!errors.content}
                aria-describedby={errors.content ? 'pe-content-error' : undefined}
                {...register('content')}
              />
              {errors.content && (
                <p id="pe-content-error" className="pe-error" role="alert">
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* 05 이미지 첨부 */}
            <div className="pe-field">
              <div className="pe-label pe-images-label">
                <span className="pe-field-no">05</span>
                이미지 첨부
                <span className="pe-optional"> (선택)</span>
              </div>

              {/* Thumbnails */}
              {images.length > 0 && (
                <div className="pe-thumbs">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className={`pe-thumb${img.uploading ? ' pe-thumb-uploading' : ''}${img.error ? ' pe-thumb-error' : ''}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        className="pe-thumb-img"
                      />
                      {img.uploading && (
                        <div className="pe-thumb-overlay">
                          <IconSpinner />
                        </div>
                      )}
                      {img.error && (
                        <div className="pe-thumb-error-overlay" title={img.error}>
                          <IconAlertCircle />
                        </div>
                      )}
                      <button
                        type="button"
                        className="pe-thumb-remove"
                        onClick={() => removeImage(img.id)}
                        aria-label={`${img.name} 제거`}
                      >
                        <IconX />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <button
                type="button"
                className="pe-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <IconImage />
                이미지 추가
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="pe-file-input"
                aria-label="이미지 파일 선택"
                onChange={handleFileChange}
              />

              {/* Upload errors summary */}
              {images.some((img) => img.error) && (
                <p className="pe-upload-error-note">
                  일부 이미지 업로드에 실패했습니다. 해당 이미지는 제출 시 포함되지 않습니다.
                </p>
              )}
            </div>

            {/* 액션 */}
            <div className="pe-actions">
              <p className="pe-footer-note">
                <span className="pe-required">*</span> 표시 항목은 필수입니다.
              </p>
              <div className="pe-actions-btns">
                <button
                  type="button"
                  className="btn btn-ghost pe-cancel-btn"
                  onClick={() => router.back()}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-primary pe-submit-btn"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <IconSpinner />
                      등록 중…
                    </>
                  ) : (
                    '글 등록'
                  )}
                </button>
              </div>
            </div>
          </form>
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
@keyframes pe-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

/* ── 로딩 ── */
.pe-loading {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: calc(100dvh - 3.75rem);
  padding: 4rem 1.25rem;
}
.pe-loading-inner {
  width: 100%;
  max-width: 760px;
}
.pe-loading-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--hairline);
}
.pe-loading-bar {
  height: 1px;
  background: var(--hairline);
  flex: 1;
}
.pe-loading-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: var(--ink-faint);
  animation: blink 1.2s step-end infinite;
}

/* ── 페이지 셸 ── */
.pe-page {
  min-height: calc(100dvh - 3.75rem);
  padding: 3rem 1.25rem 5rem;
}
@media (min-width: 640px) {
  .pe-page { padding: 4rem 2rem 6rem; }
}
@media (min-width: 1024px) {
  .pe-page { padding: 5rem 2.5rem 7rem; }
}

.pe-container {
  max-width: 760px;
  margin-inline: auto;
  animation: pe-fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ── 헤더 ── */
.pe-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0;
}
.pe-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vermilion);
  margin: 0;
}
.pe-title {
  font-family: var(--font-serif);
  font-weight: 900;
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 0;
}
.pe-rule {
  border: 0;
  border-top: 1px solid var(--ink);
  margin: 1.75rem 0 0;
}

/* ── 폼 ── */
.pe-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── 서버 에러 ── */
.pe-server-error {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--vermilion);
  background: var(--vermilion-tint);
  margin-top: 1.75rem;
}
.pe-server-error-tag {
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
.pe-server-error-text {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--vermilion-deep);
  margin: 0;
  line-height: 1.6;
}

/* ── 필드 — 괘선 구획 ── */
.pe-field {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-bottom: 1px solid var(--hairline);
  padding: 1.5rem 0 1.25rem;
}
.pe-field:first-of-type {
  border-top: 1px solid var(--hairline);
  margin-top: 1.75rem;
}

/* 메타(카테고리+공개범위) 행 — 필드를 가로로 */
.pe-field-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  border-bottom: 1px solid var(--hairline);
  border-top: none;
  padding: 1.5rem 0 1.25rem;
  margin-top: 0;
}
@media (max-width: 479px) {
  .pe-field-meta { grid-template-columns: 1fr; }
}
.pe-field-inline {
  border: none;
  padding: 0;
  margin: 0;
}
.pe-field-inline:first-of-type {
  border-top: none;
  margin-top: 0;
}

/* ── 라벨 — 모노 대문자 ── */
.pe-label {
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
.pe-images-label {
  cursor: default;
}
.pe-field-no {
  color: var(--vermilion);
  font-weight: 600;
}
.pe-required {
  color: var(--vermilion);
}
.pe-optional {
  font-weight: 400;
  font-size: 0.65rem;
  color: var(--ink-faint);
  letter-spacing: 0.08em;
}

/* ── 인풋 / 텍스트에어리어 / 셀렉트 ── */
.pe-input,
.pe-textarea,
.pe-select {
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
.pe-input::placeholder,
.pe-textarea::placeholder {
  color: var(--ink-faint);
  font-size: 0.875rem;
}
.pe-input:focus,
.pe-textarea:focus,
.pe-select:focus {
  border-color: var(--ink);
  border-width: 2px;
}
.pe-input-error {
  border-color: var(--vermilion);
  border-width: 1px;
}
.pe-input-error:focus {
  border-color: var(--vermilion);
  border-width: 2px;
}
.pe-title-input {
  font-size: 1.125rem;
  font-weight: 600;
}
.pe-textarea {
  resize: vertical;
  min-height: 240px;
  line-height: 1.75;
}
.pe-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%231c1a15' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.25rem;
}

/* ── 에러 메시지 ── */
.pe-error {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--vermilion);
  margin: 0.5rem 0 0;
}

/* ── 이미지 썸네일 ── */
.pe-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}
.pe-thumb {
  position: relative;
  width: 5rem;
  height: 5rem;
  overflow: hidden;
  border: 1px solid var(--hairline);
  background: var(--paper-deep);
  flex-shrink: 0;
  border-radius: 2px;
}
.pe-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pe-thumb-uploading .pe-thumb-img {
  opacity: 0.5;
}
.pe-thumb-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(246, 244, 238, 0.7);
  color: var(--ink-soft);
}
.pe-thumb-error {
  border-color: var(--vermilion);
}
.pe-thumb-error-overlay {
  position: absolute;
  bottom: 0.25rem;
  left: 0.25rem;
  color: var(--vermilion);
  background: rgba(246, 244, 238, 0.9);
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pe-thumb-remove {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  background: var(--ink);
  color: var(--paper);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease;
}
.pe-thumb-remove:hover {
  background: var(--vermilion);
}

/* ── 업로드 버튼 ── */
.pe-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
  border-radius: 2px;
  align-self: flex-start;
}
.pe-upload-btn:hover {
  background: var(--ink);
  color: var(--paper);
}

.pe-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.pe-upload-error-note {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--vermilion);
  margin: 0.5rem 0 0;
  letter-spacing: 0.04em;
}

/* ── 액션 ── */
.pe-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 2rem 0 0;
}
.pe-actions-btns {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.pe-footer-note {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  color: var(--ink-faint);
  margin: 0;
}
.pe-cancel-btn {
  padding: 0.875rem 1.375rem;
}
.pe-submit-btn {
  min-width: 8rem;
}
.pe-submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
`;
