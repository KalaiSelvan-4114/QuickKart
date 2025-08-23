import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('🌐 Axios baseURL:', baseURL);

const axiosClient = axios.create({
  baseURL: baseURL,
  timeout: 45000, // 45 second timeout to handle cold starts
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
  async error => {
    const config = error?.config || {};
    const isTimeout = error?.code === 'ECONNABORTED';
    const isNetwork = !error?.response;
    const isTimeoutError = error?.response?.status === 408;

    // Single retry with small backoff for network/timeout errors (e.g., server cold start)
    if ((isTimeout || isNetwork || isTimeoutError) && !config._retry) {
      config._retry = true;
      console.log('🔄 Retrying request due to timeout/network error...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return axiosClient(config);
    }

    // Do NOT clear the token on 401 here; let the caller decide.
    return Promise.reject(error);
  }
);

export const warmupBackend = async () => {
  try {
    await axiosClient.get('/');
  } catch (e) {
    // ignore warmup errors
  }
};

export default axiosClient;
