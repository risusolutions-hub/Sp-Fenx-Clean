// Navigation items for sidebar
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Building2, 
  Clock, 
  BarChart3, 
  CalendarDays,
  Activity,
  MessageCircle,
  Award,
  ClipboardCheck,
  Wrench,
  Layout,
  Settings,
  History,
  Shield
} from 'lucide-react';

// Admin/Manager navigation items
export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'complaints', label: 'Tickets', icon: Ticket },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'messages', label: 'Team Chat', icon: MessageCircle },
  { id: 'customers', label: 'Customers', icon: Building2 },
  { id: 'history', label: 'Service History', icon: History },
  { id: 'skills', label: 'Skills & Certs', icon: Award },
  { id: 'checklists', label: 'Checklists', icon: ClipboardCheck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'leaves', label: 'Leave Management', icon: CalendarDays },
  { id: 'customize', label: 'Customize', icon: Layout }
];

// Super Admin only navigation items
export const SUPER_ADMIN_NAV_ITEMS = [
  { id: 'security', label: 'Security Management', icon: Shield, superAdminOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, superAdminOnly: true }
];

// Engineer navigation items
export const ENGINEER_NAV_ITEMS = [
  { id: 'complaints', label: 'My Tickets', icon: Ticket },
  { id: 'messages', label: 'Team Chat', icon: MessageCircle },
  { id: 'work-history', label: 'Work History', icon: Clock },
  { id: 'my-skills', label: 'My Skills', icon: Award },
  { 
    id: 'leaves', 
    label: 'Leave Requests', 
    icon: CalendarDays, 
    featureFlag: 'leave_requests' // Add feature flag
  }
];

// Get navigation items based on role
export const getNavItems = (role) => {
  if (role === 'engineer') {
    return ENGINEER_NAV_ITEMS;
  }
  if (role === 'superadmin') {
    return [...ADMIN_NAV_ITEMS, ...SUPER_ADMIN_NAV_ITEMS];
  }
  return ADMIN_NAV_ITEMS;
};

// Check if user has access to a specific view
export const hasViewAccess = (role, viewId) => {
  const navItems = getNavItems(role);
  return navItems.some(item => item.id === viewId);
};
