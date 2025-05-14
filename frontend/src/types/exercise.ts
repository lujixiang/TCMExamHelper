export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false'
}

export interface Question {
  _id: string;
  subject: string;
  chapterNo: number;
  type: QuestionType;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  tags: string[];
}

export interface ExerciseStats {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  streak: number;
  wrongQuestionStats: {
    subject: string;
    totalCount: number;
    averageWrongCount: number;
  }[];
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export interface ExerciseFilters {
  subject?: string;
  chapterNo?: number;
  type?: QuestionType;
  tags?: string[];
  excludeAnswered?: boolean;
  limit?: number;
} 