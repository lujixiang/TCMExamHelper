import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 扩展 AxiosRequestConfig 类型
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
  __retryCount?: number;
}

// 创建axios实例
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 增加到30秒
  headers: {
    'Content-Type': 'application/json',
  }
} as CustomAxiosRequestConfig);

// 添加自定义配置
(api.defaults as CustomAxiosRequestConfig).retry = 3;
(api.defaults as CustomAxiosRequestConfig).retryDelay = 1000;

// 添加重试拦截器
api.interceptors.response.use(undefined, async (err) => {
  const config = err.config as CustomAxiosRequestConfig;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }

  config.__retryCount = config.__retryCount || 0;

  if (config.__retryCount >= config.retry) {
    return Promise.reject(err);
  }

  config.__retryCount += 1;
  console.log(`请求重试 (${config.__retryCount}/${config.retry}):`, {
    url: config.url,
    method: config.method
  });

  // 延迟重试
  await new Promise(resolve => setTimeout(resolve, config.retryDelay));
  return api(config);
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    console.log('API 请求拦截器 - token:', {
      token,
      hasToken: !!token,
      url: config.url,
      method: config.method
    });
    
    if (token) {
      // 直接使用存储的 token，因为它已经在存储时被格式化了
      config.headers.Authorization = token;
      console.log('API 请求拦截器 - 添加认证头:', {
        token,
        url: config.url,
        method: config.method
      });
    } else {
      console.log('API 请求拦截器 - 未找到 token:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });
    }
    
    return config;
  },
  (error) => {
    console.error('API 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API 响应拦截器 - 成功响应:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    // 如果是超时错误，提供更友好的错误信息
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('API 超时错误:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      });
      error.message = '请求超时，请检查网络连接或稍后重试';
    }
    
    // 如果是 401 错误，可能是 token 过期，清除 token 并跳转到登录页
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      console.log('API 响应拦截器 - 401错误，当前 token:', token);
      localStorage.removeItem('token');
      console.log('API 响应拦截器 - token 已清除:', localStorage.getItem('token'));
      window.location.href = '/login';
    }
    
    console.error('API 错误:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api; 