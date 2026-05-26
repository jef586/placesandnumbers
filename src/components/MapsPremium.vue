<template>
  <div class="maps-premium">
    <div class="map-wrapper">
      <div v-if="store.searchResults.length === 0" class="map-empty">
        <Map class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mapa</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Los resultados aparecerán aquí</p>
      </div>

      <GoogleMap
        :api-key="apiKey"
        :libraries="['places']"
        style="width: 100%; height: 100%"
        :center="center"
        :zoom="zoom"
        :map-type-id="mapTypeId"
        :options="mapOptions"
        @click="closeInfo"
      >
        <Marker
          v-for="(result, index) in validResults"
          :key="result.placeId || index"
          :options="{
            position: { lat: result.location.lat, lng: result.location.lng },
            icon: createMarkerIcon(result.name === store.selectedLocationName),
            title: result.name,
          }"
        >
          <InfoWindow>
            <div class="info-window-modern">
              <div class="info-header">
                <div class="info-icon">
                  <Building2 class="w-4 h-4" />
                </div>
                <div>
                  <h4 class="info-title">{{ result.name }}</h4>
                  <p class="info-subtitle">{{ result.address }}</p>
                </div>
              </div>
              <div class="info-body">
                <div v-if="result.phoneNumber" class="info-row">
                  <Phone class="w-3.5 h-3.5" />
                  <span>{{ result.phoneNumber }}</span>
                </div>
                <div v-if="result.website" class="info-row">
                  <Globe class="w-3.5 h-3.5" />
                  <a :href="result.website" target="_blank" class="text-blue-500 hover:underline">Sitio web</a>
                </div>
                <div v-if="result.rating" class="info-row">
                  <Star class="w-3.5 h-3.5 text-amber-500" />
                  <span>{{ result.rating }}</span>
                </div>
              </div>
              <div class="info-actions">
                <button @click="addToProspects(result)" class="info-btn">
                  <UserPlus class="w-3.5 h-3.5" />
                  Agregar a prospectos
                </button>
              </div>
            </div>
          </InfoWindow>
        </Marker>
      </GoogleMap>

      <div class="map-overlay-top">
        <div class="map-city-label" v-if="store.selectedLocationName">
          <MapPin class="w-4 h-4 text-blue-500" />
          <span>{{ store.selectedLocationName }}</span>
        </div>
      </div>

      <div class="map-controls">
        <button @click="centerMap" class="map-control-btn" title="Centrar mapa">
          <Crosshair class="w-4 h-4" />
        </button>
        <button @click="toggleMapType" class="map-control-btn" title="Cambiar vista">
          <Satellite v-if="mapTypeId === 'roadmap'" class="w-4 h-4" />
          <Map v-else class="w-4 h-4" />
        </button>
        <button v-if="validResults.length > 1" @click="fitBounds" class="map-control-btn" title="Ajustar vista">
          <Maximize2 class="w-4 h-4" />
        </button>
        <div class="zoom-controls">
          <button @click="zoomIn" class="zoom-btn" title="Acercar">
            <Plus class="w-4 h-4" />
          </button>
          <div class="zoom-divider"></div>
          <button @click="zoomOut" class="zoom-btn" title="Alejar">
            <Minus class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { GoogleMap, Marker, InfoWindow } from 'vue3-google-map'
import { useAppStore } from '@/store/app'
import {
  Map, MapPin, Building2, Phone, Globe, Star,
  UserPlus, Crosshair, Maximize2, Plus, Minus, Satellite,
} from '@lucide/vue'

const store = useAppStore()
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const zoom = ref(12)
const mapTypeId = ref('roadmap')

const center = computed(() => store.center)

const validResults = computed(() =>
  store.searchResults.filter(r => r && r.location && r.location.lat && r.location.lng)
)

const mapOptions = {
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  gestureHandling: 'cooperative',
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
}

watch(() => store.searchResults, (newResults) => {
  if (newResults.length === 1) {
    const r = newResults[0]
    if (r.location) {
      store.center = { lat: r.location.lat, lng: r.location.lng }
      zoom.value = 15
    }
  } else if (newResults.length > 1) {
    nextTick(() => fitBounds())
  }
}, { immediate: true })

