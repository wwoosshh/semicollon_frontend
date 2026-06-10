import type { Metadata } from 'next';
import PostEditor from './PostEditor';

export const metadata: Metadata = {
  title: '새 글 작성 | 세미콜론',
};

export default function NewPostPage() {
  return <PostEditor />;
}
