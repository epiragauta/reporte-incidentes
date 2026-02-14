import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your machine's IP when testing on a physical device.
// For Android emulator use: http://10.0.2.2:3000/api
// For iOS simulator use: http://localhost:3000/api
const API_URL = 'http://10.0.2.2:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request if available
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Authenticate with Google (mock for demo).
 * Stores the JWT token in AsyncStorage.
 */
export async function loginWithGoogle(userInfo) {
  const response = await apiClient.post('/auth/google', {
    token: 'mock-google-token',
    userInfo,
  });
  const { token, user } = response.data;
  await AsyncStorage.setItem('authToken', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
  return { token, user };
}

/**
 * Report a new incident.
 */
export async function reportIncident({ lat, long, description, is_anonymous }) {
  const response = await apiClient.post('/incidents', {
    lat,
    long,
    description,
    is_anonymous,
  });
  return response.data;
}

/**
 * Fetch incidents with an optional time filter.
 * @param {object} filter - One of { hours, days, weeks, months }
 */
export async function getIncidents(filter = {}) {
  const response = await apiClient.get('/incidents', { params: filter });
  return response.data.incidents;
}

/**
 * Log out: clear stored credentials.
 */
export async function logout() {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
}

/**
 * Get the currently stored user (or null).
 */
export async function getStoredUser() {
  const userJson = await AsyncStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

export { API_URL };
export default apiClient;
