import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AuthScreen from '../src/screens/AuthScreen';
import * as api from '../src/services/api';

jest.setTimeout(15000);

jest.mock('../src/services/api', () => ({
  getStoredUser: jest.fn(),
  loginWithGoogle: jest.fn(),
  logout: jest.fn(),
}));

const createMockNavigation = () => ({
  replace: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AuthScreen', () => {
  it('should render login and anonymous buttons', async () => {
    api.getStoredUser.mockResolvedValue(null);
    const nav = createMockNavigation();

    const { getByTestId, getByText } = render(
      <AuthScreen navigation={nav} />,
    );

    await waitFor(() => {
      expect(getByTestId('google-login-button')).toBeTruthy();
    });

    expect(getByTestId('anonymous-button')).toBeTruthy();
    expect(getByText('Incident Reporter')).toBeTruthy();
  });

  it('should redirect to Map if user is already stored', async () => {
    api.getStoredUser.mockResolvedValue({ id: 1, name: 'Existing User' });
    const nav = createMockNavigation();

    render(<AuthScreen navigation={nav} />);

    await waitFor(() => {
      expect(nav.replace).toHaveBeenCalledWith('Map', {
        user: { id: 1, name: 'Existing User' },
      });
    });
  });

  it('should navigate as anonymous when pressing anonymous button', async () => {
    api.getStoredUser.mockResolvedValue(null);
    const nav = createMockNavigation();

    const { getByTestId } = render(
      <AuthScreen navigation={nav} />,
    );

    await waitFor(() => {
      expect(getByTestId('anonymous-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('anonymous-button'));

    expect(nav.replace).toHaveBeenCalledWith('Map', { user: null });
  });

  it('should call loginWithGoogle on Google button press', async () => {
    api.getStoredUser.mockResolvedValue(null);
    api.loginWithGoogle.mockResolvedValue({
      user: { id: 1, name: 'Usuario Demo' },
      token: 'token-123',
    });
    const nav = createMockNavigation();

    const { getByTestId } = render(
      <AuthScreen navigation={nav} />,
    );

    await waitFor(() => {
      expect(getByTestId('google-login-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('google-login-button'));

    await waitFor(() => {
      expect(api.loginWithGoogle).toHaveBeenCalled();
      expect(nav.replace).toHaveBeenCalledWith('Map', {
        user: { id: 1, name: 'Usuario Demo' },
      });
    });
  });
});
