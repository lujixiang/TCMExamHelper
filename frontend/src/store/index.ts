import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import questionReducer from './slices/questionSlice';
import mistakesReducer from './slices/mistakes';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    question: questionReducer,
    mistakes: mistakesReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();