<template>
  <v-card 
    class="maps-card elevation-8" 
    rounded="xl"
    :class="{ 'has-markers': filteredResults.length > 0 }"
  >
    <!-- Header with Quick Navigation -->
    <v-card-title class="maps-header d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-icon color="primary" size="large" class="me-3">
          mdi-map
        </v-icon>
        <span class="text-h5 font-weight-bold">Mapa de Ubicaciones</span>
      </div>
      <div class="d-flex align-center gap-2">
        <v-chip 
          v-if="filteredResults.length > 0"
          color="primary" 
          variant="elevated" 
          size="small"
          class="me-2"
        >
          {{ filteredResults.length }} {{ filteredResults.length === 1 ? 'marcador' : 'marcadores' }}
        </v-chip>
        <!-- Quick Navigation Button -->
        <v-btn
          @click="scrollToResults"
          size="small"
          color="secondary"
          variant="tonal"
          class="quick-nav-btn"
          title="Ver resultados"
        >
          <v-icon size="small" class="me-1">mdi-format-list-bulleted</v-icon>
          Resultados
        </v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Map Container -->
    <div class="map-container">
      <!-- Empty State -->
      <div v-if="filteredResults.length === 0" class="empty-map-state">
        <v-icon size="80" color="grey-lighten-2" class="mb-4">
          mdi-map-outline
        </v-icon>
        <h3 class="text-h6 text-grey-darken-1 mb-2">
          Mapa listo para mostrar ubicaciones
        </h3>
        <p class="text-body-2 text-grey">
          Los marcadores aparecerán aquí cuando realices una búsqueda
        </p>
      </div>

      <!-- Google Map -->
      <GoogleMap
        :api-key="apiKey"
        style="width: 100%; height: 100%"
        :center="center"
        :zoom="zoom"
        :map-type-id="mapTypeId"
        :options="mapOptions"
        @click="onMapClick"
      >
        <!-- Markers -->
        <Marker
          v-for="(result, index) in filteredResults"
          :key="result.place_id || index"
          :options="{
            position: {
              lat: typeof result.geometry.location.lat === 'function' ? result.geometry.location.lat() : result.geometry.location.lat,
              lng: typeof result.geometry.location.lng === 'function' ? result.geometry.location.lng() : result.geometry.location.lng
            },
            icon: createCustomMarker(index + 1),
            title: result.name,
            animation: google.maps.Animation.DROP
          }"
          @click="selectMarker(result, index)"
        >
          <!-- Info Window -->
          <InfoWindow
            v-if="selectedMarker && selectedMarker.place_id === result.place_id"
            :options="{
              pixelOffset: { width: 0, height: -35 },
              maxWidth: 300
            }"
          >
            <div class="info-window-content">
              <div class="info-header">
                <h4 class="info-title">{{ result.name }}</h4>
                <v-btn
                  @click="closeInfoWindow"
                  icon
                  size="x-small"
                  variant="text"
                  class="close-btn"
                >
                  <v-icon size="small">mdi-close</v-icon>
                </v-btn>
              </div>
              
              <div class="info-body">
                <div v-if="result.formatted_address || result.vicinity" class="info-item">
                  <v-icon size="small" class="me-2">mdi-map-marker</v-icon>
                  <span class="info-text">{{ result.formatted_address || result.vicinity }}</span>
                </div>
                
                <div v-if="result.formatted_phone_number || result.international_phone_number" class="info-item">
                  <v-icon size="small" class="me-2">mdi-phone</v-icon>
                  <span class="info-text">{{ result.formatted_phone_number || result.international_phone_number }}</span>
                </div>
                
                <div v-if="result.website" class="info-item">
                  <v-icon size="small" class="me-2">mdi-web</v-icon>
                  <a :href="result.website" target="_blank" class="info-link">
                    Visitar sitio web
                  </a>
                </div>
                
                <div v-if="result.rating" class="info-item">
                  <v-icon size="small" class="me-2">mdi-star</v-icon>
                  <div class="d-flex align-center">
                    <v-rating
                      :model-value="result.rating"
                      color="amber"
                      density="compact"
                      size="x-small"
                      readonly
                      half-increments
                    ></v-rating>
                    <span class="rating-text ms-2">({{ result.rating }})</span>
                  </div>
                </div>
              </div>
              
              <div class="info-actions mt-3">
                <v-btn
                  @click="scrollToResultsAndHighlight(result)"
                  size="small"
                  color="primary"
                  variant="elevated"
                  block
                >
                  <v-icon size="small" class="me-1">mdi-format-list-bulleted</v-icon>
                  Ver en resultados
                </v-btn>
              </div>
            </div>
          </InfoWindow>
        </Marker>
      </GoogleMap>

      <!-- Map Controls -->
      <div class="map-controls">
        <!-- Center Map Button -->
        <v-btn
          @click="centerMap"
          fab
          size="small"
          color="primary"
          elevation="4"
          class="control-btn"
          title="Centrar mapa"
        >
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-btn>

        <!-- Map Type Toggle -->
        <v-btn
          @click="toggleMapType"
          fab
          size="small"
          color="info"
          elevation="4"
          class="control-btn mt-2"
          :title="`Cambiar a vista ${mapTypeId === 'roadmap' ? 'satélite' : 'mapa'}`"
        >
          <v-icon>{{ mapTypeId === 'roadmap' ? 'mdi-satellite-variant' : 'mdi-map' }}</v-icon>
        </v-btn>

        <!-- Fit Bounds Button -->
        <v-btn
          v-if="filteredResults.length > 1"
          @click="fitBounds"
          fab
          size="small"
          color="secondary"
          elevation="4"
          class="control-btn mt-2"
          title="Ajustar vista a todos los marcadores"
        >
          <v-icon>mdi-fit-to-page-outline</v-icon>
        </v-btn>

        <!-- Zoom Controls -->
        <div class="zoom-controls mt-2">
          <v-btn
            @click="zoomIn"
            fab
            size="x-small"
            color="white"
            elevation="2"
            class="zoom-btn"
            title="Acercar"
          >
            <v-icon size="small">mdi-plus</v-icon>
          </v-btn>
          <v-btn
            @click="zoomOut"
            fab
            size="x-small"
            color="white"
            elevation="2"
            class="zoom-btn mt-1"
            title="Alejar"
          >
            <v-icon size="small">mdi-minus</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { GoogleMap, Marker, InfoWindow } from 'vue3-google-map'
