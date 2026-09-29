import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { user, token, refreshToken } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isLoading: false });
      return user;
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  register: async (email, password, firstName, lastName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ email, password, firstName, lastName });
      const { user, token, refreshToken } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isLoading: false });
      return user;
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Registration failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
}));

export default useAuthStore;
