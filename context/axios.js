import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../context/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 15000,
});

// Attach token automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.log('Interceptor error:', err.message);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;