export interface Question {
  _id: string;
  content: string;
  options: {
    [key: string]: string;
  };
  correctAnswer: string;
  explanation?: string;
  subject: string;
  chapter?: string;
  difficulty: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WrongQuestion {
  _id: string;
  userId: string;
  questionId: Question;
  subject: string;
  chapter?: string;
  difficulty: number;
  wrongCount: number;
  lastWrongDate: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  masteryLevel: number;
  status: 'pending' | 'reviewing' | 'mastered' | 'archived';
  wrongReason?: string[];
  notes?: string;
  tags?: string[];
  reviewHistory: Array<{
    date: string;
    isCorrect: boolean;
    answerTime: number;
    userAnswer: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSchedule {
  questionId: string;
  nextReviewDate: string;
  currentMasteryLevel: number;
}

export interface WrongQuestionStats {
  subject: string;
  totalCount: number;
  averageWrongCount: number;
  averageMasteryLevel: number;
  pendingCount: number;
  reviewingCount: number;
  masteredCount: number;
}

export interface PracticeResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  answerTime: number;
  timestamp: string;
}

export interface PracticeSession {
  startTime: string;
  endTime: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  averageTime: number;
  subject: string;
  questions: Array<{
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    answerTime: number;
  }>;
}

export interface QuestionStats {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  correctRate: number;
  category: string;
  lastPracticeDate?: string;
}

export interface MistakeQuestion {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
} 