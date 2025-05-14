export interface MistakeItem {
  id: string;
  question: string;
  correctAnswer: string;
  yourAnswer: string;
  explanation: string;
  date: string;
  subject?: string;
  chapter?: string;
  difficulty?: number;
  status?: 'new' | 'reviewing' | 'mastered';
  notes?: string;
  reviewCount?: number;
  lastReviewedAt?: string;
} 