import type { Metadata } from 'next';
import PostList from './PostList';

export const metadata: Metadata = {
  title: '소식 | 세미콜론',
  description: '세미콜론의 공지사항과 블로그 글을 확인하세요.',
};

export default function PostsPage() {
  return <PostList />;
}
