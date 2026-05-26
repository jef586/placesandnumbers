# PlaceAndNumbers - Contexto para Vibe Coding

## Descripción General

SPA de **prospección comercial inteligente** construida con **Vue 3 + Vite + Tailwind CSS** (migrando desde Vuetify). Permite buscar lugares/negocios en Argentina usando Google Maps API, visualizarlos en mapa interactivo, y gestionarlos como prospectos comerciales con estado y prioridad. Backend: Supabase (Auth + PostgreSQL + RLS).

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Vue 3 | ^3.2 | Composition API + `<script setup>` |
| Vite | ^4.2 | Bundler / dev server (puerto 3000) |
| Tailwind CSS | ^3.4 | CSS utility-first (dark mode: class) |
| Vuetify 3 | ^3.0 | **Legacy** - en migración |
| Pinia | ^2.0 | Estado global |
| Vue Router | ^4.0 | SPA routing (history mode) |
| Supabase | ^2.106 | Auth + PostgreSQL + RLS |
| Google Maps API | js-api-loader | Maps, Places API, Geocoding |
| vue3-google-map | ^0.19 | Componente Vue para Google Maps |
| @lucide/vue | ^1.16 | Iconos modernos (nueva UI) |
| @mdi/font | 7.0 | Iconos Material Design (legacy) |

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo (puerto 3000)
- `npm run build` - Build producción
- `npm run preview` - Preview del build
- `npm run lint` - ESLint fix

## Estructura del Proyecto

```
src/
├── main.js                      # Entry point (carga Google Maps antes de montar)
├── App.vue                      # Solo <router-view />
├── assets/
│   └── main.css                 # Tailwind base + utilidades + clases glass/badge/skeleton
├── components/
│   ├── SearchPremium.vue        # Buscador (Tailwind) - input ciudad + select tipo
│   ├── MapsPremium.vue          # Mapa Google Maps (Tailwind) - marcadores + infoWindows + controles
│   ├── ResultsPanel.vue         # Panel de resultados (Tailwind) - tarjetas con acciones
│   ├── Search.vue               # [LEGACY] Buscador Vuetify
│   ├── Maps.vue                 # [LEGACY] Mapa Vuetify
│   ├── Results.vue              # [LEGACY] Resultados Vuetify
│   └── HelloWorld.vue           # Placeholder vacío
├── composables/
│   ├── maps.js                  # getPlaceDetails() + initSearch() - lógica de Google Places
│   ├── useSupabaseAuth.js       # Composable auth (signUp, signIn, signOut)
│   └── useSupabaseDb.js         # Composable DB (CRUD prospectos) - NOTA: duplicado con store
├── layouts/default/
│   ├── Default.vue              # Layout principal (sidebar + topbar + router-view + auth check)
│   ├── Sidebar.vue              # Sidebar colapsable con navegación (6 rutas)
│   ├── Topbar.vue               # Topbar con buscador global + theme toggle + avatar + logout
│   ├── AppBar.vue               # Placeholder legacy
│   └── View.vue                 # Placeholder legacy
├── lib/
│   └── supabase.js              # Cliente Supabase inicializado
├── plugins/
│   ├── index.js                 # Registro de plugins (Vuetify, Router, Pinia, webfontloader)
│   ├── vuetify.js               # Config Vuetify (primary: #2563eb, secondary: #8b5cf6)
│   └── webfontloader.js         # Carga Roboto font
├── router/
│   └── index.js                 # Definición de rutas (lazy loading, requiresAuth)
├── store/
│   ├── index.js                 # Creación Pinia
│   └── app.js                   # Store principal (user, searchResults, prospects, etc.)
├── styles/
│   └── settings.scss            # Variables SCSS Vuetify
└── views/
    ├── Auth.vue                 # Login/Registro (email + password, supabase)
    ├── Dashboard.vue            # Panel con stats, actividad reciente, prospectos por estado
    ├── Buscar.vue               # Pág. búsqueda: SearchPremium + ResultsPanel + MapsPremium
    ├── Prospectos.vue           # CRUD prospectos (tarjetas con filtro, estado, prioridad)
    ├── Emails.vue               # Placeholder "Próximamente"
    ├── Estadisticas.vue         # Placeholder con métricas básicas
    └── Configuracion.vue        # Toggle tema oscuro + "Acerca de"
    └── Home.vue                 # [LEGACY] Página principal Vuetify (obsoleta)
```

## Rutas

| Path | Nombre | Componente | Auth |
|---|---|---|---|
| `/auth` | Auth | Auth.vue | No |
| `/` | Dashboard | Dashboard.vue | Sí |
| `/buscar` | Buscar | Buscar.vue | Sí |
| `/prospectos` | Prospectos | Prospectos.vue | Sí |
| `/emails` | Emails | Emails.vue | Sí |
| `/estadisticas` | Estadisticas | Estadisticas.vue | Sí |
| `/configuracion` | Configuracion | Configuracion.vue | Sí |

Todas las rutas usan lazy loading (`() => import(...)`).

## Estado Global (Pinia store/app.js)

