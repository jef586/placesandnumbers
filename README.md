# 🗺️ Buscador de Lugares

Una aplicación web moderna para buscar lugares y negocios en Argentina usando Google Maps API.

## 🚀 Características

- 🔍 Búsqueda de lugares por ciudad y tipo de negocio
- 🗺️ Mapa interactivo con marcadores personalizados
- 📱 Diseño responsive y moderno
- ⚡ Interfaz rápida y fluida
- 🎨 UI/UX optimizada con Vuetify

## 🛠️ Configuración

### 1. Instalación

```bash
npm install
```

### 2. Configuración de Google Maps API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Places API
4. Crea credenciales (API Key)
5. Configura las restricciones de la API key para mayor seguridad

### 3. Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita el archivo `.env` y reemplaza `tu_api_key_aqui` con tu API key real:
```
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_real_aqui
```

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

## 🏃‍♂️ Desarrollo

```bash
npm run dev
```

## 🏗️ Construcción

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes Vue
│   ├── Maps.vue        # Componente del mapa
│   ├── Search.vue      # Formulario de búsqueda
│   └── Results.vue     # Tabla de resultados
├── composables/        # Lógica reutilizable
├── store/             # Estado global (Pinia)
└── views/             # Vistas principales
```

## 🔒 Seguridad

- Las API keys están protegidas mediante variables de entorno
- El archivo `.env` está excluido del control de versiones
- Se recomienda configurar restricciones en Google Cloud Console

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
