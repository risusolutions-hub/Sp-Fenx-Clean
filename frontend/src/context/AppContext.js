import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api';

const AppContext = createContext(null);

export function AppProvider({ children, user, onUserUpdate }) {
  // State
  const [appState, setAppState] = useState({
    customers: [],
    machines: [],
    engineers: [],
    users: [],
    complaints: [],
    leaves: [],
    models: ['Fiber 30W', 'Fiber 50W', 'CO2 100W', 'CO2 150W', 'UV Laser 5W', 'MOPA 60W']
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Toast helpers
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [customersRes, machinesRes, usersRes, complaintsRes] = await Promise.all([
        api.get('/customers').catch(() => ({ data: { customers: [] } })),
        api.get('/machines').catch(() => ({ data: { machines: [] } })),
        api.get('/users').catch(() => ({ data: { users: [] } })),
        api.get('/complaints').catch(() => ({ data: { complaints: [] } }))
      ]);

      let complaints = complaintsRes.data.complaints || [];

      if (user?.role === 'engineer') {
        const pendingRes = await api.get('/complaints?open=1').catch(() => ({ data: { complaints: [] } }));
        const pending = pendingRes.data.complaints || [];
        complaints = [...complaints, ...pending];
        
        try {
          const meRes = await api.get('/auth/me');
          setCurrentUser(meRes.data);
        } catch (err) {
          console.log('Could not load current user data');
        }
      }

      const customers = (customersRes.data.customers || []).map(c => ({ ...c, id: String(c.id) }));
      const machines = (machinesRes.data.machines || []).map(m => ({ ...m, id: String(m.id), customerId: String(m.customerId) }));
      const allUsers = usersRes.data.users || [];
      const engineers = allUsers.filter(u => u.role === 'engineer').map(e => ({ ...e, id: String(e.id) }));

      const normalizedComplaints = complaints.map(c => ({
        ...c,
        id: String(c.id),
        customerId: String(c.customerId),
        machineId: String(c.machineId),
        assignedTo: c.assignedTo ? String(c.assignedTo) : null,
        displayId: c.complaintId || `TKT-${c.id}`,
        status: c.status || 'pending',
        workStatus: c.workStatus || 'pending'
      }));

      setAppState(prev => ({
        ...prev,
        customers,
        machines,
        engineers,
        users: allUsers,
        complaints: normalizedComplaints,
      }));

      // Load leaves
      try {
        const leavesRes = await api.get('/leaves').catch(() => ({ data: { leaves: [] } }));
        const leaves = leavesRes.data.leaves || [];
        setAppState(prev => ({ ...prev, leaves }));
      } catch (err) {
        console.log('Could not load leave data');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.role, showToast]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live timer for daily work time + 7pm auto-checkout check
  useEffect(() => {
    if (user?.role !== 'engineer' || !currentUser?.isCheckedIn) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      
      // Check if it's 7:00 PM or later - trigger auto-checkout
      if (hour >= 19 && currentUser?.isCheckedIn) {
        api.post('/users/check-out').then(res => {
          const dailyMins = res.data?.dailyTotalWorkTime || 0;
          const hours = Math.floor(dailyMins / 60);
          const mins = dailyMins % 60;
          showToast(`⏰ Auto-checkout at 7:00 PM. Today's total: ${hours}h ${mins}m`, 'info');
          setCurrentUser(res.data);
        }).catch(err => {
          console.error('Auto-checkout error:', err);
        });
        return;
      }

      setCurrentUser(prev => {
        if (!prev || !prev.isCheckedIn || !prev.lastCheckIn) {
          return prev;
        }

        const checkInTime = new Date(prev.lastCheckIn);
        const nowTime = new Date();
        
        // Cap calculation time at 7pm
        let endTime = nowTime;
        if (nowTime.getHours() >= 19) {
          endTime = new Date(nowTime);
          endTime.setHours(19, 0, 0, 0);
        }
        
        const elapsedMinutes = Math.floor((endTime.getTime() - checkInTime.getTime()) / 60000);
        const baseDailyTime = prev.baseDailyWorkTime !== undefined ? prev.baseDailyWorkTime : (prev.dailyTotalWorkTime || 0);
        const totalDailyWorkTime = baseDailyTime + elapsedMinutes;

        return {
          ...prev,
          baseDailyWorkTime: baseDailyTime,
          dailyTotalWorkTime: totalDailyWorkTime
        };
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.role, currentUser?.isCheckedIn, currentUser?.lastCheckIn, showToast]);

  // ===== USER MANAGEMENT =====
  const createUser = useCallback(async (userData) => {
    try {
      await api.post('/users', userData);
      loadData();
      showToast('User created successfully', 'success');
      return true;
    } catch (error) {
      showToast(error.response?.data?.error || 'Error creating user', 'error');
      return false;
    }
  }, [loadData, showToast]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      await api.put(`/users/${userId}`, userData);
      loadData();
      showToast('User updated successfully', 'success');
      return true;
    } catch (error) {
      showToast(error.response?.data?.error || 'Error updating user', 'error');
      return false;
    }
  }, [loadData, showToast]);

  const deleteUser = useCallback(async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return false;
    try {
      await api.delete(`/users/${userId}`);
      loadData();
      showToast('User deleted', 'success');
      return true;
    } catch (error) {
      showToast('Error deleting user', 'error');
      return false;
    }
  }, [loadData, showToast]);

  const blockUser = useCallback(async (userId, shouldBlock) => {
    const action = shouldBlock ? 'block' : 'unblock';
    try {
      await api.post(`/users/${userId}/${action}`);
      loadData();
      showToast(`User ${action}ed`, 'success');
      return true;
    } catch (error) {
      showToast(`Error ${action}ing user`, 'error');
      return false;
    }
  }, [loadData, showToast]);

  // ===== COMPLAINT MANAGEMENT =====
  const assignComplaint = useCallback(async (complaintId, engineerId) => {
    try {
      await api.post(`/complaints/${complaintId}/assign`, { engineerId });
      loadData();
      showToast('Engineer assigned successfully', 'success');
      return true;
    } catch (error) {
      showToast('Error assigning engineer', 'error');
      return false;
    }
  }, [loadData, showToast]);

  const cancelAssignment = useCallback(async (complaintId) => {
    try {
      await api.post(`/complaints/${complaintId}/unassign`);
      loadData();
      showToast('Assignment cancelled', 'success');
      return true;
    } catch (error) {
      showToast('Error cancelling assignment', 'error');
      return false;
    }
  }, [loadData, showToast]);

  const updateTicketStatus = useCallback(async (id, status) => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      loadData();
      showToast(`Status Updated: ${status}`, 'success');
      return true;
    } catch (error) {
      showToast('Error updating status', 'error');
      return false;
    }
  }, [loadData, showToast]);

  const completeTicket = useCallback(async (complaintId, solution, spares) => {
    try {
      await api.post(`/complaints/${complaintId}/complete`, { 
        workPerformed: solution, 
        solutionNotes: solution, 
        sparesUsed: spares 
      });
      loadData();
      showToast('Service completed and ticket closed.', 'success');
      return true;
    } catch (error) {
      showToast('Error completing ticket', 'error');
      return false;
    }
  }, [loadData, showToast]);

  const closeTicket = useCallback(async (complaintId, notes) => {
    if (!notes.trim()) {
      showToast('Closing requires notes', 'warning');
      return false;
    }
    try {
      await api.post(`/complaints/${complaintId}/close`, { solutionNotes: notes });
      loadData();
      showToast('Ticket closed with notes.', 'success');
      return true;
    } catch (error) {
      showToast('Error closing ticket', 'error');
      return false;
    }
  }, [loadData, showToast]);

  const createComplaint = useCallback(async (formData) => {
    try {
      let cid = formData.customerId ? parseInt(formData.customerId) : null;
      let mid = formData.machineId ? parseInt(formData.machineId) : null;

      // If new customer, create it first
      if (formData.isNewCustomer && formData.customerData) {
        const customerPayload = {
          name: formData.customerData.companyName,
          company: formData.customerData.companyName,
          companyName: formData.customerData.companyName,
          serviceNo: formData.serviceNo,
          contactPerson: formData.customerData.contactPerson,
          city: formData.customerData.city || 'Unknown',
          contact: formData.customerData.phone || 'N/A',
          phone: formData.customerData.phone,
          phones: formData.customerData.phones,
          address: formData.customerData.address,
          email: formData.customerData.email
        };
        const created = await api.post('/customers', customerPayload);
        cid = created.data.id;
      }

      // If new machine, create it
      if (formData.isNewMachine && formData.machineData) {
        if (!formData.machineData.model || !formData.machineData.serialNumber) {
          showToast("Machine Model and Serial No are required", "warning");
          return false;
        }
        const machineCreated = await api.post('/machines', {
          model: formData.machineData.model,
          serialNumber: formData.machineData.serialNumber,
          installationDate: new Date().toISOString(),
          warrantyAmc: 'N/A',
          customerId: cid
        });
        mid = machineCreated.data.id;
        
        // Add new model to state if it's custom
        const modelName = formData.machineData.model;
        setAppState(prev => ({
          ...prev,
          models: !prev.models.includes(modelName) ? [...prev.models, modelName] : prev.models
        }));
      }

      if (!cid || !mid || cid === 0 || mid === 0 || isNaN(cid) || isNaN(mid)) {
        showToast("Customer and Machine are required", "warning");
        return false;
      }

      const complaintPayload = { 
        problem: formData.problem, 
        priority: formData.priority || 'medium', 
        customerId: cid, 
        machineId: mid,
        issueCategories: formData.issueCategories || [],
        attachments: formData.attachments || []
      };
      
      await api.post('/complaints', complaintPayload);
      loadData();
      showToast('Ticket created successfully.', 'success');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Error creating complaint';
      showToast(errorMsg, 'error');
      return false;
    }
  }, [loadData, showToast]);

  // ===== ENGINEER CHECK-IN/OUT =====
  const checkIn = useCallback(async () => {
    try {
      const res = await api.post('/users/check-in');
      const userData = res.data;
      setCurrentUser({ ...userData, baseDailyWorkTime: userData.dailyTotalWorkTime || 0 });
      showToast('✓ Checked in for the day. Let\'s get to work!', 'success');
      return true;
    } catch (error) {
      if (error.response?.data) {
        const errorMsg = error.response.data.error;
        if (errorMsg === 'Already checked in') {
          showToast('You are already checked in.', 'info');
          loadData();
        } else if (errorMsg.includes('Check-in is only allowed')) {
          showToast(errorMsg, 'error');
        } else {
          showToast('Error checking in', 'error');
        }
      } else {
        showToast('Error checking in', 'error');
      }
      return false;
    }
  }, [loadData, showToast]);

  const checkOut = useCallback(async () => {
    try {
      const res = await api.post('/users/check-out');
      setCurrentUser(res.data);
      const hours = Math.floor((res.data?.dailyTotalWorkTime || 0) / 60);
      const mins = (res.data?.dailyTotalWorkTime || 0) % 60;
      const message = res.data?.autoCheckout 
        ? `✓ Auto checkout at 7:00 PM. Today's total work time: ${hours}h ${mins}m`
        : `✓ Checked out. Today's total work time: ${hours}h ${mins}m`;
      showToast(message, 'success');
      return true;
    } catch (error) {
      showToast('Error checking out', 'error');
      return false;
    }
  }, [showToast]);

  const updateName = useCallback(async (newName) => {
    try {
      const res = await api.put(`/users/${user.id}`, { name: newName });
      if (onUserUpdate) {
        onUserUpdate({ ...user, name: newName });
      }
      showToast('✓ Profile updated successfully!', 'success');
      loadData();
      return res.data;
    } catch (error) {
      showToast('Error updating profile', 'error');
      return null;
    }
  }, [user, onUserUpdate, loadData, showToast]);

  const value = {
    // State
    appState,
    currentUser,
    loading,
    toast,
    user,
    
    // Toast
    showToast,
    hideToast,
    
    // Data loading
    loadData,
    
    // User management
    createUser,
    updateUser,
    deleteUser,
    blockUser,
    
    // Complaint management
    assignComplaint,
    cancelAssignment,
    updateTicketStatus,
    completeTicket,
    closeTicket,
    createComplaint,
    
    // Engineer actions
    checkIn,
    checkOut,
    updateName,
    setCurrentUser
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
