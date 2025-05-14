import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';
import { api } from '../utils/api';

// Token 格式化工具函数
const formatToken = (token: string): string => {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

// Token 存储工具函数
const storeToken = (token: string) => {
  if (!token) {
    console.warn('尝试存储空 token');
    return null;
  }
  
  const formattedToken = formatToken(token);
  localStorage.setItem('token', formattedToken);
  
  // 验证存储
  const storedToken = localStorage.getItem('token');
  console.log('Token 存储结果:', {
    original: token,
    formatted: formattedToken,
    stored: storedToken,
    success: storedToken === formattedToken
  });
  
  return formattedToken;
};

// 从响应中提取 token
const extractToken = (response: any): string | null => {
  console.log('提取 token，响应数据:', response);
  
  if (!response) {
    console.warn('响应数据为空');
    return null;
  }
  
  // 尝试不同的数据结构
  if (typeof response === 'string') {
    return response;
  }
  
  if (response.token) {
    return response.token;
  }
  
  if (response.data?.token) {
    return response.data.token;
  }
  
  console.warn('未找到 token，响应结构:', response);
  return null;
};

export const authService = {
  // 用户注册
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('开始注册请求:', credentials.email);
      const response = await api.post<AuthResponse>('/auth/register', credentials);
      console.log('注册响应:', response.data);
      
      const token = extractToken(response.data);
      if (token) {
        storeToken(token);
      }
      
      return response.data;
    } catch (error) {
      console.error('注册请求失败:', error);
      throw error;
    }
  },

  // 用户登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('开始登录请求:', credentials.username);
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('登录响应:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      const token = extractToken(response.data);
      if (token) {
        storeToken(token);
        
        // 验证 token 是否正确存储
        setTimeout(() => {
          const verifyToken = localStorage.getItem('token');
          console.log('Token 存储验证:', {
            expected: formatToken(token),
            actual: verifyToken,
            match: formatToken(token) === verifyToken
          });
        }, 0);
      }
      
      return response.data;
    } catch (error) {
      console.error('登录请求失败:', error);
      throw error;
    }
  },

  // 登出
  logout(): void {
    const token = localStorage.getItem('token');
    console.log('执行登出 - 当前 token:', token);
    localStorage.removeItem('token');
    console.log('登出完成 - 验证 token 已清除:', localStorage.getItem('token'));
  },

  // 检查是否已认证
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    console.log('检查认证状态:', {
      hasToken: isAuth,
      token: token
    });
    return isAuth;
  }
}; 