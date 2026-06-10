import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://semicollon-frontend.vercel.app'),
  title: '세미콜론 | Semicollon',
  description:
    '한 줄의 끝에서, 같이 다음 줄을 쓴다 — 프로그래밍 동아리 세미콜론(Semicollon)입니다.',
  keywords: ['세미콜론', 'Semicollon', '개발 동아리', '프로그래밍'],
  openGraph: {
    title: '세미콜론 | Semicollon',
    description: '한 줄의 끝에서, 같이 다음 줄을 쓴다 — 프로그래밍 동아리 세미콜론',
    type: 'website',
    locale: 'ko_KR',
    siteName: '세미콜론',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="scroll-progress" aria-hidden="true" />
        <AuthProvider>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
