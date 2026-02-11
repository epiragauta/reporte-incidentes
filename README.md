# Incident Reporter Colombia

Esta es una aplicación móvil completa con un backend para registrar incidentes de seguridad y orden público en Colombia. Permite a los usuarios reportar incidentes de forma anónima o autenticada a través de Google, visualizarlos en un mapa y consultar incidentes recientes.

## Características

*   **Autenticación de Usuarios:**
    *   Inicio de sesión con Google (simulado para entornos de desarrollo).
    *   Opción de reporte anónimo.
*   **Reporte de Incidentes:**
    *   Envío de incidentes con descripción y ubicación geográfica (latitud, longitud).
    *   Validación de datos: los reportes anónimos se marcan como "no verificados" por defecto.
    *   Almacenamiento seguro en base de datos SQLite.
*   **Visualización de Incidentes:**
    *   Mapa interactivo con marcadores de incidentes.
    *   Filtrado de incidentes por tiempo (últimas horas, días, semanas, meses).
*   **Backend API:**
    *   RESTful API construida con Node.js y Express.
    *   Base de datos SQLite para persistencia de datos.

## Tecnologías Utilizadas

### Backend
*   **Node.js**: Entorno de ejecución de JavaScript.
*   **Express**: Framework web para la API.
*   **SQLite3**: Base de datos ligera y autónoma.
*   **JWT (JSON Web Tokens)**: Manejo de sesiones y autenticación.
*   **Jest & Supertest**: Pruebas unitarias e integración de la API.

### Móvil
*   **React Native**: Framework para desarrollo de aplicaciones móviles nativas.
*   **Expo**: Plataforma y herramientas para React Native.
*   **React Native Maps**: Integración de mapas (Google Maps / Apple Maps).
*   **Expo Location**: Acceso a servicios de geolocalización.
*   **Axios**: Cliente HTTP para conectar con el backend.
*   **Jest & React Test Renderer**: Pruebas de componentes y lógica de UI.

## Instalación y Configuración

### Prerrequisitos
*   Node.js (v14 o superior)
*   npm o yarn
*   Expo CLI (`npm install -g expo-cli`)

### 1. Configuración del Backend

1.  Navega al directorio `backend`:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicializa la base de datos (se creará el archivo `incidents.db`):
    ```bash
    node init_db.js
    ```
4.  Inicia el servidor:
    ```bash
    node server.js
    ```
    El servidor correrá en `http://localhost:3000`.

### 2. Configuración de la Aplicación Móvil

1.  Navega al directorio `mobile`:
    ```bash
    cd mobile
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura la URL de la API:
    *   Abre `src/services/api.js`.
    *   Cambia `API_URL` a la dirección IP de tu máquina si estás probando en un dispositivo físico o emulador (ej. `http://192.168.1.5:3000/api`). Para el emulador de Android, usa `http://10.0.2.2:3000/api`.

4.  Ejecuta la aplicación:
    ```bash
    npx expo start
    ```
    *   Presiona `a` para Android (requiere emulador o dispositivo conectado).
    *   Presiona `i` para iOS (requiere simulador o dispositivo macOS).
    *   Presiona `w` para Web.

## Documentación de la API

| Método | Endpoint | Descripción | Parámetros (Body/Query) |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/google` | Autenticación con Google | `{ token, userInfo: { id, name, email } }` |
| **POST** | `/api/incidents` | Reportar nuevo incidente | `{ lat, long, description, is_anonymous }` (Headers: `Authorization` si no es anónimo) |
| **GET** | `/api/incidents` | Obtener incidentes | Query params: `hours`, `days`, `weeks`, `months` (ej. `?hours=24`) |

## Pruebas

El proyecto incluye suites de pruebas automatizadas para garantizar la calidad del código.

### Ejecutar Pruebas de Backend
```bash
cd backend
npm test
```

### Ejecutar Pruebas de Móvil
```bash
cd mobile
npm test
```

## Estructura del Proyecto

```
/
├── backend/
│   ├── incidents.db         # Base de datos SQLite
│   ├── server.js            # Punto de entrada del servidor
│   ├── database.js          # Configuración de base de datos
│   ├── init_db.js           # Script de inicialización
│   └── tests/               # Pruebas de API
└── mobile/
    ├── App.js               # Punto de entrada de la App
    ├── src/
    │   ├── screens/         # Pantallas (Auth, Map, Report)
    │   └── services/        # Lógica de conexión a API
    └── tests/               # Pruebas de componentes
```

## Licencia

Este proyecto es software libre y puede ser utilizado y modificado bajo los términos de la licencia MIT.
