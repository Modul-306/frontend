import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1/',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Check if we are in a tenant path: /tenant-slug/...
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1] !== '' && pathParts[1] !== 'admin') {
      config.headers['X-Tenant-Slug'] = pathParts[1];
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
