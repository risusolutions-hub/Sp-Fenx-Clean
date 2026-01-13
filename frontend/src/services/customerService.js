import api from '../api';

/**
 * Customer Service
 */
export const customerService = {
  // Get all customers
  getAll: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  // Get single customer by ID
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Search customers
  search: async (query) => {
    const response = await api.get('/customers/search', { params: { q: query } });
    return response.data;
  },

  // Create new customer
  create: async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  // Update customer
  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  // Delete customer
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Get customer's machines
  getMachines: async (id) => {
    const response = await api.get(`/customers/${id}/machines`);
    return response.data;
  },

  // Get customer's complaints/service history
  getComplaints: async (id) => {
    const response = await api.get(`/customers/${id}/complaints`);
    return response.data;
  },

  // Get customer statistics
  getStats: async (id) => {
    const response = await api.get(`/customers/${id}/stats`);
    return response.data;
  }
};

export default customerService;
