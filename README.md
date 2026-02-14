# Incident Reporter Colombia

Plataforma web para registrar y visualizar incidentes de seguridad y orden público en Colombia. Los usuarios pueden reportar incidentes de forma anónima o autenticada, y visualizarlos en un mapa interactivo con filtros temporales.

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Inicio Rápido](#inicio-rápido)
- [Instalación](#instalación)
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

- **Reporte de incidentes** con ubicación geográfica (latitud/longitud) y descripción.
- **Reporte anónimo**: los usuarios pueden reportar sin autenticarse. Los reportes anónimos se marcan como "no verificados".
- **Autenticación con Google** (simulada para entorno de desarrollo) con generación de tokens JWT.
- **Dashboard web interactivo** con mapa de incidentes usando Leaflet.js y OpenStreetMap.
- **Filtrado temporal**: últimas 24 horas, última semana, último mes o último año.
- **API REST** para integración con otros clientes o servicios.
- **Base de datos SQLite** para persistencia ligera sin necesidad de servidor de base de datos externo.

## Tecnologías

| Componente | Tecnología |
|:-----------|:-----------|
| Runtime | Node.js |
| Framework web | Express 5.x |
| Base de datos | SQLite3 |
| Autenticación | JWT (JSON Web Tokens) |
| Mapas (frontend) | Leaflet.js 1.9.4 |
| Tiles de mapa | OpenStreetMap |
| Frontend dashboard | HTML5, CSS3, JavaScript vanilla |
| Verificación | Playwright (Python) |

## Inicio Rápido

```bash
cd backend
npm install
node server.js
```

Abre `http://localhost:3000` en tu navegador para ver el dashboard con el mapa.

## Instalación

### Prerrequisitos

- Node.js (v18 o superior recomendado)
- npm

### Pasos

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

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|:---------|:------------|:------------------|
| `PORT` | Puerto en el que corre el servidor | `3000` |

> **Nota:** La clave JWT (`SECRET_KEY`) está hardcodeada en `server.js` como `'super_secret_key_for_demo'`. Ver la sección [Advertencias de Seguridad](#advertencias-de-seguridad).

## Documentación de la API

Base URL: `http://localhost:3000/api`

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
├── backend/
│   ├── package.json          # Dependencias y scripts
│   ├── server.js             # Punto de entrada del servidor y rutas de la API
│   ├── database.js           # Configuración de SQLite e inicialización de tablas
│   ├── init_db.js            # Script para verificar inicialización de la BD
│   ├── incidents.db          # Archivo de base de datos SQLite (generado)
│   └── public/               # Dashboard web (archivos estáticos)
│       ├── index.html        # Página principal del dashboard
│       └── dashboard.js      # Lógica del mapa y carga de incidentes
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

## Verificación

El proyecto incluye un script de verificación automatizado usando Playwright:

```bash
cd verification
python verify_dashboard.py
```

Este script verifica que el dashboard cargue correctamente, incluyendo el encabezado y el contenedor del mapa.

> **Nota:** Requiere Python y Playwright instalados (`pip install playwright && playwright install`).

## Advertencias de Seguridad

Este proyecto es una **demostración** y **no está listo para producción**. Considera lo siguiente antes de desplegar:

- **JWT Secret hardcodeado**: La clave `SECRET_KEY` está en texto plano en `server.js`. En producción debe ser una variable de entorno con un valor aleatorio seguro.
- **OAuth simulado**: La autenticación con Google no verifica tokens reales. En producción debe integrarse con la API de verificación de Google.
- **CORS abierto**: El servidor acepta peticiones de cualquier origen (`*`). Restringir a dominios confiables en producción.
- **Sin rate limiting**: No hay protección contra abuso de la API. Considerar implementar limitación de tasa.
- **SQLite**: Adecuado para desarrollo y bajo tráfico. Para producción con concurrencia alta, considerar PostgreSQL o similar.

## Contribución

1. Haz fork del repositorio.
2. Crea una rama para tu feature: `git checkout -b feature/mi-feature`.
3. Realiza tus cambios y haz commit: `git commit -m "Agrega mi feature"`.
4. Envía un pull request.

## Licencia

Este proyecto está disponible bajo la licencia ISC.
