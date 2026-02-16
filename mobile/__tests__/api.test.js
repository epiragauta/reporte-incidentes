import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  loginWithGoogle,
  reportIncident,
  getIncidents,
  logout,
  getStoredUser,
} from '../src/services/api';

jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    create: jest.fn(() => instance),
    __instance: instance,
  };
});

const mockAxios = axios.__instance;

beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.clear();
});

describe('API Service', () => {
  describe('loginWithGoogle', () => {
    it('should post user info and store token', async () => {
      const mockResponse = {
        data: {
          token: 'jwt-token-123',
          user: { id: 1, name: 'Test User', email: 'test@test.com' },
        },
      };
      mockAxios.post.mockResolvedValue(mockResponse);

      const userInfo = { id: 'g123', name: 'Test User', email: 'test@test.com' };
      const result = await loginWithGoogle(userInfo);

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/google', {
        token: 'mock-google-token',
        userInfo,
      });
      expect(result.token).toBe('jwt-token-123');
      expect(result.user.name).toBe('Test User');
      expect(await AsyncStorage.getItem('authToken')).toBe('jwt-token-123');
    });
  });

  describe('reportIncident', () => {
    it('should post incident data', async () => {
      mockAxios.post.mockResolvedValue({
        data: { message: 'Incident reported successfully', id: 1 },
      });

      const incident = {
        lat: 4.6097,
        long: -74.0817,
        description: 'Test incident',
        is_anonymous: true,
      };
      const result = await reportIncident(incident);

      expect(mockAxios.post).toHaveBeenCalledWith('/incidents', incident);
      expect(result.id).toBe(1);
    });
  });

  describe('getIncidents', () => {
    it('should fetch incidents with filter params', async () => {
      const mockIncidents = [
        { id: 1, lat: 4.6, long: -74.0, description: 'Incident 1' },
      ];
      mockAxios.get.mockResolvedValue({
        data: { incidents: mockIncidents },
      });

      const result = await getIncidents({ hours: 24 });

      expect(mockAxios.get).toHaveBeenCalledWith('/incidents', {
        params: { hours: 24 },
      });
      expect(result).toEqual(mockIncidents);
    });

    it('should use empty filter by default', async () => {
      mockAxios.get.mockResolvedValue({ data: { incidents: [] } });

      await getIncidents();

      expect(mockAxios.get).toHaveBeenCalledWith('/incidents', { params: {} });
    });
  });

  describe('logout', () => {
    it('should clear stored credentials', async () => {
      await AsyncStorage.setItem('authToken', 'token');
      await AsyncStorage.setItem('user', JSON.stringify({ id: 1 }));

      await logout();

      expect(await AsyncStorage.getItem('authToken')).toBeNull();
      expect(await AsyncStorage.getItem('user')).toBeNull();
    });
  });

  describe('getStoredUser', () => {
    it('should return parsed user from storage', async () => {
      const user = { id: 1, name: 'Test' };
      await AsyncStorage.setItem('user', JSON.stringify(user));

      const result = await getStoredUser();
      expect(result).toEqual(user);
    });

    it('should return null when no user stored', async () => {
      const result = await getStoredUser();
      expect(result).toBeNull();
    });
  });
});
