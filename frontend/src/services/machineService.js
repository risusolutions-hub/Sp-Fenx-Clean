import api from '../api';

/**
 * Machine Service
 */
export const machineService = {
  // Get all machines
  getAll: async (params = {}) => {
    const response = await api.get('/machines', { params });
    return response.data;
  },

  // Get single machine by ID
  getById: async (id) => {
    const response = await api.get(`/machines/${id}`);
    return response.data;
  },

  // Get machines by customer
  getByCustomer: async (customerId) => {
    const response = await api.get(`/customers/${customerId}/machines`);
    return response.data;
  },

  // Search machines
  search: async (query) => {
    const response = await api.get('/machines/search', { params: { q: query } });
    return response.data;
  },

  // Create new machine
  create: async (data) => {
    const response = await api.post('/machines', data);
    return response.data;
  },

  // Update machine
  update: async (id, data) => {
    const response = await api.put(`/machines/${id}`, data);
    return response.data;
  },

  // Delete machine
  delete: async (id) => {
    const response = await api.delete(`/machines/${id}`);
    return response.data;
  },

  // Get machine's service history
  getServiceHistory: async (id) => {
    const response = await api.get(`/machines/${id}/service-history`);
    return response.data;
  },

  // Get machine statistics
  getStats: async (id) => {
    const response = await api.get(`/machines/${id}/stats`);
    return response.data;
  }
};

export default machineService;
