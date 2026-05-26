import { createApp } from 'vue'
import App from './App.vue'
import { registerPlugins } from '@/plugins'
import { Loader } from "@googlemaps/js-api-loader"
import './assets/main.css'

const app = createApp(App)

registerPlugins(app)

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places'],
});

loader.load().then(() => {
  app.mount('#app')
}).catch((error) => {
  console.error('Error loading Google Maps:', error)
  app.mount('#app')
})