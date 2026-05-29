# FindMyWorker Frontend

Aplicación web moderna para FindMyWorker - plataforma de conexión inteligente entre clientes y trabajadores de servicios con búsqueda semántica impulsada por IA.

## ✨ Características Principales

### 🤖 Búsqueda Inteligente con IA
- **Motor de búsqueda semántica** usando TF-IDF
- Consultas en **lenguaje natural** (ej: "necesito un plomero urgente para reparar fuga")
- Sistema híbrido: **50% similitud semántica + 30% rating + 20% proximidad**
- Estrategia automática (TF-IDF solo o híbrida con geolocalización)
- Ubicación **opcional** - funciona con o sin GPS
- Traducción automática de profesiones (español/inglés)
- Keywords coincidentes destacados en resultados

### 💬 Chat en Tiempo Real
- Conexión WebSocket persistente con reconexión automática
- Estado de conexión visible (online/offline)
- Sistema de salas por orden
- Notificaciones en tiempo real
- Indicador de estado activo solo en órdenes válidas

### 📦 Gestión de Órdenes
- Creación y seguimiento de órdenes de servicio
- Estados: Pendiente → Aceptada → En Progreso → Completada
- Sistema de **pago en garantía** (escrow)
- Registro y aprobación de horas trabajadas
- Resumen de precios con desglose transparente

### ⭐ Sistema de Reviews
- Calificación por estrellas (1-5)
- Reviews con comentarios detallados
- Estadísticas de rating promedio
- Historial completo de valoraciones

### 🗺️ Mapas Interactivos
- Visualización de trabajadores en mapa (Leaflet)
- Selector de ubicación con GPS o click en mapa
- Radio de búsqueda ajustable (5-100 km)
- Marcadores personalizados por profesión

### 🔐 Autenticación & Roles
- Sistema JWT con tokens de acceso/refresco
- Roles: Admin, Cliente, Trabajador
- Rutas protegidas por permisos
- Timeout inteligente (30s) para backends lentos

### 🌍 Internacionalización
- Soporte multi-idioma (Español/Inglés)
- Detección automática de idioma
- 70+ claves de traducción
- Cambio de idioma en tiempo real

## 🛠️ Stack Tecnológico

### Core
- **React 19.2.0** - Framework de UI moderno
- **Vite 7.2.4** - Build tool ultrarrápido
- **React Router 7.9.6** - Enrutamiento con rutas protegidas
- **Axios 1.13.2** - Cliente HTTP con interceptores

### UI/UX
- **Tailwind CSS 4.1.17** - Estilos utility-first
- **Lucide React** - Iconos SVG optimizados
- **Leaflet 1.9.4 + React Leaflet 5.0.0** - Mapas interactivos
- **React i18next 16.4.0** - Internacionalización

### Estado & Comunicación
- **Context API** - Estado global (Auth, Chat)
- **WebSocket** - Comunicación en tiempo real
- **Custom Hooks** - Lógica reutilizable

## 📋 Requisitos previos

- Node.js >= 18.0.0
- npm o yarn
- Backend de FindMyWorker corriendo

