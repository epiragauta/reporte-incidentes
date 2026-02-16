// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' }),
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 4.6097, longitude: -74.0817 },
    }),
  ),
  Accuracy: {
    Balanced: 3,
  },
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View, Text } = require('react-native');
  const React = require('react');

  const MockMapView = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref, testID: props.testID || 'map-view' }, props.children),
  );
  MockMapView.displayName = 'MockMapView';

  const MockMarker = (props) =>
    React.createElement(View, { testID: 'marker' }, props.children);

  const MockCallout = (props) =>
    React.createElement(View, { testID: 'callout' }, props.children);

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Callout: MockCallout,
  };
});

// Mock @react-navigation
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    }),
  };
});

// Silence non-critical warnings during tests
jest.spyOn(console, 'warn').mockImplementation(() => {});
