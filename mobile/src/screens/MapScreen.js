import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getIncidents, logout } from '../services/api';

const FILTERS = [
  { label: '24h', params: { hours: 24 } },
  { label: '7 días', params: { days: 7 } },
  { label: '1 mes', params: { months: 1 } },
  { label: '1 año', params: { months: 12 } },
];

// Default region: Colombia
const COLOMBIA_REGION = {
  latitude: 4.5709,
  longitude: -74.2973,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export default function MapScreen({ route, navigation }) {
  const user = route.params?.user || null;
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);

  const fetchIncidents = useCallback(async (filterIndex) => {
    setLoading(true);
    try {
      const data = await getIncidents(FILTERS[filterIndex].params);
      setIncidents(data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los incidentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents(activeFilter);
  }, [activeFilter, fetchIncidents]);

  // Refresh when coming back from ReportScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchIncidents(activeFilter);
    });
    return unsubscribe;
  }, [navigation, activeFilter, fetchIncidents]);

  const handleFilterChange = (index) => {
    setActiveFilter(index);
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Auth');
  };

  const getMarkerColor = (incident) => {
    if (incident.verified) return 'green';
    if (incident.is_anonymous) return 'orange';
    return 'red';
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.topBarTitle}>Incidentes</Text>
          <Text style={styles.topBarSubtitle}>
            {user ? user.name : 'Anónimo'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          testID="logout-button"
        >
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {FILTERS.map((filter, index) => (
          <TouchableOpacity
            key={filter.label}
            style={[
              styles.filterButton,
              activeFilter === index && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange(index)}
            testID={`filter-${filter.label}`}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === index && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map */}
      <MapView style={styles.map} initialRegion={COLOMBIA_REGION} testID="map-view">
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            coordinate={{
              latitude: incident.lat,
              longitude: incident.long,
            }}
            pinColor={getMarkerColor(incident)}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>Incidente #{incident.id}</Text>
                <Text style={styles.calloutDescription}>
                  {incident.description}
                </Text>
                <Text style={styles.calloutMeta}>
                  {new Date(incident.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.calloutMeta}>
                  {incident.verified ? 'Verificado' : 'No verificado'}
                  {incident.is_anonymous ? ' · Anónimo' : ''}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#1a73e8" />
        </View>
      )}

      {/* Incident Count */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{incidents.length} incidentes</Text>
      </View>

      {/* Report Button */}
      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => navigation.navigate('Report', { user })}
        testID="report-button"
      >
        <Text style={styles.reportButtonText}>+ Reportar Incidente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a73e8',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  topBarLeft: {
    flex: 1,
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  topBarSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#1a73e8',
  },
  filterText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  map: {
    flex: 1,
  },
  callout: {
    maxWidth: 200,
    padding: 4,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  calloutMeta: {
    fontSize: 11,
    color: '#888',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 140,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  countBadge: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  countText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  reportButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#e53935',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
