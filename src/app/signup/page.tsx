import type { Metadata } from 'next';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
  title: '부원 가입 | 세미콜론',
};

export default function SignupPage() {
  return <SignupForm />;
}