## ⚙️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd FindMyWorkerFrontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus configuraciones:
   ```env
   # Host puro del backend (sin /api ni slash final).
   # El frontend deriva la URL REST (`${base}/api/`) y la URL del WebSocket
   # (`ws(s)://host`) automáticamente.
   VITE_API_BASE_URL=http://localhost:8000

   # Opcional — sólo si el WS vive en otro host/proxy.
   # VITE_WS_URL=ws://localhost:8000
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## 📦 Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo (localhost:5173)
npm run build     # Build para producción
npm run preview   # Preview de build de producción
npm run lint      # Linter (ESLint)
```

## 📁 Estructura del Proyecto

```
src/
├── api/                          # Servicios de API
│   ├── axios.js                 # Instancia configurada de Axios
│   ├── orders.js                # API de órdenes
│   ├── reviews.js               # API de reviews
│   ├── workers.js               # API de trabajadores
│   └── recommendations.js       # API de búsqueda con IA
├── components/
│   ├── chat/                    # Sistema de chat WebSocket
│   │   ├── ChatRoom.jsx
│   │   ├── MessageList.jsx
│   │   ├── FloatingChat.jsx
│   │   └── ConnectionStatus.jsx
│   ├── common/
│   │   └── LanguageSwitcher.jsx # Selector de idioma
│   ├── dashboard/
│   │   ├── ClientHome.jsx
│   │   ├── WorkerHome.jsx
│   │   ├── WorkerCard.jsx
│   │   └── WorkerMap.jsx
│   ├── recommendations/         # Búsqueda semántica IA
│   │   ├── SearchBar.jsx       # Barra con mapa + filtros
│   │   ├── WorkerRecommendationCard.jsx
│   │   └── WorkerRecommendationList.jsx
│   ├── modals/
│   │   ├── HiringModal.jsx
│   │   ├── ReviewModal.jsx
│   │   └── ConfirmModal.jsx
│   ├── orders/
│   │   ├── RegisterHoursModal.jsx
│   │   ├── ApproveHoursTable.jsx
│   │   └── PriceSummaryCard.jsx
│   └── reviews/
│       ├── ReviewCard.jsx
│       ├── StarRating.jsx
│       └── ReviewSummary.jsx
├── config/
│   └── constants.js             # Configuración centralizada
├── context/
│   ├── AuthContext.jsx          # Estado de autenticación
│   └── ChatContext.jsx          # Estado de chat WebSocket
├── hooks/
│   ├── useRecommendationSearch.js  # Hook de búsqueda IA
│   ├── useWebSocketChat.js
│   ├── useWorkerReviews.js
│   └── useWorkHours.js
├── i18n/
│   ├── index.js
│   └── locales/
│       ├── es.json              # Español (70+ claves)
│       └── en.json              # Inglés
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── OrderDetail.jsx
│   ├── SearchWorkers.jsx        # Página de búsqueda IA
│   ├── admin/
│   │   └── AdminDashboard.jsx
│   └── worker/
│       └── EditProfile.jsx
└── utils/
    ├── dateFormatters.js
    ├── mapIcons.js
    ├── reviewHelpers.js
    └── websocket.js
```

## 🔑 Funcionalidades Detalladas

### 🔍 Búsqueda Semántica con IA

**Endpoint:** `POST /api/users/workers/recommend/`

**Características:**
- Motor TF-IDF (Term Frequency-Inverse Document Frequency)
- Búsqueda en lenguaje natural sin necesidad de palabras clave exactas
- Ubicación **opcional**: funciona con o sin GPS
- Keywords coincidentes mostrados en cada tarjeta
- Sin porcentajes ni badges técnicos - UX limpia y natural

**Estrategias:**
- `tfidf`: Solo similitud semántica + rating (sin ubicación)
- `hybrid`: 50% TF-IDF + 30% rating + 20% proximidad (con ubicación)

**Ejemplo de uso:**
```javascript
// Búsqueda sin ubicación (solo similitud)
{
  "query": "electricista para instalar lámparas",
  "language": "es",
  "top_n": 10
}

// Búsqueda con ubicación (híbrida)
{
  "query": "plomero urgente",
  "language": "es",
  "latitude": 11.2403,
  "longitude": -74.2110,
  "max_distance_km": 20,
  "top_n": 5
}
```

**Estado del backend:**
- 🟢 Modelo entrenado → Banner azul + búsqueda habilitada
- 🟡 Modelo entrenando → Banner ámbar + polling cada 30s
- 🟠 Backend no disponible → Banner naranja + polling detenido

### 💬 Sistema de Chat

**Tecnología:** WebSocket con reconexión automática

**Estados:**
- 🟢 Conectado (verde)
- 🟡 Conectando (amarillo)
- 🔴 Desconectado (rojo)

**Funcionalidades:**
- Salas privadas por orden
- Mensajes en tiempo real
- Persistencia de mensajes
- Auto-scroll a último mensaje
- Solo activo en órdenes válidas (ACCEPTED, IN_ESCROW)

### 📦 Gestión de Órdenes

**Flujo de estados:**
```
PENDING → ACCEPTED → IN_ESCROW → COMPLETED
       ↘ CANCELLED  (desde PENDING o ACCEPTED, cliente o trabajador)
```

**Features:**
- Registro de horas trabajadas por día
- Aprobación de horas por el cliente
- Cálculo automático de precio total
- Sistema de pago en garantía
- Resumen detallado con desglose

### ⭐ Sistema de Reviews

**Validación:**
- Solo clientes pueden dejar reviews
- Una review por orden completada
- Calificación 1-5 estrellas requerida
- Comentario opcional

**Visualización:**
- Rating promedio en perfil del trabajador
- Lista completa de reviews
- Estadísticas de distribución
- Orden cronológico (más recientes primero)

## 🌍 Configuración i18n

**Idiomas soportados:**
- 🇪🇸 Español (es)
- 🇬🇧 Inglés (en)

**Características:**
- Detección automática del navegador
- Cambio en tiempo real sin recargar
- 70+ claves de traducción
- Profesiones traducidas automáticamente
- Parámetro `language` enviado al backend

**Agregar nuevas traducciones:**
```json
// src/i18n/locales/es.json
{
  "common": {
    "newKey": "Nuevo texto"
  }
}

