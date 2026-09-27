import axios from 'axios';

export const API_BASE = 'https://smart-real-time-monitoring-inspection-0id7.onrender.com';

const api = axios.create({ baseURL: `${API_BASE}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dosje_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
