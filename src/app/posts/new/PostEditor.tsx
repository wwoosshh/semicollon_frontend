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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = '';

    const newImages: UploadedImage[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
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
          <IconSpinner />
        </div>
      </>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <>
      <style>{STYLES}</style>
      <div className="pe-page">
        <div className="pe-grid" aria-hidden="true" />
        <div className="pe-container">
          {/* Page header */}
          <div className="pe-header">
            <span className="pe-eyebrow">Write</span>
            <h1 className="pe-title">새 글 작성</h1>
          </div>

          <form className="pe-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Server error */}
            {serverError && (
              <div className="pe-server-error" role="alert">
                <span className="pe-server-error-icon" aria-hidden="true">!</span>
                <p className="pe-server-error-text">{serverError}</p>
              </div>
            )}

            {/* Title */}
            <div className="pe-field">
              <label className="pe-label" htmlFor="pe-title">
                제목 <span className="pe-required" aria-hidden="true">*</span>
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

            {/* Meta row: category + visibility */}
            <div className="pe-meta-row">
              {/* Category */}
              <div className="pe-field">
                <label className="pe-label" htmlFor="pe-category">
                  카테고리 <span className="pe-required" aria-hidden="true">*</span>
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

              {/* Visibility */}
              <div className="pe-field">
                <label className="pe-label" htmlFor="pe-visibility">
                  공개 범위 <span className="pe-required" aria-hidden="true">*</span>
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

            {/* Content */}
            <div className="pe-field pe-field-content">
              <label className="pe-label" htmlFor="pe-content">
                본문 <span className="pe-required" aria-hidden="true">*</span>
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

            {/* Image attachments */}
            <div className="pe-field">
              <div className="pe-images-header">
                <span className="pe-label">이미지 첨부</span>
                <span className="pe-label-hint">여러 장 선택 가능</span>
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

            {/* Actions */}
            <div className="pe-actions">
              <button
                type="button"
                className="btn btn-ghost pe-cancel-btn"
                onClick={() => router.back()}
              >
                취소
              </button>
              <button
                type="submit"
                className="pe-submit-btn"
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
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.pe-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 3.75rem);
  color: var(--text-subtle);
}

.pe-page {
  position: relative;
  min-height: calc(100dvh - 3.75rem);
  padding: 3rem 1.25rem 5rem;
  overflow: hidden;
}
@media (min-width: 640px) {
  .pe-page { padding: 4rem 2rem 6rem; }
}
@media (min-width: 1024px) {
  .pe-page { padding: 5rem 2.5rem 7rem; }
}

.pe-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 80% 40% at 50% 0%, black 20%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 40% at 50% 0%, black 20%, transparent 100%);
  pointer-events: none;
}

.pe-container {
  position: relative;
  max-width: 760px;
  margin-inline: auto;
  animation: pe-fade-up 0.35s ease both;
}

.pe-header {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 2.5rem;
}

.pe-eyebrow {
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
}

.pe-title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  color: var(--foreground);
  margin: 0;
}

/* Form */
.pe-form {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
@media (min-width: 640px) {
  .pe-form { padding: 2.5rem; }
}

/* Server error */
.pe-server-error {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius);
  background: #fff7ed;
  border: 1px solid #fed7aa;
}
.pe-server-error-icon {
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
.pe-server-error-text {
  font-size: 0.9rem;
  color: #9a3412;
  margin: 0;
  line-height: 1.6;
}

/* Fields */
.pe-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.pe-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--foreground);
  letter-spacing: -0.01em;
}
.pe-label-hint {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--text-subtle);
  margin-left: 0.375rem;
}
.pe-required {
  color: var(--accent);
}

.pe-meta-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 479px) {
  .pe-meta-row { grid-template-columns: 1fr; }
}

.pe-images-header {
  display: flex;
  align-items: center;
  gap: 0;
}

/* Input / Textarea / Select */
.pe-input,
.pe-textarea,
.pe-select {
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
.pe-input::placeholder,
.pe-textarea::placeholder {
  color: var(--text-subtle);
}
.pe-input:focus,
.pe-textarea:focus,
.pe-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.pe-input-error {
  border-color: #f87171;
}
.pe-input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px #fee2e2;
}

.pe-title-input {
  font-size: 1.0625rem;
  font-weight: 600;
}

.pe-textarea {
  resize: vertical;
  min-height: 240px;
  line-height: 1.75;
}

.pe-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.875rem center;
  padding-right: 2.5rem;
}

/* Error message */
.pe-error {
  font-size: 0.8rem;
  font-weight: 500;
  color: #dc2626;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.pe-error::before {
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

/* Image thumbnails */
.pe-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.pe-thumb {
  position: relative;
  width: 5rem;
  height: 5rem;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1.5px solid var(--border);
  background: var(--surface-alt);
  flex-shrink: 0;
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
  background: rgba(255,255,255,0.6);
  color: var(--accent);
}
.pe-thumb-error {
  border-color: #fca5a5;
}
.pe-thumb-error-overlay {
  position: absolute;
  bottom: 0.25rem;
  left: 0.25rem;
  color: #dc2626;
  background: rgba(255,255,255,0.85);
  border-radius: 50%;
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
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.7);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease;
}
.pe-thumb-remove:hover {
  background: rgba(15, 23, 42, 0.9);
}

/* Upload button */
.pe-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5625rem 1.125rem;
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-muted);
  border: 1.5px solid var(--border);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
  align-self: flex-start;
}
.pe-upload-btn:hover {
  background: var(--surface-alt);
  border-color: var(--text-subtle);
  color: var(--foreground);
}

.pe-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.pe-upload-error-note {
  font-size: 0.8rem;
  color: #dc2626;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Actions */
.pe-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-soft);
}

.pe-cancel-btn {
  padding: 0.6875rem 1.375rem;
  font-size: 0.9375rem;
}

.pe-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6875rem 1.75rem;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 150ms ease, box-shadow 150ms ease, transform 100ms ease;
  box-shadow: 0 2px 8px rgb(79 70 229 / 0.25);
}
.pe-submit-btn:hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 14px rgb(79 70 229 / 0.35);
}
.pe-submit-btn:active {
  transform: translateY(1px);
}
.pe-submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}
`;
