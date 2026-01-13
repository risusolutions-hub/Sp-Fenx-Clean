// Priority options for service tickets
export const PRIORITY_OPTIONS = [
  { 
    value: 'low', 
    label: 'Low', 
    icon: '🟢', 
    desc: 'Can wait', 
    bgColor: 'bg-emerald-50', 
    borderColor: 'border-emerald-200', 
    textColor: 'text-emerald-700', 
    activeGlow: 'shadow-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-700'
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    icon: '🟡', 
    desc: 'Schedule soon', 
    bgColor: 'bg-amber-50', 
    borderColor: 'border-amber-200', 
    textColor: 'text-amber-700', 
    activeGlow: 'shadow-amber-200',
    badgeClass: 'bg-amber-100 text-amber-700'
  },
  { 
    value: 'high', 
    label: 'High', 
    icon: '🟠', 
    desc: 'Urgent', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200', 
    textColor: 'text-orange-700', 
    activeGlow: 'shadow-orange-200',
    badgeClass: 'bg-orange-100 text-orange-700'
  },
  { 
    value: 'critical', 
    label: 'Critical', 
    icon: '🔴', 
    desc: 'Production down', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200', 
    textColor: 'text-red-700', 
    activeGlow: 'shadow-red-200',
    badgeClass: 'bg-red-100 text-red-700'
  }
];

export const getPriorityConfig = (value) => {
  return PRIORITY_OPTIONS.find(p => p.value === value) || PRIORITY_OPTIONS[1];
};

export const getPriorityLabel = (value) => {
  const config = getPriorityConfig(value);
  return config?.label || 'Medium';
};

export const getPriorityBadgeClass = (value) => {
  const config = getPriorityConfig(value);
  return config?.badgeClass || 'bg-slate-100 text-slate-700';
};
