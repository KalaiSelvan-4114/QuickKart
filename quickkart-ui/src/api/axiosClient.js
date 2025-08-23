import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('🌐 Axios baseURL:', baseURL);

// Request deduplication cache
const pendingRequests = new Map();

const axiosClient = axios.create({
  baseURL: baseURL,
  timeout: 45000, // 45 second timeout to handle cold starts
});

axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Create request key for deduplication
  const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.data || {})}`;
  
  // Check if same request is already pending
  if (pendingRequests.has(requestKey)) {
    const existingRequest = pendingRequests.get(requestKey);
    if (existingRequest && !existingRequest.isCompleted) {
      console.log('🔄 Duplicate request detected, returning existing promise');
      return existingRequest.promise;
    }
  }

  // Create new request promise
  const requestPromise = new Promise((resolve, reject) => {
    config.resolve = resolve;
    config.reject = reject;
  });

  // Store request info
  pendingRequests.set(requestKey, {
    promise: requestPromise,
    isCompleted: false,
    timestamp: Date.now()
  });

  // Clean up old requests (older than 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [key, request] of pendingRequests.entries()) {
    if (request.timestamp < fiveMinutesAgo) {
      pendingRequests.delete(key);
    }
  });

  return config;
});

axiosClient.interceptors.response.use(
  response => {
    // Mark request as completed
    const requestKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.data || {})}`;
    const requestInfo = pendingRequests.get(requestKey);
    if (requestInfo) {
      requestInfo.isCompleted = true;
      pendingRequests.delete(requestKey);
    }
    return response;
  },
  async error => {
    const config = error?.config || {};
    const isTimeout = error?.code === 'ECONNABORTED';
    const isNetwork = !error?.response;
    const isTimeoutError = error?.response?.status === 408;

    // Mark request as completed
    const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.data || {})}`;
    const requestInfo = pendingRequests.get(requestKey);
    if (requestInfo) {
      requestInfo.isCompleted = true;
      pendingRequests.delete(requestKey);
    }

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

// Clean up function for component unmount
export const cleanupPendingRequests = () => {
  pendingRequests.clear();
};

export default axiosClient;
