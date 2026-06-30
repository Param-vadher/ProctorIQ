import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export const fetchCsrfToken = async () => {
  try {
    const { data } = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/csrf-token', { withCredentials: true });
    api.defaults.headers.common['x-csrf-token'] = data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token', error);
  }
};

api.interceptors.request.use((config) => {
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
