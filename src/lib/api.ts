import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1/',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Priority 1: Check if tenant slug is stored in localStorage (set by the tenant page)
    const storedSlug = localStorage.getItem('tenant_slug');
    if (storedSlug) {
      config.headers['X-Tenant-Slug'] = storedSlug;
    } else {
      // Priority 2: Guess from path
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 1 && pathParts[1] !== '' && !['admin-login', 'admin'].includes(pathParts[1])) {
        config.headers['X-Tenant-Slug'] = pathParts[1];
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        // Optional: redirect to login
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
