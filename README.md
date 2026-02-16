# Incident Reporter Colombia

Plataforma para registrar y visualizar incidentes de seguridad y orden público en Colombia. Integra un **backend API REST**, un **dashboard web** interactivo y una **aplicación móvil** para que los usuarios puedan reportar incidentes de forma anónima o autenticada, visualizarlos en un mapa y consultar incidentes recientes.

## Estado del Proyecto

| Componente | Estado | Descripción |
|:-----------|:------:|:------------|
| Backend API | Implementado | API REST con Node.js/Express, autenticación JWT y base de datos SQLite |
| Dashboard Web | Implementado | Mapa interactivo con Leaflet.js, filtros temporales y visualización de incidentes |
| Aplicación Móvil | Implementado | App React Native con Expo, mapa interactivo, reporte con GPS y autenticación |

## Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Inicio Rápido](#inicio-rápido)
- [Instalación](#instalación)
  - [Backend](#1-configuración-del-backend)
  - [Aplicación Móvil](#2-configuración-de-la-aplicación-móvil)
- [Variables de Entorno](#variables-de-entorno)
- [Documentación de la API](#documentación-de-la-api)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Esquema de Base de Datos](#esquema-de-base-de-datos)
- [Verificación](#verificación)
- [Advertencias de Seguridad](#advertencias-de-seguridad)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Características

### Backend y Dashboard Web (Implementado)

- **Reporte de incidentes** con ubicación geográfica (latitud/longitud) y descripción.
- **Reporte anónimo**: los usuarios pueden reportar sin autenticarse. Los reportes anónimos se marcan como "no verificados".
- **Autenticación con Google** (simulada para entorno de desarrollo) con generación de tokens JWT.
- **Dashboard web interactivo** con mapa de incidentes usando Leaflet.js y OpenStreetMap.
- **Filtrado temporal**: últimas 24 horas, última semana, último mes o último año.
- **API REST** para integración con clientes web y móviles.
- **Base de datos SQLite** para persistencia ligera sin necesidad de servidor de base de datos externo.

### Aplicación Móvil (Implementado)

- **Reporte desde el dispositivo**: envío de incidentes directamente desde el celular con captura automática de ubicación GPS vía `expo-location`.
- **Inicio de sesión con Google**: autenticación integrada con Google Sign-In (simulada para demo) y persistencia de sesión con AsyncStorage.
- **Mapa interactivo móvil**: visualización de incidentes con marcadores coloreados por estado de verificación usando `react-native-maps`.
- **Filtros temporales**: 24 horas, 7 días, 1 mes, 1 año.
- **Navegación nativa**: flujo Auth → Map → Report con React Navigation.

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   App Móvil     │     │  Dashboard Web  │     │   Otros         │
│  (React Native  │     │  (Leaflet.js)   │     │   Clientes      │
│   o Nativa)     │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │         HTTP/REST     │                       │
         └───────────┬───────────┘───────────────────────┘
                     │
              ┌──────┴──────┐
              │  Backend    │
              │  Express.js │
              │  + JWT Auth │
              └──────┬──────┘
                     │
              ┌──────┴──────┐
              │   SQLite    │
              │  Database   │
              └─────────────┘
```

## Tecnologías

### Backend y Dashboard Web (Implementado)

| Componente | Tecnología |
|:-----------|:-----------|
| Runtime | Node.js |
| Framework web | Express 5.x |
| Base de datos | SQLite3 |
| Autenticación | JWT (JSON Web Tokens) |
| Mapas (dashboard) | Leaflet.js 1.9.4 |
| Tiles de mapa | OpenStreetMap |
| Frontend dashboard | HTML5, CSS3, JavaScript vanilla |
| Verificación | Playwright (Python) |

### Aplicación Móvil (Implementado)

| Componente | Tecnología |
|:-----------|:-----------|
| Framework | React Native 0.76 con Expo SDK 52 |
| Mapas | React Native Maps 1.20 |
| Geolocalización | Expo Location |
| Cliente HTTP | Axios |
| Navegación | React Navigation (Native Stack) |
| Almacenamiento local | AsyncStorage |
| Pruebas | Jest + React Testing Library Native |

## Inicio Rápido

### Con Docker (recomendado para despliegue)

```bash
docker compose up -d
```

El backend y dashboard estarán en `http://localhost:3000`. Los datos se persisten en un volumen Docker.

### Sin Docker (desarrollo local)

```bash
cd backend
npm install
node server.js
```

Abre `http://localhost:3000` en tu navegador para ver el dashboard con el mapa.

### Aplicación Móvil

```bash
cd mobile
npm install
npx expo start
```

Presiona `a` para abrir en el emulador Android o escanea el QR con Expo Go.

## Instalación

### Prerrequisitos

**Para despliegue con Docker:**
- Docker Engine 20+ y Docker Compose v2

**Para desarrollo local del Backend:**
- Node.js (v18 o superior recomendado)
- npm

**Para la Aplicación Móvil (React Native):**
- Node.js (v18 o superior)
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio con emulador o dispositivo físico Android
- (Opcional) Xcode para iOS (solo macOS)

### 1. Configuración del Backend

1. Clona el repositorio:
    ```bash
    git clone <url-del-repositorio>
    cd reporte-incidentes
    ```

2. Instala las dependencias del backend:
    ```bash
    cd backend
    npm install
    ```

3. (Opcional) Verifica que la base de datos se inicialice correctamente:
    ```bash
    node init_db.js
    ```
    > La base de datos se inicializa automáticamente al importar `database.js`, por lo que este paso es opcional.

4. Inicia el servidor:
    ```bash
    node server.js
    ```
    El servidor estará disponible en `http://localhost:3000`.

5. Accede al dashboard web en `http://localhost:3000/index.html`.

### 2. Configuración de la Aplicación Móvil

1. Navega al directorio de la app móvil:
    ```bash
    cd mobile
    ```

2. Instala las dependencias:
    ```bash
    npm install
    ```

3. Configura la URL de la API:
    - Abre `src/services/api.js`.
    - Cambia `API_URL` a la dirección IP de tu máquina:
      - **Emulador Android:** `http://10.0.2.2:3000/api`
      - **Dispositivo físico:** `http://<IP-DE-TU-MÁQUINA>:3000/api` (ej. `http://192.168.1.5:3000/api`)

4. Ejecuta la aplicación:
    ```bash
    npx expo start
    ```
    - Presiona `a` para Android (requiere emulador o dispositivo conectado).
    - Presiona `i` para iOS (requiere simulador en macOS).
    - Presiona `w` para Web.

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|:---------|:------------|:------------------|
| `PORT` | Puerto en el que corre el servidor | `3000` |

> **Nota:** La clave JWT (`SECRET_KEY`) está hardcodeada en `server.js` como `'super_secret_key_for_demo'`. Ver la sección [Advertencias de Seguridad](#advertencias-de-seguridad).

## Documentación de la API

Base URL: `http://localhost:3000/api`

La API sirve tanto al dashboard web como a la aplicación móvil.

### Endpoints

| Método | Endpoint | Descripción |
|:-------|:---------|:------------|
| `POST` | `/api/auth/google` | Autenticación con Google (simulada) |
| `POST` | `/api/incidents` | Reportar un nuevo incidente |
| `GET`  | `/api/incidents` | Obtener incidentes con filtro temporal |

### POST `/api/auth/google`

Autentica un usuario y devuelve un token JWT con expiración de 1 hora.

**Request body:**
```json
{
  "token": "google-oauth-token",
  "userInfo": {
    "id": "google-user-id",
    "name": "Nombre del Usuario",
    "email": "usuario@example.com"
  }
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "name": "Nombre del Usuario", "email": "usuario@example.com" }
}
```

**Errores:**
- `400` — Token no proporcionado.
- `500` — Error interno del servidor.

### POST `/api/incidents`

Crea un nuevo reporte de incidente. Si se incluye un header `Authorization` con un JWT válido, el incidente se marca como verificado.

**Headers (opcional):**
```
Authorization: Bearer <jwt-token>
```

**Request body:**
```json
{
  "lat": 4.6097,
  "long": -74.0817,
  "description": "Robo a mano armada en la esquina",
  "is_anonymous": true
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Incident reported successfully",
  "id": 1
}
```

**Errores:**
- `400` — Campos requeridos faltantes (`lat`, `long`, `description`).
- `401` — No autenticado y `is_anonymous` no es `true`.
- `500` — Error interno del servidor.

### GET `/api/incidents`

Obtiene incidentes filtrados por tiempo. Si no se proporciona ningún filtro, devuelve los incidentes del último mes por defecto.

**Query params (uno a la vez):**

| Parámetro | Tipo | Ejemplo | Descripción |
|:----------|:-----|:--------|:------------|
| `hours` | number | `?hours=24` | Incidentes de las últimas N horas |
| `days` | number | `?days=7` | Incidentes de los últimos N días |
| `weeks` | number | `?weeks=2` | Incidentes de las últimas N semanas |
| `months` | number | `?months=1` | Incidentes de los últimos N meses |

**Respuesta exitosa (200):**
```json
{
  "incidents": [
    {
      "id": 1,
      "user_id": null,
      "lat": 4.6097,
      "long": -74.0817,
      "description": "Robo a mano armada en la esquina",
      "timestamp": "2025-01-15 14:30:00",
      "verified": 0,
      "is_anonymous": 1
    }
  ]
}
```

## Ejemplos de Uso

### Reportar un incidente anónimo

```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 4.6097,
    "long": -74.0817,
    "description": "Robo en transporte público",
    "is_anonymous": true
  }'
```

### Autenticarse y reportar como usuario verificado

```bash
# 1. Obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "mock-google-token",
    "userInfo": { "id": "user123", "name": "Juan Pérez", "email": "juan@example.com" }
  }' | jq -r '.token')

# 2. Reportar incidente autenticado
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "lat": 6.2442,
    "long": -75.5812,
    "description": "Vandalismo en parque público",
    "is_anonymous": false
  }'
```

### Consultar incidentes de las últimas 24 horas

```bash
curl http://localhost:3000/api/incidents?hours=24
```

## Estructura del Proyecto

```
reporte-incidentes/
├── README.md
├── docker-compose.yml        # Orquestación Docker del backend
├── backend/
│   ├── package.json          # Dependencias y scripts del backend
│   ├── server.js             # Punto de entrada del servidor y rutas de la API
│   ├── database.js           # Configuración de SQLite e inicialización de tablas
│   ├── init_db.js            # Script para verificar inicialización de la BD
│   ├── Dockerfile            # Imagen Docker para despliegue
│   ├── .dockerignore         # Archivos excluidos del build Docker
│   ├── incidents.db          # Archivo de base de datos SQLite (generado)
│   └── public/               # Dashboard web (archivos estáticos)
│       ├── index.html        # Página principal del dashboard
│       └── dashboard.js      # Lógica del mapa y carga de incidentes
├── mobile/                   # Aplicación móvil React Native
│   ├── App.js                # Punto de entrada y navegación
│   ├── app.json              # Configuración de Expo
│   ├── package.json          # Dependencias de la app móvil
│   ├── jest.setup.js         # Configuración de mocks para tests
│   ├── src/
│   │   ├── screens/          # Pantallas de la app
│   │   │   ├── AuthScreen.js   # Login Google / anónimo
│   │   │   ├── MapScreen.js    # Mapa con incidentes y filtros
│   │   │   └── ReportScreen.js # Formulario de reporte con GPS
│   │   └── services/         # Capa de servicios
│   │       └── api.js          # Cliente HTTP y funciones de API
│   └── __tests__/            # Pruebas (24 tests)
│       ├── api.test.js
│       ├── AuthScreen.test.js
│       ├── MapScreen.test.js
│       └── ReportScreen.test.js
└── verification/
    └── verify_dashboard.py   # Script de verificación con Playwright
```

## Esquema de Base de Datos

### Tabla `users`

| Columna | Tipo | Restricciones |
|:--------|:-----|:--------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `google_id` | TEXT | UNIQUE |
| `email` | TEXT | — |
| `name` | TEXT | — |

### Tabla `incidents`

| Columna | Tipo | Restricciones / Default |
|:--------|:-----|:------------------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `user_id` | INTEGER | FOREIGN KEY → `users(id)`, nullable |
| `lat` | REAL | — |
| `long` | REAL | — |
| `description` | TEXT | — |
| `timestamp` | DATETIME | DEFAULT `CURRENT_TIMESTAMP` |
| `verified` | INTEGER | DEFAULT `0` |
| `is_anonymous` | INTEGER | DEFAULT `0` |

## Pruebas

### Backend

```bash
cd backend
npm test
```

> **Nota:** Las pruebas automatizadas del backend están pendientes de implementación. Actualmente se usa un script de verificación con Playwright (ver sección siguiente).

### Aplicación Móvil (24 tests)

```bash
cd mobile
npm test
```

Incluye tests para:
- **api.test.js** — Login, reporte de incidentes, consulta, logout, almacenamiento de sesión.
- **AuthScreen.test.js** — Renderizado, auto-redirect, navegación anónima, flujo de login.
- **MapScreen.test.js** — Mapa, filtros, conteo de incidentes, navegación, logout.
- **ReportScreen.test.js** — Formulario, GPS, envío autenticado/anónimo, cancelación, contador de caracteres.

## Verificación

El proyecto incluye un script de verificación automatizado del dashboard web usando Playwright:

```bash
cd verification
python verify_dashboard.py
```

Este script verifica que el dashboard cargue correctamente, incluyendo el encabezado y el contenedor del mapa.

> **Nota:** Requiere Python y Playwright instalados (`pip install playwright && playwright install`).

## Despliegue con Docker

### Construcción y ejecución

```bash
# Construir y levantar el servicio
docker compose up -d

# Ver logs
docker compose logs -f backend

# Detener
docker compose down
```

### Variables de entorno

| Variable | Descripción | Valor por defecto |
|:---------|:------------|:------------------|
| `PORT` | Puerto externo expuesto | `3000` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `super_secret_key_change_me` |
| `DATABASE_PATH` | Ruta de la BD SQLite dentro del contenedor | `/data/incidents.db` |

Para personalizar las variables, crea un archivo `.env` en la raíz del proyecto:

```env
JWT_SECRET=tu_clave_secreta_segura_aqui
PORT=8080
```

### Persistencia de datos

Los datos de SQLite se almacenan en un volumen Docker llamado `incident-data`. Esto garantiza que los datos sobrevivan reinicios del contenedor.

```bash
# Ver volúmenes
docker volume ls

# Backup de la base de datos
docker compose exec backend cp /data/incidents.db /data/backup.db
docker cp $(docker compose ps -q backend):/data/backup.db ./backup_incidents.db
```

### Imagen standalone (sin Compose)

```bash
# Construir
docker build -t incident-reporter-backend ./backend

# Ejecutar
docker run -d \
  --name incident-reporter \
  -p 3000:3000 \
  -e JWT_SECRET=mi_clave_secreta \
  -v incident-data:/data \
  incident-reporter-backend
```

## Advertencias de Seguridad

Este proyecto es una **demostración** y **no está listo para producción**. Considera lo siguiente antes de desplegar:

- **JWT Secret**: Configura `JWT_SECRET` como variable de entorno con un valor aleatorio seguro. No uses el valor por defecto en producción.
- **OAuth simulado**: La autenticación con Google no verifica tokens reales. En producción debe integrarse con la API de verificación de Google.
- **CORS abierto**: El servidor acepta peticiones de cualquier origen (`*`). Restringir a dominios confiables en producción.
- **Sin rate limiting**: No hay protección contra abuso de la API. Considerar implementar limitación de tasa.
- **SQLite**: Adecuado para desarrollo y bajo tráfico. Para producción con concurrencia alta, considerar PostgreSQL o similar.

## Contribución

1. Haz fork del repositorio.
2. Crea una rama para tu feature: `git checkout -b feature/mi-feature`.
3. Realiza tus cambios y haz commit: `git commit -m "Agrega mi feature"`.
4. Envía un pull request.

### Áreas donde se necesita contribución

- **Pruebas del backend**: Suite de tests con Jest + Supertest.
- **Autenticación real**: Integración con Google OAuth verificado (reemplazar mock actual).
- **Rate limiting**: Protección contra abuso de la API.
- **Modo offline móvil**: Almacenamiento local de reportes para sincronización posterior.
- **Notificaciones push**: Alertas de incidentes cercanos al usuario.

## Licencia

Este proyecto está disponible bajo la licencia ISC.
