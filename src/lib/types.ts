export interface RecruitInfo {
  start: string | null;
  end: string | null;
  isRecruiting: boolean;
}

export interface Profile {
  id: string;
  name: string;
  generation: number;
  role: 'admin' | 'member';
}

export interface PostSummary {
  id: number;
  title: string;
  category: 'notice' | 'blog';
  visibility: 'public' | 'member';
  created_at: string;
  profiles: { name: string } | null;
}

export interface Post extends PostSummary {
  content: string;
  image_urls: string[];
  updated_at: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  type: 'project' | 'study' | 'event';
  year: number;
  thumbnail_url: string | null;
  tags: string[];
  created_at: string;
}

export interface Application {
  id: number;
  name: string;
  contact: string;
  answers: Record<string, string>;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface AboutHistoryItem { year: string; title: string; }
export interface AboutStaffItem { name: string; role: string; note?: string; }
export interface AboutFaqItem { q: string; a: string; }
export interface AboutContent {
  history: AboutHistoryItem[];
  staff: AboutStaffItem[];
  faq: AboutFaqItem[];
}

export interface ClubEvent {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}
