import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: '세미콜론 | Semicollon',
  description: '함께 성장하는 개발 동아리, 세미콜론(Semicollon)입니다.',
  keywords: ['세미콜론', 'Semicollon', '개발 동아리', '프로그래밍'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
