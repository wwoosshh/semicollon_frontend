import type { Metadata } from 'next';
import CalendarView from './CalendarView';

export const metadata: Metadata = {
  title: '일정 | 세미콜론',
  description: '세미콜론의 일정과 행사를 달력으로 확인하세요.',
};

export default function CalendarPage() {
  return <CalendarView />;
}
