export interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  content: string;
  questions: Question[];
}

export interface Subject {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
} 