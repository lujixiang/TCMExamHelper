import axios from 'axios';
import { MistakeItem } from '../types/mistake';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const validateMistakeItems = (data: any): MistakeItem[] => {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter((item): item is MistakeItem => {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.question === 'string' &&
      typeof item.correctAnswer === 'string' &&
      typeof item.yourAnswer === 'string' &&
      typeof item.explanation === 'string' &&
      typeof item.date === 'string'
    );
  });
};

export const mistakeService = {
  // 获取所有错题
  getAllMistakes: async () => {
    try {
      const response = await api.get('/wrong-questions');
      return validateMistakeItems(response.data);
    } catch (error) {
      console.error('获取错题失败:', error);
      return [];
    }
  },

  // 获取错题统计
  getMistakeStats: async () => {
    try {
      const response = await api.get('/wrong-questions/stats');
      return response.data;
    } catch (error) {
      console.error('获取错题统计失败:', error);
      throw error;
    }
  },

  // 添加新错题
  addMistake: async (mistake: Omit<MistakeItem, 'id'>) => {
    try {
      const response = await api.post('/wrong-questions', mistake);
      return response.data;
    } catch (error) {
      console.error('添加错题失败:', error);
      throw error;
    }
  },

  // 更新错题
  updateMistake: async (mistake: MistakeItem) => {
    try {
      const response = await api.put(`/wrong-questions/${mistake.id}`, mistake);
      return response.data;
    } catch (error) {
      console.error('更新错题失败:', error);
      throw error;
    }
  },

  // 删除错题
  deleteMistake: async (id: string) => {
    try {
      await api.delete(`/wrong-questions/${id}`);
    } catch (error) {
      console.error('删除错题失败:', error);
      throw error;
    }
  },

  // 批量删除错题
  deleteMistakes: async (ids: string[]) => {
    try {
      await api.delete('/wrong-questions', { data: { ids } });
    } catch (error) {
      console.error('批量删除错题失败:', error);
      throw error;
    }
  },

  // 获取错题详情
  getMistakeDetail: async (id: string) => {
    try {
      const response = await api.get(`/wrong-questions/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取错题详情失败:', error);
      throw error;
    }
  }
}; 