watch(() => store.selectedCityLocation, (newLocation) => {
  if (newLocation) {
    store.center = newLocation
    zoom.value = 12
  }
}, { immediate: true })

const createMarkerIcon = (isSelected = false) => {
  const size = isSelected ? 40 : 32
  const color = isSelected ? 'blue' : 'red'
  return {
    url: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size),
  }
}

const closeInfo = () => {}

const centerMap = () => {
  if (validResults.value.length > 0) {
    const r = validResults.value[0]
    store.center = { lat: r.location.lat, lng: r.location.lng }
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
  if (validResults.value.length > 1) {
    const bounds = new google.maps.LatLngBounds()
    validResults.value.forEach(r => {
      bounds.extend({ lat: r.location.lat, lng: r.location.lng })
    })
    const c = bounds.getCenter()
    store.center = { lat: c.lat(), lng: c.lng() }
    zoom.value = 11
  }
}

const zoomIn = () => { if (zoom.value < 20) zoom.value += 1 }
const zoomOut = () => { if (zoom.value > 1) zoom.value -= 1 }

const addToProspects = (result) => {
  store.addProspect({
    placeId: result.placeId,
    name: result.name,
    category: store.currentSearchParams.type || 'Alojamiento',
    address: result.address,
    phone: result.phoneNumber,
    website: result.website,
    rating: result.rating,
    city: store.currentSearchParams.city,
  })
}
</script>

<style scoped>
.maps-premium {
  @apply h-full;
}

.map-wrapper {
  @apply relative w-full h-[calc(100vh-200px)] min-h-[500px] rounded-2xl overflow-hidden;
  @apply bg-gray-100 dark:bg-[#111827];
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
}

.map-empty {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.map-overlay-top {
  @apply absolute top-4 left-1/2 -translate-x-1/2 z-10;
}

.map-city-label {
  @apply flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium;
  @apply bg-white/90 dark:bg-[#0f1219]/90 backdrop-blur-md;
  @apply shadow-lg border border-gray-100 dark:border-white/5;
  @apply text-gray-900 dark:text-white;
}

.map-controls {
  @apply absolute top-4 right-4 z-10 flex flex-col gap-2;
}

.map-control-btn {
  @apply w-10 h-10 rounded-xl flex items-center justify-center;
  @apply bg-white/90 dark:bg-[#0f1219]/90 backdrop-blur-md;
  @apply border border-gray-100 dark:border-white/10;
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:bg-white dark:hover:bg-[#1a1f2e];
  @apply transition-all duration-200 shadow-md;
}

.map-control-btn:hover {
  @apply -translate-y-0.5;
}

.zoom-controls {
  @apply flex flex-col rounded-xl overflow-hidden;
  @apply bg-white/90 dark:bg-[#0f1219]/90 backdrop-blur-md;
  @apply border border-gray-100 dark:border-white/10;
  @apply shadow-md;
}

.zoom-btn {
  @apply w-10 h-9 flex items-center justify-center;
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-50 dark:hover:bg-white/5;
  @apply transition-all duration-200;
}

.zoom-divider {
  @apply h-px bg-gray-100 dark:bg-white/5;
}

/* Info Window Styles */
:deep(.gm-style-iw) {
  @apply rounded-2xl !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
}

:deep(.gm-style-iw-d) {
  @apply overflow-hidden !important;
}

.info-window-modern {
  @apply p-3 min-w-[200px];
}

.info-header {
  @apply flex items-start gap-3 mb-3;
}

.info-icon {
  @apply w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600;
  @apply flex items-center justify-center text-white flex-shrink-0;
}

.info-title {
  @apply text-sm font-semibold text-gray-900;
}

.info-subtitle {
  @apply text-xs text-gray-500;
}

.info-body {
  @apply space-y-1.5 mb-3;
}

.info-row {
  @apply flex items-center gap-2 text-xs text-gray-600;
}

.info-actions {
  @apply pt-2 border-t border-gray-100;
}

.info-btn {
  @apply w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium;
  @apply bg-blue-50 text-blue-600 hover:bg-blue-100;
  @apply transition-all duration-200;
}

/* Dark mode overrides for info window */
:deep(.gm-style-iw) .info-window-modern {
  @apply bg-white;
}
</style>
