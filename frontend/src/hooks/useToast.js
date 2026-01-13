import { useState, useCallback } from 'react';

/**
 * Custom hook for managing toast notifications
 */
export default function useToast(duration = 3000) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    
    setTimeout(() => {
      setToast(null);
    }, duration);
  }, [duration]);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast
  };
}
