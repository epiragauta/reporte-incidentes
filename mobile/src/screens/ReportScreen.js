import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { reportIncident } from '../services/api';

export default function ReportScreen({ route, navigation }) {
  const user = route.params?.user || null;
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Se necesita acceso a la ubicación para reportar incidentes. Puedes ingresar las coordenadas manualmente.',
        );
        setLocationLoading(false);
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch {
        Alert.alert('Error', 'No se pudo obtener la ubicación actual.');
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa una descripción del incidente.');
      return;
    }

    if (!location) {
      Alert.alert('Ubicación requerida', 'No se ha podido obtener tu ubicación.');
      return;
    }

    setSubmitting(true);
    try {
      const isAnonymous = !user;
      await reportIncident({
        lat: location.latitude,
        long: location.longitude,
        description: description.trim(),
        is_anonymous: isAnonymous,
      });

      Alert.alert(
        'Reporte enviado',
        isAnonymous
          ? 'Tu reporte anónimo fue enviado. Se marcará como no verificado.'
          : 'Tu reporte verificado fue enviado exitosamente.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      const message =
        err.response?.data?.error || 'No se pudo enviar el reporte. Intenta de nuevo.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nuevo Reporte</Text>
          <Text style={styles.headerSubtitle}>
            Reportando como: {user ? user.name : 'Anónimo'}
          </Text>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          {locationLoading ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color="#1a73e8" />
              <Text style={styles.locationLoadingText}>
                Obteniendo ubicación GPS...
              </Text>
            </View>
          ) : location ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                Lat: {location.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                Lon: {location.longitude.toFixed(6)}
              </Text>
            </View>
          ) : (
            <Text style={styles.locationError}>
              No se pudo obtener la ubicación.
            </Text>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción del incidente</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe lo que observaste..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            maxLength={500}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
            testID="description-input"
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Anonymous Notice */}
        {!user && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Este reporte se enviará como anónimo y será marcado como no
              verificado.
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          testID="submit-button"
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Reporte</Text>
          )}
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 56,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationLoadingText: {
    color: '#888',
    fontSize: 14,
  },
  locationInfo: {
    gap: 4,
  },
  locationText: {
    fontSize: 15,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  locationError: {
    color: '#e53935',
    fontSize: 14,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  charCount: {
    textAlign: 'right',
    color: '#aaa',
    fontSize: 12,
    marginTop: 6,
  },
  notice: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  noticeText: {
    color: '#e65100',
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#e53935',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 15,
  },
});
