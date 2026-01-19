# FindMyWorker Frontend

Aplicación web frontend para FindMyWorker - una plataforma de conexión entre clientes y trabajadores de servicios.

## 🚀 Características

- **Sistema de autenticación** con JWT
- **Chat en tiempo real** mediante WebSocket
- **Búsqueda de trabajadores** con filtros avanzados
- **Gestión de órdenes** con seguimiento de estado
- **Mapa interactivo** para visualización de trabajadores cercanos
- **Internacionalización** (Español/Inglés)
- **Perfiles de usuario** para clientes y trabajadores
- **Sistema de calificaciones** y reviews

## 🛠️ Tecnologías

- **React 19** - Framework de UI
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **WebSocket** - Chat en tiempo real
- **Leaflet** - Mapas interactivos
- **i18next** - Internacionalización
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos

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
   VITE_API_URL=http://127.0.0.1:8000/api
   VITE_WS_URL=ws://localhost:8000
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## 📦 Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta el linter (ESLint)

## 📁 Estructura del proyecto

```
src/
├── api/              # Servicios de API (axios, orders, workers)
├── assets/           # Recursos estáticos (imágenes, iconos)
├── components/       # Componentes React reutilizables
│   ├── chat/        # Componentes del sistema de chat
│   ├── common/      # Componentes comunes
│   ├── dashboard/   # Componentes del dashboard
│   ├── modals/      # Modales
│   └── orders/      # Componentes de órdenes
├── config/          # Archivos de configuración
├── context/         # Context API (Auth, Chat)
├── hooks/           # Custom React hooks
├── i18n/            # Configuración de internacionalización
│   └── locales/    # Archivos de traducción
├── pages/           # Páginas principales
│   ├── admin/      # Páginas de administrador
│   └── worker/     # Páginas de trabajador
└── utils/           # Utilidades y helpers
```

## 🔑 Características principales

### Autenticación
- Login/registro de usuarios
- Gestión de tokens JWT
- Rutas protegidas por rol (Admin, Cliente, Trabajador)

### Chat en tiempo real
- Conexión WebSocket persistente
- Reconexión automática
- Estado de conexión visible
- Notificaciones en tiempo real

### Sistema de órdenes
- Creación de órdenes de servicio
- Seguimiento de estado
- Sistema de pago en garantía
- Registro de horas trabajadas
- Aprobación de horas

### Búsqueda de trabajadores
- Filtros por precio, rating, categoría
- Búsqueda por ubicación y radio
- Visualización en mapa
- Perfiles detallados

## 🌍 Internacionalización

La aplicación soporta múltiples idiomas (actualmente ES y EN). Los archivos de traducción se encuentran en:
- `src/i18n/locales/es.json` - Español
- `src/i18n/locales/en.json` - Inglés

## 🔐 Seguridad

- Tokens JWT para autenticación
- Validación de permisos por rol
- Protección de rutas sensibles
- Sanitización de inputs
- Timeout en requests HTTP

## 🐛 Depuración

Para depuración en desarrollo:
1. Abre las DevTools del navegador (F12)
2. La consola mostrará logs detallados
3. Los errores de red se pueden ver en la pestaña Network

## 📱 Responsive Design

La aplicación es completamente responsive y funciona en:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Autor

- Anuarth Rincón
