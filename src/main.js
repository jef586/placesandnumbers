/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App
 */

import { createApp } from 'vue'
import App from './App.vue'
import { registerPlugins } from '@/plugins'
import { Loader } from "@googlemaps/js-api-loader"

const app = createApp(App)

// Registra los plugins antes de cargar Google Maps
registerPlugins(app)

// Configura y carga Google Maps antes de montar la aplicación
const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places'],
});

loader.load().then(() => {
  // Monta la aplicación después de cargar Google Maps
  app.mount('#app')
}).catch((error) => {
  console.error('Error loading Google Maps:', error)
  // Monta la aplicación incluso si Google Maps falla
  app.mount('#app')
})