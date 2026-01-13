import api from '../api';

/**
 * User Service
 */
export const userService = {
  // Get all users
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get single user by ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Get engineers only
  getEngineers: async () => {
    const response = await api.get('/users', { params: { role: 'engineer' } });
    return response.data;
  },

  // Get available engineers (checked-in)
  getAvailableEngineers: async () => {
    const response = await api.get('/users/available-engineers');
    return response.data;
  },

  // Create new user
  create: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update user
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Change password
  changePassword: async (id, data) => {
    const response = await api.patch(`/users/${id}/password`, data);
    return response.data;
  },

  // Get user's assigned complaints
  getAssignedComplaints: async (id) => {
    const response = await api.get(`/users/${id}/complaints`);
    return response.data;
  },

  // Get engineer status (for team view)
  getEngineerStatuses: async () => {
    const response = await api.get('/users/engineer-statuses');
    return response.data;
  },

  // Get user statistics
  getStats: async (id) => {
    const response = await api.get(`/users/${id}/stats`);
    return response.data;
  }
};

export default userService;
