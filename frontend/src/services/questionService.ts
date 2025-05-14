import { Question, PracticeResult, MistakeQuestion } from '../types/question';
import { api } from '../utils/api';

export const questionService = {
  // 获取题目列表
  async getQuestions(params: {
    subject?: string;
    difficulty?: number;
    chapter?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await api.get('/questions', { params });
      return response.data.data;
    } catch (error) {
      console.error('获取题目列表失败:', error);
      throw error;
    }
  },

  // 获取随机题目
  async getRandomQuestion(subject?: string): Promise<Question> {
    try {
      const response = await api.get('/questions/random', {
        params: { subject }
      });
      return response.data;
    } catch (error) {
      console.error('获取随机题目失败:', error);
      throw error;
    }
  },

  // 获取随机题目集
  async getRandomQuestions(params: { subject?: string; count?: number }) {
    try {
      const response = await api.get('/questions/random-set', { params });
      return response.data.data;
    } catch (error) {
      console.error('获取随机题目集失败:', error);
      throw error;
    }
  },

  // 获取科目列表
  async getCategories() {
    try {
      const response = await api.get('/questions/categories');
      return response.data.data;
    } catch (error) {
      console.error('获取科目列表失败:', error);
      throw error;
    }
  },

  // 获取单个题目
  async getQuestionById(id: string) {
    try {
      const response = await api.get(`/questions/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('获取题目详情失败:', error);
      throw error;
    }
  },

  // 添加错题记录
  async addToMistakes(data: {
    questionId: string;
    userAnswer: string;
    answerTime: number;
  }) {
    try {
      const response = await api.post('/wrong-questions', data);
      return response.data.data;
    } catch (error) {
      console.error('添加错题记录失败:', error);
      throw error;
    }
  },

  // 获取错题列表
  async getWrongQuestions(params: {
    subject?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await api.get('/wrong-questions', { params });
      return response.data.data;
    } catch (error) {
      console.error('获取错题列表失败:', error);
      throw error;
    }
  },

  // 获取错题统计
  async getWrongQuestionStats() {
    try {
      const response = await api.get('/wrong-questions/stats');
      return response.data.data;
    } catch (error) {
      console.error('获取错题统计失败:', error);
      throw error;
    }
  },

  // 获取复习计划
  async getReviewSchedule(subject?: string) {
    try {
      const params = subject ? { subject } : {};
      const response = await api.get('/wrong-questions/review-schedule', { params });
      return response.data.data;
    } catch (error) {
      console.error('获取复习计划失败:', error);
      throw error;
    }
  },

  // 记录复习结果
  async recordReviewResult(data: {
    questionId: string;
    isCorrect: boolean;
    answerTime: number;
    userAnswer: string;
  }) {
    try {
      const response = await api.post('/wrong-questions/review-result', data);
      return response.data.data;
    } catch (error) {
      console.error('记录复习结果失败:', error);
      throw error;
    }
  },

  // 更新错题状态
  async updateWrongQuestion(questionId: string, data: {
    status?: string;
    notes?: string;
    wrongReason?: string[];
    masteryLevel?: number;
  }) {
    try {
      const response = await api.put(`/wrong-questions/${questionId}`, data);
      return response.data.data;
    } catch (error) {
      console.error('更新错题状态失败:', error);
      throw error;
    }
  },

  // 删除错题记录
  async deleteWrongQuestion(questionId: string) {
    try {
      const response = await api.delete(`/wrong-questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('删除错题记录失败:', error);
      throw error;
    }
  },

  // 提交练习结果
  async submitPracticeResult(result: PracticeResult): Promise<void> {
    try {
      await api.post('/practice/submit', result);
    } catch (error) {
      console.error('提交练习结果失败:', error);
      throw error;
    }
  },

  // 获取练习统计
  getPracticeStats: async (category: string) => {
    try {
      const response = await api.get('/practice/stats', {
        params: { category }
      });
      return response.data.data;
    } catch (error) {
      console.error('获取练习统计失败:', error);
      throw error;
    }
  },

  // 获取错题本
  async getMistakes(): Promise<MistakeQuestion[]> {
    try {
      const response = await api.get('/mistakes');
      return response.data;
    } catch (error) {
      console.error('获取错题列表失败:', error);
      throw error;
    }
  },

  // 更新错题状态
  async updateMistakeStatus(questionId: string, status: string): Promise<void> {
    try {
      await api.patch(`/mistakes/${questionId}`, { status });
    } catch (error) {
      console.error('更新错题状态失败:', error);
      throw error;
    }
  }
}; 