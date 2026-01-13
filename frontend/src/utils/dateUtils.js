// Date and time utility functions

/**
 * Format a date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

/**
 * Format time to readable string
 */
export const formatTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  return `${formatDate(date)}, ${formatTime(date)}`;
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return '-';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

/**
 * Format duration in minutes to readable string
 */
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '-';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

/**
 * Check if current time is within work hours (9am - 7pm)
 */
export const isWithinWorkHours = () => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 9 && hour < 19;
};

/**
 * Get time remaining until end of work day
 */
export const getTimeUntilWorkEnd = () => {
  const now = new Date();
  const endTime = new Date(now);
  endTime.setHours(19, 0, 0, 0);
  
  if (now >= endTime) return 0;
  
  const diffMs = endTime - now;
  return Math.floor(diffMs / 60000); // Return minutes
};
