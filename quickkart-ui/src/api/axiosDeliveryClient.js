import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://10.232.67.185:3000';

const axiosDeliveryClient = axios.create({
  baseURL,
  timeout: 45000,
});

axiosDeliveryClient.interceptors.request.use(config => {
  const token = localStorage.getItem('delivery_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosDeliveryClient;


