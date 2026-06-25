import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global Network Failure Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error!
      console.error('Network Error: Please check your internet connection.');
      // A custom event could be dispatched here to show a toast in the UI
      window.dispatchEvent(new CustomEvent('network-error', { detail: 'Network disconnected. Trying to reconnect...' }));
    }
    return Promise.reject(error);
  }
);

export default api;
