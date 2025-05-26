import axios from 'axios';
import { getAuthToken } from '../contexts/AuthContext';

const instance = axios.create({
  baseURL: '/api',
});

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance; 