// Usar en componente
const { t } = useTranslation();
<p>{t('common.newKey')}</p>
```

## 🔐 Seguridad & Performance

### Autenticación
- Tokens JWT (access + refresh)
- Interceptores de Axios para tokens automáticos
- Logout automático en 401
- Timeout de 30s para backends lentos
- Validación de token expirado antes de requests

### Protección de Rutas
```javascript
// Solo clientes
<Route path="/search-workers" element={
  <ProtectedRoute allowedRoles={['CLIENT']}>
    <SearchWorkers />
  </ProtectedRoute>
} />

// Solo trabajadores
<Route path="/worker/edit-profile" element={
  <ProtectedRoute allowedRoles={['WORKER']}>
    <EditProfile />
  </ProtectedRoute>
} />
```

### Performance
- Code splitting por ruta
- Lazy loading de componentes pesados
- Debounce en búsquedas (300ms)
- Caché de imágenes del navegador
- Polling inteligente (se detiene en errores)

### Best Practices
- Clean Code sin comentarios obvios
- JSDoc solo en funciones públicas
- Variables auto-explicativas
- Validación client-side + server-side
- Manejo de errores con mensajes claros

## 🎨 Diseño & UX

### Sistema de Colores
```css
--primary: #C04A3E      /* Coral */
--secondary: #E37B5B    /* Naranja claro */
--neutral-dark: #4A3B32 /* Marrón oscuro */
--neutral-light: #EFE6DD /* Beige */
```

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

### Componentes Reutilizables
- `LanguageSwitcher` - Selector de idioma con banderas
- `ProtectedRoute` - HOC para rutas protegidas
- `LocationPicker` - Mapa + GPS + selector manual
- `StarRating` - Rating de 1-5 estrellas
- `ConnectionStatus` - Indicador de estado WebSocket

## 🐛 Debugging & Logs

### Logs del Navegador
```javascript
// Autenticación
"Token expirado, cerrando sesión..."
"Error de autenticación: AxiosError"

// Chat WebSocket
"WebSocket conectado"
"WebSocket desconectado, intentando reconectar..."

// Búsqueda IA
"Error en búsqueda de recomendaciones: AxiosError"
"Error al verificar salud del modelo: AxiosError"
```

### DevTools Tips
1. **Network Tab**: Ver requests/responses del backend
2. **Console**: Logs detallados de errores
3. **React DevTools**: Inspeccionar estado de contextos
4. **Sources**: Breakpoints en código

##  API Backend Requerida

### Endpoints Esenciales

**Autenticación:**
- `POST /auth/login/` - Login con email/password
- `POST /auth/register/` - Registro de usuario
- `GET /users/me/` - Datos del usuario actual

**Búsqueda IA:**
- `POST /users/workers/recommend/` - Búsqueda semántica
- `GET /users/workers/recommendation-health/` - Estado del modelo

**Órdenes:**
- `GET /orders/` - Listar órdenes
- `POST /orders/` - Crear orden
- `GET /orders/{id}/` - Detalle de orden
- `PATCH /orders/{id}/` - Actualizar estado

**Chat:**
- WebSocket `/ws/chat/{order_id}/` - Conexión de chat

**Reviews:**
- `GET /orders/reviews/` - Listar reviews
- `POST /orders/reviews/` - Crear review

## 🤝 Contribución

### Workflow
1. Fork del proyecto
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

### Convenciones de Código
- **Nombres**: camelCase para variables, PascalCase para componentes
- **Imports**: ordenar por terceros → locales → estilos
- **Comentarios**: solo JSDoc en funciones públicas
- **Traducciones**: todas las cadenas en i18n, nada hardcodeado

### Commits Semánticos
```
feat: nueva funcionalidad
fix: corrección de bug
refactor: refactorización sin cambio funcional
docs: cambios en documentación
style: cambios de formato (no código)
test: agregar o modificar tests
chore: tareas de mantenimiento
```

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Autor

- Anuarth Rincón
