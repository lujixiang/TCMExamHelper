import axios from 'axios';
import { Question, ExerciseStats, SubmitAnswerResponse, ExerciseFilters } from '../types/exercise';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const exerciseService = {
  // 获取练习题目
  async getQuestions(filters: ExerciseFilters): Promise<Question[]> {
    const params = new URLSearchParams();
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.chapterNo) params.append('chapterNo', filters.chapterNo.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.tags) params.append('tags', filters.tags.join(','));
    if (filters.excludeAnswered) params.append('excludeAnswered', 'true');

    const response = await axios.get(`${API_URL}/exercise/questions`, { params });
    return response.data.data;
  },

  // 提交答案
  async submitAnswer(questionId: string, answer: string): Promise<SubmitAnswerResponse> {
    const response = await axios.post(`${API_URL}/exercise/submit`, {
      questionId,
      answer
    });
    return response.data.data;
  },

  // 获取练习统计
  async getStats(): Promise<ExerciseStats> {
    const response = await axios.get(`${API_URL}/exercise/stats`);
    return response.data.data;
  },

  // 获取推荐题目
  async getRecommendedQuestions(limit?: number): Promise<Question[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const response = await axios.get(`${API_URL}/exercise/recommended`, { params });
    return response.data.data;
  }
}; 