import React, { useEffect, useState, useCallback, useRef, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import SuspenseFallback from './SuspenseFallback';
import { Info } from 'lucide-react';

// Core components (always needed)
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardHeader from './dashboard/DashboardHeader';

// UI helpers
import LoadingCard from './ui/LoadingCard';
import FuturisticLoader from './ui/FuturisticLoader';

// Lazy load view components for code splitting
const DashboardOverview = lazy(() => import('./dashboard/DashboardOverview'));
const ComplaintsView = lazy(() => import('./dashboard/ComplaintsView'));
const EngineerTicketsView = lazy(() => import('./dashboard/EngineerTicketsView'));
const CustomersView = lazy(() => import('./dashboard/CustomersView'));
const TeamView = lazy(() => import('./dashboard/TeamView'));
const ServiceHistoryView = lazy(() => import('./dashboard/ServiceHistoryView'));
const WorkHistoryView = lazy(() => import('./dashboard/WorkHistoryView'));
const EngineerAnalyticsView = lazy(() => import('./dashboard/EngineerAnalyticsView'));
const LeaveManagementView = lazy(() => import('./dashboard/LeaveManagementView'));
const DashboardAnalyticsView = lazy(() => import('./dashboard/DashboardAnalyticsView'));
const ActivityFeed = lazy(() => import('./ActivityFeed'));

const TOAST_LABELS = {
  success: 'Success',
  error: 'Error',
  warning: 'Heads-up',
  info: 'Info'
};

// New feature views
const TeamMessagingView = lazy(() => import('./dashboard/TeamMessagingView'));
const SkillsManagementView = lazy(() => import('./dashboard/SkillsManagementView'));
const ServiceChecklistView = lazy(() => import('./dashboard/ServiceChecklist'));
const CustomizableDashboard = lazy(() => import('./dashboard/CustomizableDashboard'));
const MachineServiceHistory = lazy(() => import('./dashboard/MachineServiceHistory'));
const SettingsView = lazy(() => import('./dashboard/SettingsView'));
const SecurityManagementView = lazy(() => import('./dashboard/SecurityManagementView'));
const EngineerDashboardView = lazy(() => import('./dashboard/EngineerDashboardView'));
// const ServiceHistoryView = lazy(() => import('./dashboard/ServiceHistoryView'));

// Modal components (lazy load on demand)
const UserFormModal = lazy(() => import('./dashboard/UserFormModal'));
const AssignEngineerModal = lazy(() => import('./dashboard/modals/AssignEngineerModal'));
const CompleteServiceModal = lazy(() => import('./dashboard/modals/CompleteServiceModal'));
const CloseTicketModal = lazy(() => import('./dashboard/modals/CloseTicketModal'));
const ComplaintFormModal = lazy(() => import('./dashboard/modals/ComplaintFormModal'));
const UpdateNameModal = lazy(() => import('./dashboard/modals/UpdateNameModal'));
const LeaveRequestModal = lazy(() => import('./dashboard/modals/LeaveRequestModal'));

export default function Dashboard({ user, onLogout, onUserUpdate }) {
  // Derive current view from route and navigate to change views
  const location = useLocation();
  const navigate = useNavigate();
  const rawSegment = (location.pathname || '').replace(/^\/+|\/+$/g, '');
  const currentView = rawSegment === '' || rawSegment === 'dashboard' ? 'dashboard' : rawSegment;
  const setCurrentView = (view) => {
    if (!view || view === 'dashboard') return navigate('/');
    return navigate(`/${view}`);
  };

  // On mount, route engineers to complaints by default (if at root)
  useEffect(() => {
    if ((location.pathname === '/' || location.pathname === '') && user?.role === 'engineer') {
      navigate('/complaints', { replace: true });
    }
  }, [user, location.pathname, navigate]);
  const [appState, setAppState] = useState({
    customers: [],
    machines: [],
    engineers: [],
    users: [],
    complaints: [],
    leaves: [],
    models: ['Fiber 30W', 'Fiber 50W', 'CO2 100W', 'CO2 150W', 'UV Laser 5W', 'MOPA 60W']
  });
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const notificationAnchorRef = useRef(null);
  const [isNewClient, setIsNewClient] = useState(false);
  const [isNewMachine, setIsNewMachine] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load data
  useEffect(() => {
    // Load minimal/core data first to render quickly, then fetch remaining data in background
    let cancelled = false;
    const run = async () => {
      await loadCoreData();
      // fetch non-critical data shortly after to avoid blocking render
      setTimeout(() => {
        if (!cancelled && user?.role !== 'engineer') fetchRemainingData();
      }, 500);
    };
    run();
    return () => { cancelled = true; };
  }, [user]);

  const fetchEngineerComplaints = async () => {
    const [assignedRes, openRes] = await Promise.all([
      api.get('/complaints').catch(() => ({ data: { complaints: [] } })),
      api.get('/complaints?open=1').catch(() => ({ data: { complaints: [] } }))
    ]);
    const combined = [
      ...(assignedRes.data.complaints || []),
      ...(openRes.data.complaints || [])
    ];
    const seen = new Set();
    return combined.filter(item => {
      const key = String(item.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Load only core datasets needed for immediate render
  const loadCoreData = async () => {
    setIsLoadingData(true);
    try {
      const shouldFetchCustomers = user?.role !== 'engineer';
      const [customersRes, machinesRes, complaintsRes] = await Promise.all([
        shouldFetchCustomers ? api.get('/customers').catch(() => ({ data: { customers: [] } })) : Promise.resolve({ data: { customers: [] } }),
        shouldFetchCustomers ? api.get('/machines').catch(() => ({ data: { machines: [] } })) : Promise.resolve({ data: { machines: [] } }),
        user?.role === 'engineer'
          ? Promise.resolve({ data: { complaints: [] } })
          : api.get('/complaints?limit=50').catch(() => ({ data: { complaints: [] } }))
      ]);

      const customers = shouldFetchCustomers ? (customersRes.data.customers || []).map(c => ({ ...c, id: String(c.id) })) : [];
      const machines = shouldFetchCustomers ? (machinesRes.data.machines || []).map(m => ({ ...m, id: String(m.id), customerId: String(m.customerId) })) : [];

      const complaintsRaw = user?.role === 'engineer'
        ? await fetchEngineerComplaints()
        : (complaintsRes.data.complaints || []);
      const complaints = complaintsRaw.map(c => normalizeComplaint(c));

      setAppState(prev => ({
        ...prev,
        customers,
        machines,
        complaints,
      }));

      if (user?.role === 'engineer') {
        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data && meRes.data.csrfToken) {
            setCSRFToken(meRes.data.csrfToken);
            localStorage.setItem('csrfToken', meRes.data.csrfToken);
          }
          setCurrentUser(meRes.data);
        } catch (err) {
          console.log('Could not load current user data');
        }
      }
    } catch (err) {
      console.error('Error loading core data', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load remaining non-critical datasets in background
  const fetchRemainingData = async () => {
    if (user?.role === 'engineer') return;
    try {
      const [usersRes, engineersRes, leavesRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: { users: [] } })),
        api.get('/users/engineers/all').catch(() => ({ data: { engineers: [] } })),
        api.get('/leaves').catch(() => ({ data: { leaves: [] } }))
      ]);

      const allUsers = usersRes.data.users || [];
      const engineers = engineersRes.data.engineers || [];

      setAppState(prev => ({
        ...prev,
        users: allUsers,
        engineers: engineers.map(e => ({ ...e, id: String(e.id) })),
        leaves: leavesRes.data.leaves || prev.leaves
      }));
    } catch (err) {
      console.error('Error loading remaining data', err);
    }
  };

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
        // Auto-checkout on frontend - call API
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
        
        // Calculate elapsed minutes since last check-in (capped at 7pm)
        const elapsedMinutes = Math.floor((endTime.getTime() - checkInTime.getTime()) / 60000);
        
        // Base daily work time from previous check-outs today
        const baseDailyTime = prev.baseDailyWorkTime !== undefined ? prev.baseDailyWorkTime : (prev.dailyTotalWorkTime || 0);
        const totalDailyWorkTime = baseDailyTime + elapsedMinutes;

        return {
          ...prev,
          baseDailyWorkTime: baseDailyTime,
          dailyTotalWorkTime: totalDailyWorkTime
        };
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user?.role, currentUser?.isCheckedIn, currentUser?.lastCheckIn]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const shouldFetchCustomers = user?.role !== 'engineer';
      const [customersRes, machinesRes, usersRes] = await Promise.all([
        shouldFetchCustomers ? api.get('/customers').catch(() => ({ data: { customers: [] } })) : Promise.resolve({ data: { customers: [] } }),
        shouldFetchCustomers ? api.get('/machines').catch(() => ({ data: { machines: [] } })) : Promise.resolve({ data: { machines: [] } }),
        api.get('/users').catch(() => ({ data: { users: [] } }))
      ]);

      let complaints = [];
      if (user?.role === 'engineer') {
        complaints = await fetchEngineerComplaints();
        try {
          const meRes = await api.get('/auth/me');
          setCurrentUser(meRes.data);
        } catch (err) {
          console.log('Could not load current user data');
        }
      } else {
        const complaintsRes = await api.get('/complaints').catch(() => ({ data: { complaints: [] } }));
        complaints = complaintsRes.data.complaints || [];
      }

      const customers = shouldFetchCustomers ? (customersRes.data.customers || []).map(c => ({ ...c, id: String(c.id) })) : [];
      const machines = shouldFetchCustomers ? (machinesRes.data.machines || []).map(m => ({ ...m, id: String(m.id), customerId: String(m.customerId) })) : [];
      const allUsers = usersRes.data.users || [];
      const engineers = allUsers.filter(u => u.role === 'engineer').map(e => ({ ...e, id: String(e.id) }));

      const normalizedComplaints = complaints.map(c => ({
        ...c,
        id: String(c.id),
        customerId: c.customerId ? String(c.customerId) : null,
        machineId: c.machineId ? String(c.machineId) : null,
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
        setAppState(prev => ({
          ...prev,
          leaves
        }));
      } catch (err) {
        console.log('Could not load leave data');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const refreshComplaints = useCallback(async () => {
    try {
      const complaints = user?.role === 'engineer'
        ? await fetchEngineerComplaints()
        : (await api.get('/complaints').catch(() => ({ data: { complaints: [] } }))).data.complaints || [];

      if (user?.role === 'engineer') {
        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data && meRes.data.csrfToken) {
            setCSRFToken(meRes.data.csrfToken);
            localStorage.setItem('csrfToken', meRes.data.csrfToken);
          }
          setCurrentUser(meRes.data);
        } catch (err) {
          console.log('Could not refresh current user', err);
        }
      }

      const normalizedComplaints = complaints.map(normalizeComplaint);
      setAppState(prev => ({ ...prev, complaints: normalizedComplaints }));
      return normalizedComplaints;
    } catch (error) {
      console.error('Error refreshing complaints:', error);
      return [];
    }
  }, [user]);

  // Helper: normalize a complaint shape used in state
  const normalizeComplaint = (c) => ({
    ...c,
    id: String(c.id),
    customerId: c.customerId ? String(c.customerId) : null,
    machineId: c.machineId ? String(c.machineId) : null,
    assignedTo: c.assignedTo ? String(c.assignedTo) : null,
    displayId: c.complaintId || `TKT-${c.id}`,
    status: c.status || 'pending',
    workStatus: c.workStatus || 'pending',
    customer: c.Customer ? ({ ...c.Customer, id: String(c.Customer.id) }) : null,
    machine: c.Machine ? ({ ...c.Machine, id: String(c.Machine.id) }) : null,
    engineer: c.engineer ? ({ ...c.engineer, id: String(c.engineer.id) }) : null
  });

  const updateComplaintInState = (updated) => {
    const nc = { ...normalizeComplaint(updated), isUpdating: false };
    setAppState(prev => ({
      ...prev,
      complaints: prev.complaints.map(c => c.id === nc.id ? { ...c, ...nc } : c)
    }));
  };

  const addComplaintToState = (newComplaint) => {
    const nc = normalizeComplaint(newComplaint);
    setAppState(prev => ({
      ...prev,
      complaints: [nc, ...prev.complaints]
    }));
  };

  const removeComplaintFromState = (id) => {
    const sid = String(id);
    setAppState(prev => ({
      ...prev,
      complaints: prev.complaints.filter(c => c.id !== sid)
    }));
  };

  const updateUserInState = (updatedUser) => {
    const uid = String(updatedUser.id);
    setAppState(prev => ({
      ...prev,
      users: prev.users.map(u => String(u.id) === uid ? { ...u, ...updatedUser, id: uid } : u),
      engineers: prev.engineers.map(e => String(e.id) === uid ? { ...e, ...updatedUser, id: uid } : e)
    }));
  };

  const addUserToState = (newUser) => {
    const nu = { ...newUser, id: String(newUser.id) };
    setAppState(prev => ({ ...prev, users: [nu, ...prev.users], engineers: newUser.role === 'engineer' ? [nu, ...prev.engineers] : prev.engineers }));
  };

  const removeUserFromState = (id) => {
    const sid = String(id);
    setAppState(prev => ({
      ...prev,
      users: prev.users.filter(u => String(u.id) !== sid),
      engineers: prev.engineers.filter(e => String(e.id) !== sid)
    }));
  };

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves');
      const leaves = res.data.leaves || [];
      setAppState(prev => ({ ...prev, leaves }));
    } catch (err) {
      console.log('Could not load leave data');
    }
  };

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id]);
      delete toastTimers.current[id];
    }
  }, []);

  const clearAllToasts = useCallback(() => {
    Object.values(toastTimers.current).forEach(clearTimeout);
    toastTimers.current = {};
    setToasts([]);
  }, []);

  const showToast = (message, type = 'info', options = {}) => {
    if (!message) return;
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
    const toast = {
      id,
      message,
      type,
      title: options.title ?? TOAST_LABELS[type] ?? ''
      ,
      timestamp: options.timestamp || Date.now()
    };
    setToasts(prev => [...prev, toast]);
    const duration = options.duration ?? 4500;
    toastTimers.current[id] = setTimeout(() => {
      dismissToast(id);
    }, duration);
  };

  useEffect(() => {
    if (!toasts.length) {
      setIsNotificationPanelOpen(false);
    }
    return () => {
      Object.values(toastTimers.current).forEach(clearTimeout);
      toastTimers.current = {};
    };
  }, [toasts.length]);

  useEffect(() => {
    if (!isNotificationPanelOpen) return;
    const closeOnOutsideClick = (event) => {
      if (notificationAnchorRef.current && !notificationAnchorRef.current.contains(event.target)) {
        setIsNotificationPanelOpen(false);
      }
    };
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, [isNotificationPanelOpen]);

  const handlePanelDismiss = useCallback((index) => {
    const toast = toasts[index];
    if (toast) dismissToast(toast.id);
  }, [toasts, dismissToast]);

  const openNotificationPanel = () => {
    if (toasts.length === 0 || isNotificationPanelOpen) return;
    setIsNotificationPanelOpen(true);
  };

  const closeModal = () => setModal(null);

  // ===== USER MANAGEMENT =====
  const handleCreateUser = async (userData) => {
    // Optimistic: create local user with placeholder ID and isUpdating flag
    const optimisticUser = { ...userData, id: `temp-${Date.now()}`, isUpdating: true };
    addUserToState(optimisticUser);

    try {
      const res = await api.post('/users', userData);
      if (res?.data) {
        // Remove temp user and add actual user from server
        removeUserFromState(optimisticUser.id);
        addUserToState(res.data);
      }
      closeModal();
      showToast('User created successfully', 'success');
    } catch (error) {
      // Rollback: remove optimistic user
      removeUserFromState(optimisticUser.id);
      showToast(error.response?.data?.error || 'Error creating user', 'error');
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    // Optimistic update with rollback
    const uid = String(userId);
    const prevUser = appState.users.find(u => String(u.id) === uid);
    const optimistic = { ...(prevUser || {}), ...userData, id: uid, isUpdating: true };
    updateUserInState(optimistic);

    try {
      const res = await api.put(`/users/${userId}`, userData);
      if (res?.data) updateUserInState(res.data);
      else updateUserInState({ ...optimistic, isUpdating: false });
      closeModal();
      showToast('User updated successfully', 'success');
    } catch (error) {
      if (prevUser) updateUserInState(prevUser);
      showToast(error.response?.data?.error || 'Error updating user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Optimistic delete with rollback
      const uid = String(userId);
      const prevUser = appState.users.find(u => String(u.id) === uid);
      removeUserFromState(userId);

      try {
        await api.delete(`/users/${userId}`);
        showToast('User deleted', 'success');
      } catch (error) {
        if (prevUser) addUserToState(prevUser);
        showToast(error.response?.data?.error || 'Error deleting user', 'error');
      }
    }
  };

  const handleBlockUser = async (userId, shouldBlock) => {
    const action = shouldBlock ? 'block' : 'unblock';
    const uid = String(userId);
    const prevUser = appState.users.find(u => String(u.id) === uid);
    const optimisticStatus = shouldBlock ? 'blocked' : 'active';
    const optimistic = {
      ...(prevUser || {}),
      isBlocked: shouldBlock,
      status: optimisticStatus,
      id: uid,
      isUpdating: true
    };
    updateUserInState(optimistic);

    try {
      const res = await api.post(`/users/${userId}/${action}`);
      if (res?.data) {
        const fromServer = { ...res.data };
        if (fromServer.isBlocked !== undefined && !fromServer.status) {
          fromServer.status = fromServer.isBlocked ? 'blocked' : 'active';
        }
        updateUserInState(fromServer);
      } else {
        updateUserInState({ ...optimistic, isUpdating: false });
      }
      showToast(`User ${action}ed`, 'success');
    } catch (error) {
      if (prevUser) updateUserInState(prevUser);
      showToast(error.response?.data?.error || `Error ${action}ing user`, 'error');
    }
  };

  // ===== COMPLAINT MANAGEMENT =====
  const assignComplaint = async (complaintId, engineerId) => {
    // Optimistic update with rollback on failure
    const cid = String(complaintId);
    const prevComplaint = appState.complaints.find(c => c.id === cid);
    const optimistic = { ...(prevComplaint || {}), assignedTo: String(engineerId), status: 'assigned', isUpdating: true };

    // apply optimistic change
    setAppState(prev => ({
      ...prev,
      complaints: prev.complaints.map(c => c.id === cid ? optimistic : c)
    }));

    try {
      const res = await api.post(`/complaints/${complaintId}/assign`, { engineerId });
      if (res?.data) {
        updateComplaintInState(res.data);
      } else {
        // clear isUpdating flag
        setAppState(prev => ({
          ...prev,
          complaints: prev.complaints.map(c => c.id === cid ? { ...c, isUpdating: false } : c)
        }));
      }
      closeModal();
      showToast('Engineer assigned successfully', 'success');
    } catch (error) {
      // rollback to previous complaint state
      if (prevComplaint) {
        setAppState(prev => ({
          ...prev,
          complaints: prev.complaints.map(c => c.id === cid ? prevComplaint : c)
        }));
      }
      showToast(error.response?.data?.error || 'Error assigning engineer', 'error');
    }
  };

  const handleCancelAssignment = async (complaintId) => {
    // Optimistic unassign with rollback
    const cid = String(complaintId);
    const prevComplaint = appState.complaints.find(c => c.id === cid);
    const optimistic = { ...(prevComplaint || {}), assignedTo: null, status: 'pending', isUpdating: true };

    setAppState(prev => ({
      ...prev,
      complaints: prev.complaints.map(c => c.id === cid ? optimistic : c)
    }));

    try {
      const res = await api.post(`/complaints/${complaintId}/unassign`);
      if (res?.data) updateComplaintInState(res.data);
      else setAppState(prev => ({ ...prev, complaints: prev.complaints.map(c => c.id === cid ? { ...c, isUpdating: false } : c) }));
      showToast('Assignment cancelled', 'success');
    } catch (error) {
      if (prevComplaint) {
        setAppState(prev => ({
          ...prev,
          complaints: prev.complaints.map(c => c.id === cid ? prevComplaint : c)
        }));
      }
      showToast(error.response?.data?.error || 'Error cancelling assignment', 'error');
    }
  };

  const handleEngineerTakeTicket = async (complaintId) => {
    // Engineer taking an available ticket - falls back to prop user if state currentUser not loaded
    const engineerId = currentUser?.id || user?.id;
    
    if (engineerId) {
      await assignComplaint(complaintId, engineerId);
    } else {
      showToast('Error: User not found', 'error');
    }
  };

  const updateTicketStatus = async (id, status) => {
    // Optimistic update with rollback
    const cid = String(id);
    const prevComplaint = appState.complaints.find(c => c.id === cid);
    const optimistic = { ...(prevComplaint || {}), status, isUpdating: true };

    setAppState(prev => ({
      ...prev,
      complaints: prev.complaints.map(c => c.id === cid ? optimistic : c)
    }));

    try {
      const res = await api.put(`/complaints/${id}/status`, { status });
      if (res?.data) updateComplaintInState(res.data);
      else setAppState(prev => ({ ...prev, complaints: prev.complaints.map(c => c.id === cid ? { ...c, isUpdating: false } : c) }));
      showToast(`Status Updated: ${status}`, 'success');
    } catch (error) {
      if (prevComplaint) {
        setAppState(prev => ({
          ...prev,
          complaints: prev.complaints.map(c => c.id === cid ? prevComplaint : c)
        }));
      }
      showToast(error.response?.data?.error || 'Error updating status', 'error');
    }
  };

  const handleCompleteSubmit = async (complaintId, solution, spares) => {
    // Optimistic update with rollback
    const cid = String(complaintId);
    const prevComplaint = appState.complaints.find(c => c.id === cid);
    const optimistic = { ...(prevComplaint || {}), status: 'resolved', workStatus: 'completed', isUpdating: true };

    setAppState(prev => ({
      ...prev,
      complaints: prev.complaints.map(c => c.id === cid ? optimistic : c)
    }));

    try {
      const res = await api.post(`/complaints/${complaintId}/complete`, { workPerformed: solution, solutionNotes: solution, sparesUsed: spares });
      if (res?.data) updateComplaintInState(res.data);
      else setAppState(prev => ({ ...prev, complaints: prev.complaints.map(c => c.id === cid ? { ...c, isUpdating: false } : c) }));
      closeModal();
      showToast('Service completed and ticket closed.', 'success');
    } catch (error) {
      if (prevComplaint) {
        setAppState(prev => ({
          ...prev,
          complaints: prev.complaints.map(c => c.id === cid ? prevComplaint : c)
        }));
      }
      showToast(error.response?.data?.error || 'Error completing ticket', 'error');
    }
  };

  const handleCloseSubmit = async (complaintId, notes) => {
    if (!notes.trim()) {
      showToast('Closing requires notes', 'warning');
      return;
    }
    // Optimistic update with rollback
    const cid = String(complaintId);
    const prevComplaint = appState.complaints.find(c => c.id === cid);
    const optimistic = { ...(prevComplaint || {}), status: 'closed', isUpdating: true };

    setAppState(prev => ({
      ...prev,
      complaints: prev.complaints.map(c => c.id === cid ? optimistic : c)
    }));

    try {
      const res = await api.post(`/complaints/${complaintId}/close`, { solutionNotes: notes });
      if (res?.data) updateComplaintInState(res.data);
      else setAppState(prev => ({ ...prev, complaints: prev.complaints.map(c => c.id === cid ? { ...c, isUpdating: false } : c) }));
      closeModal();
      showToast('Ticket closed with notes.', 'success');
    } catch (error) {
      if (prevComplaint) {
        setAppState(prev => ({
          ...prev,
          complaints: prev.complaints.map(c => c.id === cid ? prevComplaint : c)
        }));
      }
      showToast(error.response?.data?.error || 'Error closing ticket', 'error');
    }
  };

  const handleComplaintSubmit = async (formData) => {
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
          return;
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
        return;
      }

      // Create complaint with all new fields
      const complaintPayload = { 
        problem: formData.problem, 
        priority: formData.priority || 'medium', 
        customerId: cid, 
        machineId: mid,
        issueCategories: formData.issueCategories || [],
        attachments: formData.attachments || []
      };
      
      // Optimistic complaint creation
      const optimisticComplaint = normalizeComplaint({
        id: `temp-${Date.now()}`,
        ...complaintPayload,
        status: 'pending',
        workStatus: 'pending',
        displayId: `TKT-temp`,
        isUpdating: true
      });
      addComplaintToState(optimisticComplaint);

      const complaintRes = await api.post('/complaints', complaintPayload);

      if (complaintRes.data) {
        // Remove optimistic and add server response
        removeComplaintFromState(optimisticComplaint.id);
        addComplaintToState(complaintRes.data);
        setModal(null);
        setIsNewClient(false);
        setIsNewMachine(false);
        showToast(`Ticket created successfully.`, 'success');
      }
    } catch (error) {
      // Rollback: remove optimistic complaint on failure
      removeComplaintFromState(optimisticComplaint.id);
      const errorMsg = error.response?.data?.error || error.message || 'Error creating complaint';
      showToast(errorMsg, 'error');
    }
  };

  // ===== ENGINEER DAILY CHECK-IN/OUT =====
  const handleDailyCheckIn = async () => {
    // Optimistic check-in
    const optimisticUser = { ...currentUser, isCheckedIn: true, isUpdating: true };
    setCurrentUser(optimisticUser);

    try {
      const res = await api.post('/users/check-in');
      const userData = res.data;
      // Store the base daily work time at check-in to prevent compounding
      setCurrentUser({ ...userData, baseDailyWorkTime: userData.dailyTotalWorkTime || 0 });
      showToast('✓ Checked in for the day. Let\'s get to work!', 'success');
    } catch (error) {
      // Rollback on error
      setCurrentUser(currentUser);
      if (error.response && error.response.data) {
        const errorMsg = error.response.data.error;
        if (errorMsg === 'Already checked in') {
          showToast('You are already checked in.', 'info');
          try {
            const me = await api.get('/auth/me');
            setCurrentUser(me.data);
          } catch (e) {
            // fallback to full reload if needed
            loadData();
          }
        } else if (errorMsg.includes('Check-in is only allowed')) {
          showToast(errorMsg, 'error');
        } else {
          showToast('Error checking in', 'error');
        }
      } else {
        showToast('Error checking in', 'error');
      }
    }
  };

  const handleDailyCheckOut = async () => {
    // Optimistic check-out
    const prevUser = currentUser;
    const optimisticUser = { ...currentUser, isCheckedIn: false, isUpdating: true };
    setCurrentUser(optimisticUser);

    try {
      const res = await api.post('/users/check-out');
      setCurrentUser(res.data);
      const hours = Math.floor((res.data?.dailyTotalWorkTime || 0) / 60);
      const mins = (res.data?.dailyTotalWorkTime || 0) % 60;
      const message = res.data?.autoCheckout 
        ? `✓ Auto checkout at 7:00 PM. Today's total work time: ${hours}h ${mins}m`
        : `✓ Checked out. Today's total work time: ${hours}h ${mins}m`;
      showToast(message, 'success');
    } catch (error) {
      // Rollback on error
      setCurrentUser(prevUser);
      showToast(error.response?.data?.error || 'Error checking out', 'error');
    }
  };

  const handleEditName = () => {
    setModal('updateName');
  };

  const handleNameUpdateSuccess = (updatedUser) => {
    closeModal();
    // Update the user object in parent component
    if (onUserUpdate) {
      onUserUpdate({ ...user, name: updatedUser.name });
    }
    showToast('✓ Profile updated successfully!', 'success');
    // Update local app state instead of full reload
    if (updatedUser?.id) updateUserInState(updatedUser);
  };

  // ===== RENDER CONTENT BASED ON VIEW =====
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview complaints={appState.complaints} customers={appState.customers} machines={appState.machines} engineers={appState.engineers} setCurrentView={setCurrentView} setModal={setModal} user={user} />;
      case 'complaints':
        // Engineers get card-style view, others get table view
        if (user?.role === 'engineer') {
          return <EngineerTicketsView 
            complaints={appState.complaints} 
            customers={appState.customers} 
            machines={appState.machines}
            currentUser={currentUser}
            onTakeTicket={handleEngineerTakeTicket}
            onStartWork={updateTicketStatus}
            onComplete={(complaint) => setModal({ type: 'complete', complaint })}
            onClose={(complaint) => setModal({ type: 'close', complaint })}
            onCancelAssignment={handleCancelAssignment}
            onRefreshTickets={refreshComplaints}
            isLoadingData={isLoadingData}
          />;
        }
        return <ComplaintsView 
          complaints={appState.complaints} 
          customers={appState.customers} 
          machines={appState.machines}
          user={user}
          onAssign={assignComplaint}
          onTakeTicket={assignComplaint}
          onCancelAssignment={handleCancelAssignment}
          onStartWork={updateTicketStatus}
          onComplete={handleCompleteSubmit}
          onClose={handleCloseSubmit}
          onRefresh={refreshComplaints}
          setModal={setModal}
        />;
      case 'customers':
        return <CustomersView customers={appState.customers} machines={appState.machines} setModal={setModal} user={user} />;
      case 'team':
        return <TeamView 
          users={appState.users}
          user={user}
          onNewUser={() => setModal({ type: 'user-form', userToEdit: null })}
          onEditUser={(targetUser) => setModal({ type: 'user-form', userToEdit: targetUser })}
          onDeleteUser={handleDeleteUser}
          onBlockUser={handleBlockUser}
          setModal={setModal}
        />;
      case 'history':
        return <ServiceHistoryView user={user} customers={appState.customers} machines={appState.machines} />;
      case 'work-history':
        return <WorkHistoryView user={user} />;
      case 'engineer-analytics':
        return <EngineerAnalyticsView users={appState.users} appState={appState} setModal={setModal} user={user} />;
      case 'leaves':
        return <LeaveManagementView 
          leaves={appState.leaves} 
          user={user}
          onApprove={() => {}}
          onReject={() => {}}
          onRefresh={loadData}
          setModal={setModal}
        />;
      case 'analytics':
        return <DashboardAnalyticsView complaints={appState.complaints} users={appState.users} setModal={setModal} user={user} />;
      case 'activity':
        return <ActivityFeed complaints={appState.complaints} users={appState.users} />;
      
      // New feature views
      case 'engineers':
        return <EngineerDashboardView user={user} setModal={setModal} />;
      case 'messages':
        return <TeamMessagingView currentUser={currentUser || user} setModal={setModal} user={user} />;
      case 'skills':
        return <SkillsManagementView currentUser={user} />;
      case 'my-skills':
        return <SkillsManagementView currentUser={user} />;
      case 'checklists':
        return <ServiceChecklistView />;
      case 'customize':
        return <CustomizableDashboard userRole={user?.role} />;
      case 'settings':
        return <SettingsView user={user} showToast={showToast} />;
      case 'security':
        return <SecurityManagementView />;
        
      default:
        return <DashboardOverview complaints={appState.complaints} customers={appState.customers} machines={appState.machines} engineers={appState.engineers} setCurrentView={setCurrentView} />;
    }
  };

  // ===== RENDER MODALS =====
  const renderModal = () => {
    if (!modal) return null;

    if (modal.type === 'assign') {
      return <AssignEngineerModal complaint={modal.complaint} engineers={appState.engineers} onAssign={assignComplaint} onClose={closeModal} />;
    }

    if (modal.type === 'complete') {
      return <CompleteServiceModal complaint={modal.complaint} onSubmit={handleCompleteSubmit} onClose={closeModal} />;
    }

    if (modal.type === 'close') {
      return <CloseTicketModal complaint={modal.complaint} onSubmit={handleCloseSubmit} onClose={closeModal} />;
    }

    if (modal.type === 'user-form') {
      return (
        <UserFormModal
          currentUser={user}
          userToEdit={modal.userToEdit}
          onClose={closeModal}
          onCreate={handleCreateUser}
          onUpdate={handleUpdateUser}
        />
      );
    }

    if (modal === 'complaint') {
      return (
        <ComplaintFormModal
          appState={appState}
          user={user}
          isNewClient={isNewClient}
          isNewMachine={isNewMachine}
          setIsNewClient={setIsNewClient}
          setIsNewMachine={setIsNewMachine}
          onSubmit={handleComplaintSubmit}
          onClose={() => { setModal(null); setIsNewClient(false); setIsNewMachine(false); }}
          showToast={showToast}
        />
      );
    }

    if (modal === 'updateName') {
      return (
        <UpdateNameModal
          user={user}
          onClose={closeModal}
          onSuccess={handleNameUpdateSuccess}
        />
      );
    }

    if (modal === 'leaveRequest') {
      return (
        <LeaveRequestModal
          onClose={closeModal}
          onSuccess={async (createdLeave) => {
            closeModal();
            // if modal returned the created leave, append it; otherwise refetch leaves
            if (createdLeave && createdLeave.id) {
              setAppState(prev => ({ ...prev, leaves: [createdLeave, ...(prev.leaves || [])] }));
            } else {
              await fetchLeaves();
            }
            showToast('Leave request submitted successfully', 'success');
          }}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-neutral-50 to-primary-50 font-sans">
      <DashboardSidebar 
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={onLogout}
        onCheckIn={handleDailyCheckIn}
        onCheckOut={handleDailyCheckOut}
        onEditName={handleEditName}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader 
          currentView={currentView}
          onNewComplaint={() => setModal('complaint')}
          onRequestLeave={() => setModal('leaveRequest')}
          user={user}
          notifications={toasts}
          onDismissNotification={(index) => {
            const t = toasts[index];
            if (t) dismissToast(t.id);
          }}
          onClearNotifications={() => clearAllToasts()}
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-0">
          <div className="max-w-7xl mx-auto space-y-6 fade-in">
            {isLoadingData && (
              <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center z-50">
                <div className="flex items-center gap-2 px-4 py-2 glass-strong rounded-full shadow-lg border border-white/40">
                  <span className="w-4 h-4 border-2 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Syncing Data…</span>
                </div>
              </div>
            )}

            <Suspense fallback={<ViewLoadingFallback />}>
              {!isLoadingData ? renderContent() : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} className="hover:scale-[1.02] transition-transform duration-300" />)}
                </div>
              )}
            </Suspense>

            {isLoadingData && <FuturisticLoader message="Preparing your workspace…" fullScreen={false} /> }
          </div>
        </div>

        {/* Global Toast Notifications */}
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
          {toasts.map((t) => (
            <div 
              key={t.id} 
              className={`pointer-events-auto min-w-[320px] max-w-md floating-card p-4 flex items-start gap-4 animate-slide-in scale-in border-l-4 ${
                t.type === 'success' ? 'border-success-500' : 
                t.type === 'error' ? 'border-error-500' : 
                'border-primary-500'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                t.type === 'success' ? 'bg-success-50 text-success-600' : 
                t.type === 'error' ? 'bg-error-50 text-error-600' : 
                'bg-primary-50 text-primary-600'
              }`}>
                <Info size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-neutral-800">{TOAST_LABELS[t.type] || 'Notification'}</p>
                <p className="text-sm text-neutral-600 mt-1">{t.message}</p>
              </div>
              <button 
                onClick={() => dismissToast(t.id)}
                className="text-neutral-400 hover:text-neutral-600 p-1 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Modal with Suspense */}
      <Suspense fallback={null}>
        {renderModal()}
      </Suspense>
    </div>
  );
}

function ViewLoadingFallback() {
  return (
    <div className="flex flex-col gap-6 w-full fade-in">
      <div className="glass-card p-8 h-48 skeleton"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card h-32 skeleton"></div>
        <div className="glass-card h-32 skeleton"></div>
        <div className="glass-card h-32 skeleton"></div>
      </div>
      <div className="glass-card h-80 skeleton"></div>
    </div>
  );
}
