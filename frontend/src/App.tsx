import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector, useDispatch } from 'react-redux';
import { theme } from './theme';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { Layout } from './components/Layout';
import { RootState, AppDispatch } from './store';
import DashboardPage from './pages/DashboardPage';
import PracticePage from './pages/practice/PracticePage';
import ProfilePage from './pages/ProfilePage';
import MistakeBook from './pages/practice/MistakeBook';
import RandomPractice from './pages/practice/RandomPractice';
import SubjectPractice from './pages/practice/SubjectPractice';
import ChapterPractice from './pages/practice/ChapterPractice';
import ExamPractice from './pages/practice/ExamPractice';
import PracticeAnalysis from './pages/practice/PracticeAnalysis';
import WrongQuestions from './pages/wrong-questions/WrongQuestions';

const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
          />
          {isAuthenticated ? (
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/practice/subject" element={<SubjectPractice />} />
              <Route path="/practice/chapter" element={<ChapterPractice />} />
              <Route path="/practice/exam" element={<ExamPractice />} />
              <Route path="/practice/analysis" element={<PracticeAnalysis />} />
              <Route path="/wrong-questions" element={<WrongQuestions />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/random-practice" element={<RandomPractice />} />
              <Route path="/subject-practice" element={<div>专项练习</div>} />
              <Route path="/mock-exam" element={<div>模拟考试</div>} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 