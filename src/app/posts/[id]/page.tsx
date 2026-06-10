import type { Metadata } from 'next';
import PostDetail from './PostDetail';

export const metadata: Metadata = {
  title: '소식 | 세미콜론',
  description: '세미콜론 게시글',
};

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <PostDetail params={params} />;
}