```js
state: {
  user,                    // Usuario autenticado
  searchResults: [],       // Resultados de búsqueda actual
  selectedCityLocation,    // Coordenadas de ciudad seleccionada
  center,                  // Centro del mapa
  selectedLocationName,    // Nombre del lugar seleccionado en mapa
  currentSearchParams,     // { city, type } - parámetros de última búsqueda
  prospects: [],           // Lista de prospectos del usuario
  dbReady: false,
}
```

**Getters**: `userId`, `prospectStats` (total, contacted, interested, closed), `dashboardStats` (totalProspects, citiesAnalyzed, accommodationsFound, contactsMade, conversions)

**Acciones clave**:
- `setUser(user)` - setea usuario
- `fetchProspects()` - obtiene prospectos desde Supabase
- `addProspect(prospect)` - agrega prospecto (con verificación de duplicado por placeId)
- `updateProspect(id, updates)` - actualiza campos
- `removeProspect(id)` - elimina
- `saveSearch(city, type, resultsCount)` - guarda historial de búsqueda
- Setters: `setSearchResults`, `setSelectedCityLocation`, `setSelectedLocationName`, `setCurrentSearchParams`

NOTA: `useSupabaseDb.js` duplica lógica del store. Usar el store para todo.

## Layout y Tema

- **Tema oscuro**: controlado por clase `dark` en `<html>`, persistido en `localStorage('theme')`
- **Sidebar**: 260px (expandido) / 70px (colapsado). Fijo, oscuro (`#0f1219`)
- **Topbar**: 64px, glass effect (`backdrop-blur-xl`), con buscador global (placeholder visual no funcional)
- **Transiciones**: animación `page` (opacity + translateY)
- **CSS Variables**: `--sidebar-width: 260px`, `--sidebar-collapsed-width: 70px`, `--header-height: 64px`

## Convenciones de Código

1. **Composition API** con `<script setup>` en todos los componentes
2. **Naming**: PascalCase para componentes, camelCase para composables/libs
3. **Import alias**: `@/` mapea a `src/`
4. **Estilos scoped** en todos los componentes
5. **Tailwind CSS** para la nueva UI (NO usar Vuetify para nuevo código)
6. **Iconos**: `@lucide/vue` para nuevo código (NO `@mdi/font`)
7. **Store Pinia**: `useAppStore` - usar para todo el estado
8. **Lazy loading** en rutas

## Paleta de Colores (Tailwind)

```js
sidebar: { bg: '#0f1219', hover: '#1a1f2e', active: '#2563eb', text: '#94a3b8', 'text-active': '#ffffff' }
surface: { DEFAULT: '#ffffff', dark: '#0a0d14', card: '#f8f9fc', 'card-dark': '#111827' }
brand: { 50-900: escala azul, primary: '#2563eb' }
```

## Clases CSS Globales (main.css)

- `.glass`, `.glass-strong` - efecto vidrio con backdrop-filter
- `.card-hover` - hover con translateY(-2px)
- `.skeleton` - shimmer animation para loading
- `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`, `.badge-neutral`
- `.scrollbar-thin` - scrollbar fino

## Animaciones Tailwind

`fade-in`, `slide-up`, `slide-in-left`, `scale-in`, `pulse-soft` con sus respectivos keyframes.

## Mapa y Búsqueda (Google Maps)

- **initSearch(city, business, callback)**: geocodifica ciudad, hace `nearbySearch` (radio 50km, max 30 resultados), obtiene `placeDetails` de cada uno (teléfono, web, rating, dirección, fotos)
- **Autocomplete**: restringido a `country: 'ar'`, tipo `locality`
- **Tipos de búsqueda**: hotel, hostel, cabin, apartment, campground, lodging, restaurant, cafe, bar
- **Marcadores**: iconos Google Maps (`red-dot` / `blue-dot`), infoWindows con datos + botón "Agregar a prospectos"
- **Controles mapa**: centrar, satélite/roadmap, ajustar bounds, zoom +/- (personalizados)
- **Centro default**: San Juan, Argentina (`-31.537297, -68.525076`)

## Prospectos - Campos

| Campo | Tipo | Valores |
|---|---|---|
| status | string | `new` | `pending` | `contacted` | `interested` | `closed` |
| priority | string | `low` | `medium` | `high` |
| contact_made | boolean | default: false |
| place_id, name, category, address, phone, website, rating, city, notes, last_contact | varios | |

## Variables de Entorno Requeridas (.env)

```
VITE_GOOGLE_MAPS_API_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## NOTAS para Desarrollo

### Cosas que NO se deben hacer:
- No usar Vuetify en componentes nuevos (usar Tailwind + Lucide)
- No crear archivos de componentes legacy (Home.vue, Search.vue, Maps.vue, Results.vue)
- No duplicar lógica DB en `useSupabaseDb.js` (usar el store)
- No modificar `maps.js` sin considerar cuota de Google Places API

### Cosas por hacer (pendientes):
- [ ] Implementar módulo de Emails (actualmente placeholder)
- [ ] Implementar estadísticas con gráficos (actualmente placeholder)
- [ ] Hacer funcional el buscador global en Topbar
- [ ] Agregar validación de auth con guardias de navegación (router.beforeEach)
- [ ] Tests automatizados
- [ ] Migrar componentes Vuetify legacy a Tailwind
- [ ] Activity tracking / notificaciones
- [ ] Integración con APIs de WhatsApp/email
