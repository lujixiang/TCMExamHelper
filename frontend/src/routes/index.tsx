import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import { Layout } from '../components/Layout';
import PracticeModeSelector from '../components/PracticeModeSelector';
import QuestionPage from '../pages/practice/QuestionPage';
import TopicPractice from '../pages/practice/TopicPractice';
import MistakeBook from '../pages/practice/MistakeBook';
import PracticeHistory from '../pages/practice/PracticeHistory';

const AppRoutes: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Routes>
      {/* 默认路由重定向到登录页面 */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 认证路由 */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/practice" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/practice" replace /> : <Register />}
      />

      {/* 受保护的路由 */}
      <Route
        path="/"
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route path="practice" element={<PracticeModeSelector />} />
        <Route path="practice/question/:subject" element={<QuestionPage />} />
        <Route path="practice/topic" element={<TopicPractice />} />
        <Route path="practice/mistakes" element={<MistakeBook />} />
        <Route path="practice/history" element={<PracticeHistory />} />
      </Route>

      {/* 404页面 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 