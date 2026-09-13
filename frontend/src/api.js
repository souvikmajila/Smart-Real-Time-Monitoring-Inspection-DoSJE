import axios from 'axios';

export const API_BASE = 'http://localhost:4000';

const api = axios.create({ baseURL: `${API_BASE}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dosje_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
