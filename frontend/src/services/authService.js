import api from '../api';

/**
 * Authentication Service
 */
export const authService = {
  // identifier can be email or username
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  checkIn: async () => {
    const response = await api.post('/auth/check-in');
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/auth/check-out');
    return response.data;
  },

  getWorkStatus: async () => {
    const response = await api.get('/auth/work-status');
    return response.data;
  }
};

export default authService;
