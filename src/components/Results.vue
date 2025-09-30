<template>
  <v-card 
    class="results-card elevation-8" 
    rounded="xl"
    :class="{ 'has-results': results.length > 0 }"
  >
    <!-- Header with scroll indicator -->
    <v-card-title class="results-header d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-icon color="primary" size="large" class="me-3">
          mdi-format-list-bulleted
        </v-icon>
        <span class="text-h5 font-weight-bold">Resultados de Búsqueda</span>
      </div>
      <div class="d-flex align-center">
        <v-chip 
          v-if="results.length > 0"
          color="primary" 
          variant="elevated" 
          size="small"
          class="me-2"
        >
          {{ results.length }} {{ results.length === 1 ? 'lugar' : 'lugares' }}
        </v-chip>
        <v-icon 
          v-if="results.length > 5" 
          color="grey" 
          size="small"
          class="scroll-indicator"
          title="Desplázate para ver más resultados"
        >
          mdi-chevron-down
        </v-icon>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Results Content with Internal Scroll -->
    <div class="results-content">
      <!-- Empty State -->
      <div v-if="results.length === 0" class="empty-state pa-8 text-center">
        <v-icon size="80" color="grey-lighten-2" class="mb-4">
          mdi-map-search-outline
        </v-icon>
        <h3 class="text-h6 text-grey-darken-1 mb-2">
          No hay resultados aún
        </h3>
        <p class="text-body-2 text-grey">
          Realiza una búsqueda para ver los lugares disponibles
        </p>
      </div>

      <!-- Data Table with Custom Scroll -->
      <v-data-table
        v-else
        :headers="headers"
        :items="results"
        :items-per-page="-1"
        hide-default-footer
        class="results-table"
        :class="{ 'scrollable-table': results.length > 5 }"
      >
        <!-- Name Column -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" color="primary" class="me-3">
              <v-icon color="white" size="small">mdi-store</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium text-body-1">
                {{ item.name }}
              </div>
              <div class="text-caption text-grey-darken-1" v-if="item.address">
                {{ item.address }}
              </div>
            </div>
          </div>
        </template>

        <!-- Phone Column -->
        <template v-slot:item.phone="{ item }">
          <div v-if="item.phone" class="phone-actions">
            <div class="text-body-2 mb-1">
              {{ formatPhoneNumber(item.phone) }}
            </div>
            <div class="d-flex gap-1">
              <v-btn
                :href="`https://wa.me/${item.phone.replace(/\D/g, '')}`"
                target="_blank"
                size="x-small"
                color="success"
                variant="tonal"
                class="phone-btn"
              >
                <v-icon size="small">mdi-whatsapp</v-icon>
                WhatsApp
              </v-btn>
              <v-btn
                :href="`tel:${item.phone}`"
                size="x-small"
                color="primary"
                variant="tonal"
                class="phone-btn"
              >
                <v-icon size="small">mdi-phone</v-icon>
                Llamar
              </v-btn>
            </div>
          </div>
          <span v-else class="text-grey">No disponible</span>
        </template>

        <!-- Website Column -->
        <template v-slot:item.website="{ item }">
          <div v-if="item.website">
            <v-btn
              :href="item.website"
              target="_blank"
              size="small"
              color="info"
              variant="tonal"
              class="website-btn"
            >
              <v-icon size="small" class="me-1">mdi-web</v-icon>
              Visitar sitio
            </v-btn>
          </div>
          <span v-else class="text-grey">No disponible</span>
        </template>

        <!-- Rating Column -->
        <template v-slot:item.rating="{ item }">
          <div v-if="item.rating" class="d-flex align-center">
            <v-rating
              :model-value="item.rating"
              color="amber"
              density="compact"
              size="small"
              readonly
              half-increments
            ></v-rating>
            <span class="text-caption text-grey-darken-1 ms-2">
              ({{ item.rating }})
            </span>
          </div>
          <span v-else class="text-grey">Sin calificación</span>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            @click="showOnMap(item)"
            size="small"
            color="primary"
            variant="elevated"
            class="map-btn"
          >
            <v-icon size="small" class="me-1">mdi-map-marker</v-icon>
            Ver en mapa
          </v-btn>
        </template>
      </v-data-table>

      <!-- Scroll to Top Button -->
      <v-btn
        v-if="results.length > 5"
        @click="scrollToTop"
        fab
        size="small"
        color="primary"
        class="scroll-top-btn"
        elevation="4"
        title="Volver arriba"
      >
        <v-icon>mdi-chevron-up</v-icon>
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { useAppStore } from '@/store/app'

