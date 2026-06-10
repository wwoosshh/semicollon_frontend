/**
 * TDD: apply-form.tsx
 * Tests are written BEFORE the implementation.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the api module using its relative path from THIS test file
// (apply-form.tsx lives in the same directory and will import from '../lib/api')
jest.mock('../lib/api');

import { api } from '../lib/api';
import ApplyForm from './apply-form';

const mockedApi = api as jest.MockedFunction<typeof api>;

describe('ApplyForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('필수 필드를 비우고 제출하면 검증 메시지가 표시된다', async () => {
    const user = userEvent.setup();
    render(<ApplyForm />);

    // Click submit without filling in anything
    const submitButton = screen.getByRole('button', { name: /제출|지원|submit/i });
    await user.click(submitButton);

    // Validation error messages should appear for required fields
    await waitFor(() => {
      expect(screen.getByText('이름을 입력해 주세요.')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('연락처를 입력해 주세요.')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('지원 동기를 입력해 주세요.')).toBeInTheDocument();
    });
  });

  it('정상 입력 후 제출하면 api가 올바른 payload로 호출된다', async () => {
    const user = userEvent.setup();
    mockedApi.mockResolvedValueOnce({ id: 1 });

    render(<ApplyForm />);

    // Fill required fields
    await user.type(screen.getByLabelText(/이름/), '홍길동');
    await user.type(screen.getByLabelText(/연락처/), '010-1234-5678');
    await user.type(screen.getByLabelText(/지원 동기/), '세미콜론에서 함께 성장하고 싶습니다.');

    // Submit
    const submitButton = screen.getByRole('button', { name: /제출|지원|submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedApi).toHaveBeenCalledWith('/applications', {
        method: 'POST',
        body: {
          name: '홍길동',
          contact: '010-1234-5678',
          answers: {
            motivation: '세미콜론에서 함께 성장하고 싶습니다.',
            experience: '',
          },
        },
      });
    });
  });
});
