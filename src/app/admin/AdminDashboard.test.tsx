/**
 * Tests for AdminDashboard
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Mocks ────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      signOut: jest.fn(),
    },
  },
  getAccessToken: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../lib/api');
jest.mock('../../components/auth-provider');

import { api } from '../../lib/api';
import { useAuth } from '../../components/auth-provider';
import AdminDashboard from './AdminDashboard';

const mockedApi = api as jest.MockedFunction<typeof api>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const ADMIN_SESSION = {
  access_token: 'test-token',
} as Parameters<typeof mockedUseAuth>[0] extends undefined
  ? never
  : ReturnType<typeof mockedUseAuth>['session'];

function setupAdminAuth() {
  mockedUseAuth.mockReturnValue({
    session: { access_token: 'test-token' } as never,
    profile: { id: '1', name: '관리자', generation: 1, role: 'admin' },
    loading: false,
    signOut: jest.fn(),
  });
}

function setupLoadingAuth() {
  mockedUseAuth.mockReturnValue({
    session: null,
    profile: null,
    loading: true,
    signOut: jest.fn(),
  });
}

function setupMemberAuth() {
  mockedUseAuth.mockReturnValue({
    session: { access_token: 'test-token' } as never,
    profile: { id: '2', name: '일반유저', generation: 1, role: 'member' },
    loading: false,
    signOut: jest.fn(),
  });
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('진입 가드', () => {
    it('로딩 중에는 스켈레톤 UI가 표시된다', () => {
      setupLoadingAuth();
      render(<AdminDashboard />);
      // Skeleton uses aria-busy="true"
      const page = document.querySelector('[aria-busy="true"]');
      expect(page).toBeInTheDocument();
    });

    it('admin 역할 사용자는 대시보드 탭이 표시된다', async () => {
      setupAdminAuth();
      mockedApi.mockResolvedValue([]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('지원자 관리')).toBeInTheDocument();
      });
      expect(screen.getByText('모집 설정')).toBeInTheDocument();
      expect(screen.getByText('초대 코드')).toBeInTheDocument();
    });

    it('member 역할 사용자는 대시보드가 표시되지 않고 스켈레톤만 보인다', () => {
      setupMemberAuth();
      render(<AdminDashboard />);
      // Non-admin users see skeleton (no tab rendered)
      expect(screen.queryByText('지원자 관리')).not.toBeInTheDocument();
    });
  });

  describe('지원자 관리 탭', () => {
    it('지원자 목록이 없을 때 빈 상태 메시지가 표시된다', async () => {
      setupAdminAuth();
      mockedApi.mockResolvedValue([]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('아직 지원자가 없습니다.')).toBeInTheDocument();
      });
    });

    it('지원자 목록이 표시된다', async () => {
      setupAdminAuth();
      mockedApi.mockResolvedValue([
        {
          id: 1,
          name: '홍길동',
          contact: '010-1234-5678',
          answers: { 지원동기: '함께 성장하고 싶습니다.' },
          status: 'pending',
          created_at: '2025-01-01T10:00:00.000Z',
        },
      ]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('홍길동')).toBeInTheDocument();
      });
    });

    it('상태 필터 버튼이 렌더링된다', async () => {
      setupAdminAuth();
      mockedApi.mockResolvedValue([]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '검토중' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '합격' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '불합격' })).toBeInTheDocument();
      });
    });

    it('지원서 행을 클릭하면 답변이 펼쳐진다', async () => {
      const user = userEvent.setup();
      setupAdminAuth();
      mockedApi.mockResolvedValue([
        {
          id: 1,
          name: '홍길동',
          contact: '010-1234-5678',
          answers: { 지원동기: '함께 성장하고 싶습니다.' },
          status: 'pending',
          created_at: '2025-01-01T10:00:00.000Z',
        },
      ]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('홍길동')).toBeInTheDocument();
      });

      const row = screen.getByLabelText(/홍길동 지원서 펼치기/i);
      await user.click(row);

      await waitFor(() => {
        expect(screen.getByText('함께 성장하고 싶습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('탭 전환', () => {
    it('모집 설정 탭을 클릭하면 해당 탭 내용이 표시된다', async () => {
      const user = userEvent.setup();
      setupAdminAuth();
      mockedApi.mockResolvedValue([]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('모집 설정')).toBeInTheDocument();
      });

      const recruitTab = screen.getByRole('tab', { name: /모집 설정/ });
      await user.click(recruitTab);

      await waitFor(() => {
        expect(screen.getByLabelText('모집 시작일시')).toBeInTheDocument();
        expect(screen.getByLabelText('모집 마감일시')).toBeInTheDocument();
      });
    });

    it('초대 코드 탭을 클릭하면 해당 탭 내용이 표시된다', async () => {
      const user = userEvent.setup();
      setupAdminAuth();
      mockedApi.mockResolvedValue([]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('초대 코드')).toBeInTheDocument();
      });

      const inviteTab = screen.getByRole('tab', { name: /초대 코드/ });
      await user.click(inviteTab);

      await waitFor(() => {
        expect(screen.getByText(/새 코드를 설정하면 기존 코드는 즉시 무효화됩니다/)).toBeInTheDocument();
        expect(screen.getByLabelText(/새 초대 코드/)).toBeInTheDocument();
      });
    });
  });

  describe('초대 코드 탭', () => {
    async function openInviteTab() {
      const user = userEvent.setup();
      setupAdminAuth();
      mockedApi.mockResolvedValue([]);

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('초대 코드')).toBeInTheDocument();
      });

      const inviteTab = screen.getByRole('tab', { name: /초대 코드/ });
      await user.click(inviteTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/새 초대 코드/)).toBeInTheDocument();
      });

      return user;
    }

    it('6자 미만 코드를 제출하면 검증 오류가 표시된다', async () => {
      const user = await openInviteTab();

      await user.type(screen.getByLabelText(/새 초대 코드/), 'ABC');
      await user.click(screen.getByRole('button', { name: '코드 변경' }));

      await waitFor(() => {
        expect(screen.getByText('초대 코드는 6자 이상이어야 합니다.')).toBeInTheDocument();
      });
    });

    it('유효한 코드를 제출하면 api가 올바른 payload로 호출된다', async () => {
      const user = await openInviteTab();
      // The first call is for applications, second for invite-code
      mockedApi.mockResolvedValue(undefined as never);

      await user.type(screen.getByLabelText(/새 초대 코드/), 'SEC2025');
      await user.click(screen.getByRole('button', { name: '코드 변경' }));

      await waitFor(() => {
        expect(mockedApi).toHaveBeenCalledWith('/admin/settings/invite-code', {
          method: 'PATCH',
          token: 'test-token',
          body: { code: 'SEC2025' },
        });
      });
    });
  });
});
