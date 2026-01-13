import axios from 'axios';
const base = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:4000/api';
const api = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Store CSRF token globally
let csrfToken = null;

// Generate frontend token (proves request comes from official frontend)
function generateFrontendToken() {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(36).substring(2, 10);
  const secret = 'sk_frontend_default'; // Must match backend's default
  
  // Simple hash function (matches backend's JS hash algorithm)
  let hash = 0;
  const str = secret + ':' + timestamp + ':' + nonce;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return timestamp + '.' + nonce + '.' + Math.abs(hash).toString(16);
}

// Set CSRF token on login
export function setCSRFToken(token) {
  csrfToken = token;
  if (token) {
    api.defaults.headers.common['X-CSRF-Token'] = token;
  }
}

// Get CSRF token
export function getCSRFToken() {
  return csrfToken;
}

// Add CSRF token and Frontend token to all requests
api.interceptors.request.use((config) => {
  const method = config.method ? config.method.toLowerCase() : '';
  
  // Add CSRF token for non-GET requests
  if (method !== 'get' && method !== 'options') {
    // Priority 1: Module-level variable
    // Priority 2: api.defaults.headers
    // Priority 3: localStorage (fallback if state lost)
    const token = csrfToken || 
                  api.defaults.headers.common['X-CSRF-Token'] || 
                  localStorage.getItem('csrfToken');
    
    if (token) {
      config.headers['X-CSRF-Token'] = token;
      // Also update local variable if we found it elsewhere
      if (!csrfToken) csrfToken = token;
    }
  }
  
  // Add frontend token to ALL requests
  // This proves the request comes from the official frontend
  config.headers['X-Frontend-Token'] = generateFrontendToken();
  
  return config;
});

export default api;
