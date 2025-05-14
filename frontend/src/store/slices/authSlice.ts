import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, RegisterCredentials } from '../../types/auth';
import { authService } from '../../services/authService';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

// 登录
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      console.log('登录 thunk - 响应:', response);
      return response;
    } catch (err: any) {
      console.error('登录 thunk - 错误:', err);
      return rejectWithValue(err.response?.data?.message || err.message || '登录失败，请稍后重试');
    }
  }
);

// 注册
export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      console.log('注册 thunk - 响应:', response);
      return response;
    } catch (err: any) {
      console.error('注册 thunk - 错误:', err);
      return rejectWithValue(err.response?.data?.message || err.message || '注册失败，请稍后重试');
    }
  }
);

// 登出
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
    return { success: true };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('登录 reducer - action payload:', action.payload);
        if (action.payload.success && action.payload.data) {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.error = null;
          
          // 确保 token 已存储到 localStorage
          if (action.payload.data.token) {
            localStorage.setItem('token', 
              action.payload.data.token.startsWith('Bearer ') 
                ? action.payload.data.token 
                : `Bearer ${action.payload.data.token}`
            );
          }
        } else {
          state.loading = false;
          state.error = action.payload.message || '登录失败';
        }
      })
      .addCase(login.rejected, (state, action) => {
        console.error('登录 reducer - rejected:', action.error);
        state.loading = false;
        state.error = action.error.message || '登录失败';
      });

    // 注册
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        console.log('注册 reducer - action payload:', action.payload);
        if (action.payload.success && action.payload.data) {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.error = null;
          
          // 确保 token 已存储到 localStorage
          if (action.payload.data.token) {
            localStorage.setItem('token', 
              action.payload.data.token.startsWith('Bearer ') 
                ? action.payload.data.token 
                : `Bearer ${action.payload.data.token}`
            );
          }
        } else {
          state.loading = false;
          state.error = action.payload.message || '注册失败';
        }
      })
      .addCase(register.rejected, (state, action) => {
        console.error('注册 reducer - rejected:', action.error);
        state.loading = false;
        state.error = action.error.message || '注册失败';
      });

    // 登出
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;