import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { loginWithGoogle, getStoredUser } from '../services/api';

export default function AuthScreen({ navigation }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    getStoredUser().then((user) => {
      if (user) {
        navigation.replace('Map', { user });
      }
      setLoading(false);
    });
  }, [navigation]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // In a real app this would trigger Google Sign-In SDK.
      // For demo purposes we use mock user data.
      const mockUser = {
        id: 'google_' + Date.now(),
        name: 'Usuario Demo',
        email: 'demo@example.com',
      };
      const { user } = await loginWithGoogle(mockUser);
      navigation.replace('Map', { user });
    } catch (err) {
      Alert.alert(
        'Error de autenticación',
        'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = () => {
    navigation.replace('Map', { user: null });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🛡️</Text>
        <Text style={styles.title}>Incident Reporter</Text>
        <Text style={styles.subtitle}>Colombia</Text>
      </View>

      <Text style={styles.description}>
        Reporta incidentes de seguridad y orden público en tu zona. Ayuda a
        mantener informada a tu comunidad.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          testID="google-login-button"
        >
          <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.anonymousButton}
          onPress={handleAnonymous}
          testID="anonymous-button"
        >
          <Text style={styles.anonymousButtonText}>Continuar como anónimo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        Los reportes anónimos se marcan como no verificados. Inicia sesión para
        que tus reportes sean verificados automáticamente.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  anonymousButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  anonymousButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