const store = useAppStore()

const results = computed(() => {
  return store.searchResults.map(result => ({
    name: result.name,
    phone: result.formatted_phone_number || result.international_phone_number,
    website: result.website,
    rating: result.rating,
    address: result.formatted_address || result.vicinity,
    location: result.location, // Usar location en lugar de geometry
    place_id: result.place_id || result.placeId
  }))
})

const headers = [
  { title: 'Lugar', key: 'name', sortable: true, width: '35%' },
  { title: 'Teléfono', key: 'phone', sortable: false, width: '25%' },
  { title: 'Sitio Web', key: 'website', sortable: false, width: '15%' },
  { title: 'Calificación', key: 'rating', sortable: true, width: '15%' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '10%' }
]

const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  // Format phone number for better readability
  return phone.replace(/(\+\d{2})(\d{2})(\d{4})(\d{4})/, '$1 $2 $3-$4')
}

const showOnMap = (item) => {
  console.log('showOnMap called with item:', item)
  
  // Verificar si el item tiene la estructura correcta de location
  if (item.location && item.location.lat && item.location.lng) {
    // Center map on the selected location
    store.center = {
      lat: item.location.lat,
      lng: item.location.lng
    }
    
    // Guardar el nombre de la ubicación seleccionada
    store.setSelectedLocationName(item.name)
    
    console.log('Map centered to:', store.center)
    console.log('Selected location name:', item.name)
    
    // Scroll to map section
    nextTick(() => {
      const mapElement = document.querySelector('.map-section')
      if (mapElement) {
        mapElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      } else {
        console.warn('Map section not found')
      }
    })
  } else {
    console.error('Item does not have valid location data:', item)
  }
}

const scrollToTop = () => {
  const tableElement = document.querySelector('.results-table .v-table__wrapper')
  if (tableElement) {
    tableElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}
</script>

<style scoped>
.results-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
  border: 1px solid rgba(25, 118, 210, 0.12);
  position: relative;
  overflow: hidden;
}

.results-card.has-results {
  box-shadow: 0 8px 32px rgba(25, 118, 210, 0.15) !important;
}

.results-header {
  flex-shrink: 0;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 2;
}

.results-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.results-table {
  flex: 1;
  height: 100%;
}

.scrollable-table :deep(.v-table__wrapper) {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #1976d2 #f5f5f5;
}

.scrollable-table :deep(.v-table__wrapper)::-webkit-scrollbar {
  width: 6px;
}

.scrollable-table :deep(.v-table__wrapper)::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.scrollable-table :deep(.v-table__wrapper)::-webkit-scrollbar-thumb {
  background: #1976d2;
  border-radius: 3px;
}

.scrollable-table :deep(.v-table__wrapper)::-webkit-scrollbar-thumb:hover {
  background: #1565c0;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.phone-actions {
  min-width: 140px;
}

.phone-btn,
.website-btn,
.map-btn {
  text-transform: none;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.phone-btn:hover,
.website-btn:hover,
.map-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-indicator {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

.scroll-top-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 3;
  backdrop-filter: blur(10px);
  background-color: rgba(25, 118, 210, 0.9) !important;
}

.scroll-top-btn:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Responsive Design */
@media (max-width: 1280px) {
  .scrollable-table :deep(.v-table__wrapper) {
    max-height: calc(100vh - 350px);
  }
}

@media (max-width: 960px) {
  .scrollable-table :deep(.v-table__wrapper) {
    max-height: 300px;
  }
  
  .results-header {
    padding: 12px 16px !important;
  }
  
  .results-header .text-h5 {
    font-size: 1.1rem !important;
  }
}

@media (max-width: 600px) {
  .phone-actions {
    min-width: 120px;
  }
  
  .phone-btn,
  .website-btn,
  .map-btn {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
  
  .empty-state {
    padding: 24px 16px !important;
    min-height: 250px;
  }
  
  .empty-state .v-icon {
    font-size: 60px !important;
  }
  
  .scroll-top-btn {
    bottom: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .scroll-indicator,
  .phone-btn,
  .website-btn,
  .map-btn,
  .scroll-top-btn {
    animation: none;
    transition: none;
  }
}

/* Tema oscuro */
@media (prefers-color-scheme: dark) {
  .results-card {
    background: linear-gradient(145deg, #1e1e1e 0%, #2d2d30 100%);
    border-color: rgba(255, 255, 255, 0.12);
  }
  
  .scrollable-table :deep(.v-table__wrapper)::-webkit-scrollbar-track {
    background: #2d2d30;
  }
}
</style>
