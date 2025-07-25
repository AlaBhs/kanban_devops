import axios from 'axios';

const api = axios.create({
  baseURL: window.REACT_APP_API_BASE || "http://localhost:5000/api",
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;