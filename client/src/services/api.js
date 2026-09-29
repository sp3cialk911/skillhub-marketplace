import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  publishProduct: (id) => api.post(`/products/${id}/publish`),
};

// Courses API
export const coursesAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  getEnrollment: (id) => api.get(`/courses/${id}/enrollment`),
};

// Skills API
export const skillsAPI = {
  getSkills: (params) => api.get('/skills', { params }),
  getSkill: (id) => api.get(`/skills/${id}`),
  createSkill: (data) => api.post('/skills', data),
  updateAvailability: (id, isAvailable) => api.put(`/skills/${id}/availability`, { isAvailable }),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (data) => api.post('/payments/intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getPublicProfile: (id) => api.get(`/users/${id}/public`),
};

// Reviews API
export const reviewsAPI = {
  createReview: (data) => api.post('/reviews', data),
  getReviews: (params) => api.get('/reviews', { params }),
};

// Messages API
export const messagesAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getMessages: (params) => api.get('/messages', { params }),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: (params) => api.get('/bookings', { params }),
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};
