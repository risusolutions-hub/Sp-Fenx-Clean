import { useState, useCallback } from 'react';
import api from '../api';

export default function useApiWithLoader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = {};
      let response;

      if (method === 'get') {
        response = await api.get(url, config);
      } else if (method === 'post') {
        response = await api.post(url, data, config);
      } else if (method === 'put') {
        response = await api.put(url, data, config);
      } else if (method === 'delete') {
        response = await api.delete(url, config);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, request };
}
