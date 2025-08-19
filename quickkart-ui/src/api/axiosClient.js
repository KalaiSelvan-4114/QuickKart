import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('🌐 Axios baseURL:', baseURL);

const axiosClient = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 second timeout
});

axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  response => response,
  error => {
    // Do NOT clear the token on 401 here; let the caller decide.
    // Some endpoints (e.g., shop orders) may transiently 401 and we don't want to log the user out.
    return Promise.reject(error);
  }
);

export default axiosClient;
