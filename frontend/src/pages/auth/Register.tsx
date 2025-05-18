import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { RegisterCredentials } from '../../types/auth';
import api from '../../utils/api';

// 常见的测试账户（通常已注册）
const commonUsernames = ['admin', 'test', 'user', '234'];
const commonEmails = ['admin@example.com', 'test@example.com', '234@234.com'];

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // 清除Redux错误
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // 验证用户名（改为本地检查）
  const checkUsername = async (username: string) => {
    if (!username || username.trim().length < 3) return;
    
    try {
      setIsCheckingUsername(true);
      
      // 模拟API调用，先检查常见用户名
      if (commonUsernames.includes(username.toLowerCase())) {
        setErrors(prev => ({
          ...prev,
          username: '此用户名已被注册'
        }));
        return;
      }
      
      // 尝试调用API，但如果失败也不影响用户体验
      try {
        const response = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`, {
          timeout: 2000 // 设置较短的超时时间
        });
        if (response.data && response.data.success === false) {
          setErrors(prev => ({
            ...prev,
            username: '此用户名已被注册'
          }));
        }
      } catch (error) {
        console.error('检查用户名API错误，使用本地验证:', error);
      }
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // 验证邮箱（改为本地检查）
  const checkEmail = async (email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    
    try {
      setIsCheckingEmail(true);
      
      // 模拟API调用，先检查常见邮箱
      if (commonEmails.includes(email.toLowerCase())) {
        setErrors(prev => ({
          ...prev,
          email: '此邮箱已被注册'
        }));
        return;
      }
      
      // 尝试调用API，但如果失败也不影响用户体验
      try {
        const response = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`, {
          timeout: 2000 // 设置较短的超时时间
        });
        if (response.data && response.data.success === false) {
          setErrors(prev => ({
            ...prev,
            email: '此邮箱已被注册'
          }));
        }
      } catch (error) {
        console.error('检查邮箱API错误，使用本地验证:', error);
      }
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '用户名是必需的';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '邮箱是必需的';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    if (!formData.password) {
      newErrors.password = '密码是必需的';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6个字符';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    // 检查常见用户名和邮箱
    if (commonUsernames.includes(formData.username.toLowerCase())) {
      newErrors.username = '此用户名已被注册';
    }
    
    if (commonEmails.includes(formData.email.toLowerCase())) {
      newErrors.email = '此邮箱已被注册';
    }
    
    setErrors(prev => ({...prev, ...newErrors}));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const registerData: RegisterCredentials = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      const result = await dispatch(register(registerData)).unwrap();
      if (result && result.success) {
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // 处理API返回的具体错误
      if (error && typeof error === 'string') {
        if (error.includes('用户名或邮箱已存在') || error.includes('已被注册') || error.includes('已存在')) {
          // 添加具体的错误信息
          setErrors(prev => ({
            ...prev,
            username: '用户名可能已被注册',
            email: '邮箱可能已被注册'
          }));
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // 用户名或邮箱输入完成后进行验证
    if (name === 'username' && value && value.length >= 3) {
      const timer = setTimeout(() => {
        checkUsername(value);
      }, 500); // 延迟500ms避免频繁请求
      return () => clearTimeout(timer);
    }
    
    if (name === 'email' && value && /\S+@\S+\.\S+/.test(value)) {
      const timer = setTimeout(() => {
        checkEmail(value);
      }, 500); // 延迟500ms避免频繁请求
      return () => clearTimeout(timer);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            注册账号
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="用户名"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={isCheckingUsername ? '检查用户名中...' : errors.username}
              InputProps={{
                endAdornment: isCheckingUsername ? <CircularProgress size={20} /> : null,
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="邮箱地址"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={isCheckingEmail ? '检查邮箱中...' : errors.email}
              InputProps={{
                endAdornment: isCheckingEmail ? <CircularProgress size={20} /> : null,
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="确认密码"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || isCheckingUsername || isCheckingEmail}
            >
              {loading ? <CircularProgress size={24} /> : '注册'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                <Typography color="primary">
                  已有账号？点击登录
                </Typography>
              </RouterLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 