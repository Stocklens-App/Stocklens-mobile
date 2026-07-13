import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseURL = () => {
  const host = Constants?.expoConfig?.hostUri?.split(':')[0];

  if (host) {
    return `http://${host}:8081`;
  }

  // Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8081';
  }

  return 'http://localhost:8081';
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  ENDPOINTS: {
    HOME: '/api/home',
    ACADEMIC: '/api/academic/all',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
};