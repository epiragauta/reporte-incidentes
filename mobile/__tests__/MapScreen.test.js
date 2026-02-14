import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MapScreen from '../src/screens/MapScreen';
import * as api from '../src/services/api';

jest.setTimeout(15000);

jest.mock('../src/services/api', () => ({
  getIncidents: jest.fn(),
  logout: jest.fn(),
}));

const createMockNavigation = () => ({
  replace: jest.fn(),
  navigate: jest.fn(),
  addListener: jest.fn((event, callback) => {
    if (event === 'focus') callback();
    return jest.fn();
  }),
});

const mockRoute = {
  params: {
    user: { id: 1, name: 'Test User', email: 'test@test.com' },
  },
};

const mockIncidents = [
  {
    id: 1,
    lat: 4.6097,
    long: -74.0817,
    description: 'Robo en la calle',
    timestamp: '2025-06-01T10:00:00',
    verified: 1,
    is_anonymous: 0,
  },
  {
    id: 2,
    lat: 6.2442,
    long: -75.5812,
    description: 'Vandalismo',
    timestamp: '2025-06-02T14:30:00',
    verified: 0,
    is_anonymous: 1,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  api.getIncidents.mockResolvedValue(mockIncidents);
  api.logout.mockResolvedValue();
});

describe('MapScreen', () => {
  it('should render map and incident count', async () => {
    const nav = createMockNavigation();

    const { getByText, getByTestId } = render(
      <MapScreen route={mockRoute} navigation={nav} />,
    );

    expect(getByText('Incidentes')).toBeTruthy();
    expect(getByText('Test User')).toBeTruthy();
    expect(getByTestId('report-button')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('2 incidentes')).toBeTruthy();
    });
  });

  it('should show anonymous label when no user', async () => {
    const anonRoute = { params: { user: null } };
    const nav = createMockNavigation();

    const { getByText } = render(
      <MapScreen route={anonRoute} navigation={nav} />,
    );

    expect(getByText('Anónimo')).toBeTruthy();
  });

  it('should fetch incidents with default filter', async () => {
    const nav = createMockNavigation();

    render(<MapScreen route={mockRoute} navigation={nav} />);

    await waitFor(() => {
      expect(api.getIncidents).toHaveBeenCalledWith({ hours: 24 });
    });
  });

  it('should change filter when pressing filter buttons', async () => {
    const nav = createMockNavigation();

    const { getByTestId } = render(
      <MapScreen route={mockRoute} navigation={nav} />,
    );

    await waitFor(() => {
      expect(api.getIncidents).toHaveBeenCalled();
    });

    fireEvent.press(getByTestId('filter-7 días'));

    await waitFor(() => {
      expect(api.getIncidents).toHaveBeenCalledWith({ days: 7 });
    });
  });

  it('should navigate to Report screen on report button press', () => {
    const nav = createMockNavigation();

    const { getByTestId } = render(
      <MapScreen route={mockRoute} navigation={nav} />,
    );

    fireEvent.press(getByTestId('report-button'));

    expect(nav.navigate).toHaveBeenCalledWith('Report', {
      user: mockRoute.params.user,
    });
  });

  it('should logout and navigate to Auth', async () => {
    const nav = createMockNavigation();

    const { getByTestId } = render(
      <MapScreen route={mockRoute} navigation={nav} />,
    );

    fireEvent.press(getByTestId('logout-button'));

    await waitFor(() => {
      expect(api.logout).toHaveBeenCalled();
      expect(nav.replace).toHaveBeenCalledWith('Auth');
    });
  });
});
