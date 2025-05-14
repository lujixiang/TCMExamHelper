import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  studyHistory: {
    date: string;
    questionsAnswered: number;
    correctAnswers: number;
  }[];
  wrongQuestions: string[]; // 存储错题ID
  settings: {
    showExplanationImmediately: boolean;
    darkMode: boolean;
  };
}

const initialState: UserState = {
  studyHistory: [],
  wrongQuestions: [],
  settings: {
    showExplanationImmediately: false,
    darkMode: false,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addStudyRecord: (
      state,
      action: PayloadAction<{
        date: string;
        questionsAnswered: number;
        correctAnswers: number;
      }>
    ) => {
      state.studyHistory.push(action.payload);
    },
    addWrongQuestion: (state, action: PayloadAction<string>) => {
      if (!state.wrongQuestions.includes(action.payload)) {
        state.wrongQuestions.push(action.payload);
      }
    },
    removeWrongQuestion: (state, action: PayloadAction<string>) => {
      state.wrongQuestions = state.wrongQuestions.filter(id => id !== action.payload);
    },
    updateSettings: (
      state,
      action: PayloadAction<Partial<UserState['settings']>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

export const {
  addStudyRecord,
  addWrongQuestion,
  removeWrongQuestion,
  updateSettings,
} = userSlice.actions;

export default userSlice.reducer; 