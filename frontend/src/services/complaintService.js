import api from '../api';

/**
 * Complaint/Ticket Service
 */
export const complaintService = {
  // Get all complaints
  getAll: async (params = {}) => {
    const response = await api.get('/complaints', { params });
    return response.data.complaints || [];
  },

  // Get single complaint by ID
  getById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data.complaint || response.data;
  },

  // Get single complaint by ID
  getById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Get complaints by status
  getByStatus: async (status) => {
    const response = await api.get('/complaints', { params: { status } });
    return response.data;
  },

  // Create new complaint
  create: async (data) => {
    const response = await api.post('/complaints', data);
    return response.data.complaint || response.data;
  },

  // Update complaint
  update: async (id, data) => {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
  },

  // Update complaint status
  updateStatus: async (id, status, notes) => {
    const response = await api.put(`/complaints/${id}/status`, { status, notes });
    return response.data;
  },

  // Assign engineer to complaint
  assignEngineer: async (id, engineerId) => {
    const response = await api.post(`/complaints/${id}/assign`, { engineerId });
    return response.data;
  },

  // Complete service for complaint
  completeService: async (id, data) => {
    const response = await api.post(`/complaints/${id}/complete`, data);
    return response.data;
  },

  // Close complaint/ticket
  close: async (id, data) => {
    const response = await api.post(`/complaints/${id}/close`, data);
    return response.data;
  },

  // Delete complaint
  delete: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },

  // Get complaint statistics
  getStats: async () => {
    const response = await api.get('/complaints/summary');
    return response.data;
  },

  // Get next service number
  getNextServiceNo: async () => {
    const response = await api.get('/complaints/next-service-no');
    return response.data;
  },

  // Lookup by service number
  lookupByServiceNo: async (serviceNo) => {
    const response = await api.get(`/complaints/lookup/${serviceNo}`);
    return response.data;
  },

  // Upload attachments
  uploadAttachments: async (files, onProgress) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await api.post('/uploads/ticket-attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    });
    return response.data;
  }
};

export default complaintService;
