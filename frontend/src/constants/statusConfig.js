// Ticket/Complaint status configurations - Professional Enterprise Colors
export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-warning-50 text-warning-700 border border-warning-200',
    bgClass: 'bg-warning-100',
    textClass: 'text-warning-700',
    borderClass: 'border-warning-200',
    dotColor: 'bg-warning-500'
  },
  assigned: {
    label: 'Assigned',
    color: 'bg-info-50 text-info-700 border border-info-200',
    bgClass: 'bg-info-100',
    textClass: 'text-info-700',
    borderClass: 'border-info-200',
    dotColor: 'bg-info-500'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-primary-50 text-primary-700 border border-primary-200',
    bgClass: 'bg-primary-100',
    textClass: 'text-primary-700',
    borderClass: 'border-primary-200',
    dotColor: 'bg-primary-500'
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-warning-50 text-warning-800 border border-warning-200',
    bgClass: 'bg-warning-100',
    textClass: 'text-warning-800',
    borderClass: 'border-warning-200',
    dotColor: 'bg-warning-500'
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-success-50 text-success-700 border border-success-200',
    bgClass: 'bg-success-100',
    textClass: 'text-success-700',
    borderClass: 'border-success-200',
    dotColor: 'bg-success-500'
  },
  closed: {
    label: 'Closed',
    color: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    bgClass: 'bg-neutral-100',
    textClass: 'text-neutral-700',
    borderClass: 'border-neutral-200',
    dotColor: 'bg-neutral-500'
  }
};

export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
};

export const getStatusLabel = (status) => {
  return getStatusConfig(status).label;
};

// Work status for engineers - Professional colors
export const WORK_STATUS_CONFIG = {
  pending: {
    label: 'Not Started',
    bgClass: 'bg-neutral-100',
    textClass: 'text-neutral-700',
    color: 'bg-neutral-50 text-neutral-700 border border-neutral-200'
  },
  travelling: {
    label: 'Travelling',
    bgClass: 'bg-info-100',
    textClass: 'text-info-700',
    color: 'bg-info-50 text-info-700 border border-info-200'
  },
  working: {
    label: 'Working',
    bgClass: 'bg-primary-100',
    textClass: 'text-primary-700',
    color: 'bg-primary-50 text-primary-700 border border-primary-200'
  },
  paused: {
    label: 'Paused',
    bgClass: 'bg-warning-100',
    textClass: 'text-warning-700',
    color: 'bg-warning-50 text-warning-700 border border-warning-200'
  },
  completed: {
    label: 'Completed',
    bgClass: 'bg-success-100',
    textClass: 'text-success-700',
    color: 'bg-success-50 text-success-700 border border-success-200'
  }
};

export const getWorkStatusConfig = (status) => {
  return WORK_STATUS_CONFIG[status] || WORK_STATUS_CONFIG.pending;
};
