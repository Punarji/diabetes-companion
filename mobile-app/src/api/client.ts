import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Point this at your FastAPI backend. Use your machine's LAN IP (not localhost)
// when testing on a physical device or emulator.
export const API_BASE_URL = 'http://10.0.2.2:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function saveTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    ['access_token', accessToken],
    ['refresh_token', refreshToken],
  ]);
}

export async function clearTokens() {
  await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
}
