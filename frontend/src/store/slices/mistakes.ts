import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

export interface MistakeItem {
  id: string;
  question: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  yourAnswer: string;
  explanation: string;
  date: string;
  category?: string;
  reviewed?: boolean;
  options: {
    [key in 'A' | 'B' | 'C' | 'D']: string;
  };
}

interface MistakesState {
  items: MistakeItem[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  searchQuery: string;
}

const initialState: MistakesState = {
  items: [
    {
      id: '1',
      question: '以下哪项不是中医基本理论的组成部分？',
      correctAnswer: 'D',
      yourAnswer: 'B',
      explanation: '中医基本理论包括阴阳五行、脏腑、经络等内容，不包括现代医学诊断方法。',
      date: '2025-5-11',
      category: '基础理论',
      reviewed: false,
      options: {
        A: '阴阳五行',
        B: '脏腑理论',
        C: '经络学说',
        D: 'X光检查'
      }
    },
    {
      id: '2',
      question: '五脏中主管血液运行的是哪个脏器？',
      correctAnswer: 'A',
      yourAnswer: 'C',
      explanation: '心主血脉，心的功能主要是推动血液运行，统管血脉。',
      date: '2024-01-16',
      category: '基础理论',
      reviewed: false,
      options: {
        A: '心',
        B: '肝',
        C: '脾',
        D: '肺'
      }
    },
    {
      id: '3',
      question: '四君子汤的组成包括：',
      correctAnswer: 'B',
      yourAnswer: 'A',
      explanation: '四君子汤由人参、白术、茯苓、甘草组成，具有补气健脾的功效。',
      date: '2024-01-17',
      category: '方剂',
      reviewed: false,
      options: {
        A: '人参、黄芪、白术、当归',
        B: '人参、白术、茯苓、甘草',
        C: '人参、白芍、茯苓、甘草',
        D: '黄芪、白术、茯苓、甘草'
      }
    }
  ],
  loading: false,
  error: null,
  selectedCategory: null,
  searchQuery: '',
};

const mistakesSlice = createSlice({
  name: 'mistakes',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMistakes: (state, action: PayloadAction<MistakeItem[]>) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
    addMistake: (state, action: PayloadAction<MistakeItem>) => {
      state.items.push(action.payload);
    },
    removeMistake: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateMistake: (state, action: PayloadAction<MistakeItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleReviewed: (state, action: PayloadAction<string>) => {
      const mistake = state.items.find(item => item.id === action.payload);
      if (mistake) {
        mistake.reviewed = !mistake.reviewed;
      }
    }
  },
});

export const {
  setLoading,
  setError,
  setMistakes,
  addMistake,
  removeMistake,
  updateMistake,
  setSelectedCategory,
  setSearchQuery,
  toggleReviewed
} = mistakesSlice.actions;

export default mistakesSlice.reducer;

// 优化选择器
const selectMistakesState = (state: { mistakes: MistakesState }): MistakesState => 
  state.mistakes || initialState;

export const selectAllMistakes = createSelector(
  [selectMistakesState],
  (mistakesState): MistakeItem[] => Array.isArray(mistakesState.items) ? mistakesState.items : []
);

export const selectLoading = createSelector(
  [selectMistakesState],
  (mistakesState): boolean => mistakesState.loading
);

export const selectError = createSelector(
  [selectMistakesState],
  (mistakesState): string | null => mistakesState.error
);

export const selectSelectedCategory = createSelector(
  [selectMistakesState],
  (mistakesState): string | null => mistakesState.selectedCategory
);

export const selectSearchQuery = createSelector(
  [selectMistakesState],
  (mistakesState): string => mistakesState.searchQuery || ''
);

export const selectFilteredMistakes = createSelector(
  [selectAllMistakes, selectSelectedCategory, selectSearchQuery],
  (items, selectedCategory, searchQuery): MistakeItem[] => {
    if (!Array.isArray(items)) {
      return [];
    }
    return items.filter(item => {
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }
); 