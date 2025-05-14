import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ExercisePage } from '../components/exercise/ExercisePage';
import { PracticePage } from '../components/exercise/PracticePage';
import { RecommendedPage } from '../components/exercise/RecommendedPage';
import { MockExamPage } from '../components/exercise/MockExamPage';

export const ExerciseRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ExercisePage />} />
      <Route path="/practice" element={<PracticePage />} />
      <Route path="/recommended" element={<RecommendedPage />} />
      <Route path="/mock" element={<MockExamPage />} />
    </Routes>
  );
}; 