import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: string;
  title: string;
  options: string[];
  correctAnswer: string;
}

interface QuestionState {
  questions: Question[];
  currentQuestionIndex: number;
  selectedOption: string | null;
  showFeedback: boolean;
  isCorrect: boolean;
  submitted: boolean;
  score: number;
  currentQuestion: Question | null;
}

const initialState: QuestionState = {
  questions: [],
  currentQuestionIndex: 0,
  selectedOption: null,
  showFeedback: false,
  isCorrect: false,
  submitted: false,
  score: 0,
  currentQuestion: null,
};

export const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
      state.currentQuestion = action.payload[0];
      state.currentQuestionIndex = 0;
      state.score = 0;
    },
    selectOption: (state, action: PayloadAction<string>) => {
      state.selectedOption = action.payload;
    },
    submitAnswer: (state, action: PayloadAction<boolean>) => {
      state.submitted = true;
      state.isCorrect = action.payload;
      state.showFeedback = true;
      if (action.payload) {
        state.score += 1;
      }
    },
    resetQuestion: (state) => {
      state.selectedOption = null;
      state.showFeedback = false;
      state.submitted = false;
    },
    nextQuestion: (state) => {
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex < state.questions.length) {
        state.currentQuestionIndex = nextIndex;
        state.currentQuestion = state.questions[nextIndex];
        state.selectedOption = null;
        state.showFeedback = false;
        state.submitted = false;
      }
    },
    resetQuiz: (state) => {
      state.currentQuestionIndex = 0;
      state.currentQuestion = state.questions[0];
      state.selectedOption = null;
      state.showFeedback = false;
      state.submitted = false;
      state.score = 0;
    }
  },
});

export const { 
  setQuestions, 
  selectOption, 
  submitAnswer, 
  resetQuestion, 
  nextQuestion,
  resetQuiz 
} = questionSlice.actions;

export default questionSlice.reducer; 