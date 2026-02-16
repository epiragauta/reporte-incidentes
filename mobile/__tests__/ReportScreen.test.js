import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ReportScreen from '../src/screens/ReportScreen';
import * as api from '../src/services/api';
import * as Location from 'expo-location';

jest.mock('../src/services/api', () => ({
  reportIncident: jest.fn(),
}));

const mockNavigation = {
  goBack: jest.fn(),
};

const mockRouteAuthenticated = {
  params: {
    user: { id: 1, name: 'Test User', email: 'test@test.com' },
  },
};

const mockRouteAnonymous = {
  params: { user: null },
};

beforeEach(() => {
  jest.clearAllMocks();
  Location.requestForegroundPermissionsAsync.mockResolvedValue({
    status: 'granted',
  });
  Location.getCurrentPositionAsync.mockResolvedValue({
    coords: { latitude: 4.6097, longitude: -74.0817 },
  });
  api.reportIncident.mockResolvedValue({
    message: 'Incident reported successfully',
    id: 1,
  });
});

describe('ReportScreen', () => {
  it('should render form elements', async () => {
    const { getByTestId, getByText } = render(
      <ReportScreen route={mockRouteAuthenticated} navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Nuevo Reporte')).toBeTruthy();
      expect(getByText('Reportando como: Test User')).toBeTruthy();
      expect(getByTestId('description-input')).toBeTruthy();
      expect(getByTestId('submit-button')).toBeTruthy();
      expect(getByTestId('cancel-button')).toBeTruthy();
    });
  });

  it('should show anonymous notice for anonymous users', async () => {
    const { getByText } = render(
      <ReportScreen route={mockRouteAnonymous} navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Reportando como: Anónimo')).toBeTruthy();
      expect(
        getByText(/se enviará como anónimo/i),
      ).toBeTruthy();
    });
  });

  it('should display GPS coordinates after loading', async () => {
    const { getByText } = render(
      <ReportScreen route={mockRouteAuthenticated} navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Lat: 4.609700')).toBeTruthy();
      expect(getByText('Lon: -74.081700')).toBeTruthy();
    });
  });

  it('should submit incident with correct data', async () => {
    const { getByTestId } = render(
      <ReportScreen route={mockRouteAuthenticated} navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByTestId('description-input')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('description-input'), 'Robo en la esquina');
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(api.reportIncident).toHaveBeenCalledWith({
        lat: 4.6097,
        long: -74.0817,
        description: 'Robo en la esquina',
        is_anonymous: false,
      });
    });
  });

  it('should submit as anonymous when no user', async () => {
    const { getByTestId } = render(
      <ReportScreen route={mockRouteAnonymous} navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByTestId('description-input')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('description-input'), 'Vandalismo');
    fireEvent.press(getByTestId('submit-button'));

    await waitFor(() => {
      expect(api.reportIncident).toHaveBeenCalledWith({
        lat: 4.6097,
        long: -74.0817,
        description: 'Vandalismo',
        is_anonymous: true,
      });
    });
  });

  it('should go back on cancel', async () => {
    const { getByTestId } = render(
      <ReportScreen route={mockRouteAuthenticated} navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByTestId('cancel-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('cancel-button'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('should update character count as user types', async () => {
    const { getByTestId, getByText } = render(
      <ReportScreen route={mockRouteAuthenticated} navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('0/500')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('description-input'), 'Hola mundo');

    expect(getByText('10/500')).toBeTruthy();
  });
});