import { useAppStore } from '@/store/app'

const store = useAppStore()

// Reactive data
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const zoom = ref(12)
const mapTypeId = ref('roadmap')
const selectedMarker = ref(null)

// Computed properties
const center = computed(() => store.center)
const filteredResults = computed(() => store.searchResults)

// Map options
const mapOptions = {
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  disableDefaultUI: false,
  gestureHandling: 'cooperative',
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

// Watchers
watch(() => store.searchResults, (newResults) => {
  if (newResults.length > 0) {
    selectedMarker.value = null
    if (newResults.length === 1) {
      // Center on single result
      const result = newResults[0]
      store.center = {
        lat: typeof result.geometry.location.lat === 'function' ? result.geometry.location.lat() : result.geometry.location.lat,
        lng: typeof result.geometry.location.lng === 'function' ? result.geometry.location.lng() : result.geometry.location.lng
      }
      zoom.value = 15
    } else {
      // Fit bounds for multiple results
      nextTick(() => {
        fitBounds()
      })
    }
  }
}, { immediate: true })

watch(() => store.selectedCityLocation, (newLocation) => {
  if (newLocation) {
    store.center = newLocation
    zoom.value = 12
  }
}, { immediate: true })

// Methods
const createCustomMarker = (number) => {
  const svg = `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z" 
            fill="#1976d2" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="12" fill="white"/>
      <text x="16" y="21" text-anchor="middle" font-family="Arial, sans-serif" 
            font-size="12" font-weight="bold" fill="#1976d2">${number}</text>
    </svg>
  `
  
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(32, 40),
    anchor: new google.maps.Point(16, 40)
  }
}

const selectMarker = (result, index) => {
  selectedMarker.value = result
}

const closeInfoWindow = () => {
  selectedMarker.value = null
}

const onMapClick = () => {
  selectedMarker.value = null
}

const centerMap = () => {
  if (filteredResults.value.length > 0) {
    const firstResult = filteredResults.value[0]
    store.center = {
      lat: typeof firstResult.geometry.location.lat === 'function' ? firstResult.geometry.location.lat() : firstResult.geometry.location.lat,
      lng: typeof firstResult.geometry.location.lng === 'function' ? firstResult.geometry.location.lng() : firstResult.geometry.location.lng
    }
    zoom.value = 15
  } else if (store.selectedCityLocation) {
    store.center = store.selectedCityLocation
    zoom.value = 12
  }
}

