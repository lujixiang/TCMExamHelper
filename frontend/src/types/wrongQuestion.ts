export interface WrongQuestion {
  _id: string;
  userId: string;
  questionId: string;
  subject: string;
  subjectName: string;
  content: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string;
  };
  correctAnswer: string;
  userAnswer: string;
  createdAt: string;
  wrongCount: number;
  lastWrongDate: string;
  lastReviewDate?: string;
  masteryLevel: number;
  status: 'pending' | 'reviewing' | 'mastered';
  chapter?: string;
  difficulty?: number;
  reviewHistory: Array<{
    date: string;
    isCorrect: boolean;
    answerTime: number;
    userAnswer: string;
  }>;
}

export interface WrongQuestionStats {
  totalCount: number;
  mostFrequentQuestions: WrongQuestion[];
}

export interface WrongQuestionResponse {
  status: string;
  data: {
    wrongQuestions: WrongQuestion[];
  };
}

export interface WrongQuestionStatsResponse {
  status: string;
  data: WrongQuestionStats;
} 