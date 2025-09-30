<template>
  <v-container fluid class="home-container pa-4">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="app-header text-center">
          <h1 class="display-1 font-weight-bold text-primary mb-2">
            <v-icon size="large" class="me-3">mdi-map-search</v-icon>
            Buscador de Lugares
          </h1>
          <p class="text-h6 text-grey-darken-1">
            Encuentra los mejores lugares en Argentina
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Mensaje de ubicación seleccionada -->
    <v-row v-if="store.selectedLocationName" class="mb-3">
      <v-col cols="12">
        <v-alert
          type="info"
          variant="tonal"
          closable
          @click:close="clearSelectedLocation"
          class="location-alert"
        >
          <template v-slot:prepend>
            <v-icon>mdi-map-marker</v-icon>
          </template>
          <div class="d-flex align-center">
            <span class="font-weight-medium">Ubicación seleccionada:</span>
            <span class="ml-2 text-primary font-weight-bold">{{ store.selectedLocationName }}</span>
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Main Content -->
    <v-row class="main-content" style="height: calc(100vh - 200px);">
      <!-- Left Column - Map -->
      <v-col 
        cols="12" 
        lg="7" 
        md="6" 
        class="map-column"
        :order="$vuetify.display.mdAndUp ? 1 : 2"
      >
        <div class="map-section">
          <Maps />
        </div>
      </v-col>

      <!-- Right Column - Search & Results -->
      <v-col 
        cols="12" 
        lg="5" 
        md="6" 
        class="controls-column"
        :order="$vuetify.display.mdAndUp ? 2 : 1"
      >
        <div class="controls-section">
          <!-- Welcome Section -->
          <div class="welcome-section mb-3">
            <HelloWorld />
          </div>

          <!-- Search Section -->
          <div class="search-section mb-3">
            <Search />
          </div>

          <!-- Results Section with Fixed Height -->
          <div class="results-section">
            <Results />
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Navigation Buttons -->
    <div class="navigation-buttons" v-if="$vuetify.display.smAndDown">
      <v-btn
        @click="scrollToSection('search')"
        fab
        size="small"
        color="primary"
        elevation="4"
        class="nav-btn"
        title="Ir a búsqueda"
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      
      <v-btn
        @click="scrollToSection('results')"
        fab
        size="small"
        color="secondary"
        elevation="4"
        class="nav-btn mt-2"
        title="Ir a resultados"
      >
        <v-icon>mdi-format-list-bulleted</v-icon>
      </v-btn>
      
      <v-btn
        @click="scrollToSection('map')"
        fab
        size="small"
        color="info"
        elevation="4"
        class="nav-btn mt-2"
        title="Ir al mapa"
      >
        <v-icon>mdi-map</v-icon>
      </v-btn>
    </div>

    <!-- Footer -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-divider class="mb-2"></v-divider>
        <div class="app-footer text-center">
          <p class="text-body-2 text-grey">
            <v-icon size="small" class="me-1">mdi-heart</v-icon>
            Hecho con Vue.js y Google Maps API
            <v-icon size="small" class="ms-1">mdi-vuejs</v-icon>
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import HelloWorld from '@/components/HelloWorld.vue'
import Search from '@/components/Search.vue'
import Results from '@/components/Results.vue'
import Maps from '@/components/Maps.vue'
import { useAppStore } from '@/store/app'

const store = useAppStore()

const scrollToSection = (section) => {
  let selector = '';
  switch (section) {
    case 'search':
      selector = '.search-section';
      break;
    case 'results':
      selector = '.results-section';
      break;
    case 'map':
      selector = '.map-section';
      break;
  }
  
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
};

const clearSelectedLocation = () => {
  store.setSelectedLocationName('')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow-x: hidden;
}

.home-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
  pointer-events: none;
  z-index: 0;
}

.app-header {
  position: relative;
  z-index: 1;
  padding: 16px 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.main-content {
  position: relative;
  z-index: 1;
}

.map-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.controls-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.map-section {
  height: 100%;
  min-height: 500px;
}

.controls-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
}

.welcome-section {
  flex-shrink: 0;
}

.search-section {
  flex-shrink: 0;
}

.results-section {
  flex: 1;
  min-height: 300px;
  overflow: hidden;
}

.app-footer {
  position: relative;
  z-index: 1;
  padding: 8px 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Navigation Buttons */
.navigation-buttons {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.nav-btn {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.9) !important;
}

.nav-btn:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Animaciones */
.home-container {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.app-header {
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-content {
  animation: slideUp 0.8s ease-out 0.2s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1280px) {
  .main-content {
    height: calc(100vh - 180px) !important;
  }
  
  .map-section {
    min-height: 400px;
  }
}

@media (max-width: 960px) {
  .main-content {
    height: auto !important;
  }
  
  .controls-section {
    max-height: none;
  }
  
  .map-section {
    min-height: 350px;
  }
  
  .results-section {
    min-height: 250px;
  }
}

@media (max-width: 600px) {
  .home-container {
    padding: 8px !important;
  }
  
  .app-header {
    padding: 12px;
  }
  
  .app-header h1 {
    font-size: 1.6rem !important;
  }
  
  .app-header p {
    font-size: 0.9rem !important;
  }
  
  .map-section {
    min-height: 300px;
  }
  
  .welcome-section,
  .search-section {
    margin-bottom: 12px !important;
  }
  
  .navigation-buttons {
    bottom: 15px;
    right: 15px;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .home-container,
  .app-header,
  .main-content,
  .nav-btn {
    animation: none;
    transition: none;
  }
}

/* Tema oscuro */
@media (prefers-color-scheme: dark) {
  .home-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }
  
  .app-header,
  .app-footer {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
.location-alert {
  animation: slideInDown 0.3s ease-out;
  border-left: 4px solid #1976d2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