const toggleMapType = () => {
  mapTypeId.value = mapTypeId.value === 'roadmap' ? 'satellite' : 'roadmap'
}

const fitBounds = () => {
  if (filteredResults.value.length > 1) {
    const bounds = new google.maps.LatLngBounds()
    filteredResults.value.forEach(result => {
      bounds.extend({
        lat: typeof result.geometry.location.lat === 'function' ? result.geometry.location.lat() : result.geometry.location.lat,
        lng: typeof result.geometry.location.lng === 'function' ? result.geometry.location.lng() : result.geometry.location.lng
      })
    })
    
    // This would need to be implemented with map instance
    // For now, we'll center on the first result and adjust zoom
    const center = bounds.getCenter()
    store.center = {
      lat: center.lat(),
      lng: center.lng()
    }
    zoom.value = 11
  }
}

const zoomIn = () => {
  if (zoom.value < 20) {
    zoom.value += 1
  }
}

const zoomOut = () => {
  if (zoom.value > 1) {
    zoom.value -= 1
  }
}

const scrollToResults = () => {
  nextTick(() => {
    const resultsElement = document.querySelector('.results-section')
    if (resultsElement) {
      resultsElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  })
}

const scrollToResultsAndHighlight = (result) => {
  // Close info window
  selectedMarker.value = null
  
  // Scroll to results
  scrollToResults()
  
  // Optional: Could emit an event to highlight the specific result in the table
  // This would require additional implementation in the Results component
}
</script>

<style scoped>
.maps-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #ffffff 0%, #f0f8ff 100%);
  border: 1px solid rgba(25, 118, 210, 0.12);
  position: relative;
  overflow: hidden;
}

.maps-card.has-markers {
  box-shadow: 0 8px 32px rgba(25, 118, 210, 0.15) !important;
}

.maps-header {
  flex-shrink: 0;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 2;
}

.quick-nav-btn {
  text-transform: none;
  font-size: 0.75rem;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.quick-nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 400px;
}

.empty-map-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  padding: 32px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.control-btn {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.9) !important;
  margin-bottom: 8px;
}

.control-btn:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.zoom-controls {
  display: flex;
  flex-direction: column;
}

.zoom-btn {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.zoom-btn:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* Info Window Styles */
:deep(.gm-style-iw) {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
}

:deep(.gm-style-iw-d) {
  overflow: hidden !important;
}

.info-window-content {
  padding: 16px;
  max-width: 280px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.info-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  margin-right: 8px;
}

.close-btn {
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}

.info-body {
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-text {
  color: #424242;
  line-height: 1.4;
}

.info-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.info-link:hover {
  text-decoration: underline;
}

.rating-text {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.info-actions {
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .maps-header {
    padding: 12px 16px !important;
  }
  
  .maps-header .text-h5 {
    font-size: 1.1rem !important;
  }
  
  .map-container {
    min-height: 350px;
  }
  
  .map-controls {
    top: 12px;
    right: 12px;
  }
  
  .control-btn {
    width: 40px;
    height: 40px;
  }
  
  .zoom-btn {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 600px) {
  .map-container {
    min-height: 300px;
  }
  
  .empty-map-state {
    padding: 24px 16px;
  }
  
  .empty-map-state .v-icon {
    font-size: 60px !important;
  }
  
  .info-window-content {
    padding: 12px;
    max-width: 240px;
  }
  
  .info-title {
    font-size: 1rem;
  }
  
  .info-item {
    font-size: 0.85rem;
  }
  
  .quick-nav-btn {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .control-btn,
  .zoom-btn,
  .quick-nav-btn {
    transition: none;
  }
}

/* Tema oscuro */
@media (prefers-color-scheme: dark) {
  .maps-card {
    background: linear-gradient(145deg, #1e1e1e 0%, #2d2d30 100%);
    border-color: rgba(255, 255, 255, 0.12);
  }
  
  .empty-map-state {
    background: rgba(30, 30, 30, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .info-window-content {
    background: #2d2d30;
    color: white;
  }
  
  .info-title {
    color: #64b5f6;
  }
  
  .info-text {
    color: #e0e0e0;
  }
  
  .info-link {
    color: #64b5f6;
  }
}
</style>
