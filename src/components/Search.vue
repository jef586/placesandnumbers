<template>
  <v-card class="search-card" elevation="8" rounded="lg">
    <v-card-title class="search-title">
      <v-icon class="me-2" color="primary">mdi-map-search</v-icon>
      Buscar Lugares
    </v-card-title>
    
    <v-card-text>
      <v-form @submit.prevent="buscar" ref="form">
        <v-text-field 
          id="autocomplete"
          v-model="selectedCity"
          label="¿En qué ciudad buscas?"
          placeholder="Ej: Buenos Aires, Córdoba, Mendoza..."
          prepend-inner-icon="mdi-map-marker"
          variant="outlined"
          clearable
          :rules="cityRules"
          :error-messages="cityError"
          class="mb-4"
          @input="updateAutocompleteOptions"
        />
        
        <v-select
          v-model="business"
          :items="options"
          item-title="title"
          item-value="value"
          label="¿Qué tipo de lugar buscas?"
          placeholder="Selecciona una categoría"
          prepend-inner-icon="mdi-store"
          variant="outlined"
          :rules="businessRules"
          class="mb-4"
        />
        
        <v-btn 
          type="submit" 
          block 
          size="large"
          color="primary"
          :loading="isLoading"
          :disabled="!selectedCity || !business"
          class="search-btn"
          @click="buscar"
        >
          <v-icon start>mdi-magnify</v-icon>
          {{ isLoading ? 'Buscando...' : 'Buscar Lugares' }}
        </v-btn>
      </v-form>
      
      <!-- Mensaje de estado -->
      <v-alert
        v-if="searchMessage"
        :type="searchMessage.type"
        :text="searchMessage.text"
        class="mt-4"
        variant="tonal"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { initSearch } from "@/composables/maps";
import { useAppStore } from "@/store/app";

const store = useAppStore();
const selectedCity = ref("");
const business = ref("");
const searchResults = ref([]);
const isLoading = ref(false);
const searchMessage = ref(null);
const cityError = ref("");
const form = ref(null);

let autocompleteInput;
const autocompleteOptions = ref([]);
const selectedCityLocation = ref("");

const options = [
  { title: "🍽️ Restaurante", value: "restaurant" },
  { title: "🍺 Bar", value: "bar" },
  { title: "☕ Café", value: "cafe" },
  { title: "🏪 Almacén", value: "store" },
  { title: "🥖 Panadería", value: "bakery" },
  { title: "🏨 Hotel", value: "lodging" },
  { title: "🥗 Dietética", value: "health" },
  { title: "⛽ Estación de Servicio", value: "gas_station" },
  { title: "🏥 Farmacia", value: "pharmacy" },
  { title: "🏦 Banco", value: "bank" },
];

const cityRules = [
  value => !!value || 'Debes seleccionar una ciudad',
  value => value?.length >= 2 || 'La ciudad debe tener al menos 2 caracteres'
];

const businessRules = [
  value => !!value || 'Debes seleccionar un tipo de negocio'
];

const buscar = async () => {
  // Validar formulario
  const { valid } = await form.value.validate();
  if (!valid) return;

  isLoading.value = true;
  searchMessage.value = null;
  cityError.value = "";

  try {
    searchMessage.value = {
      type: 'info',
      text: `Buscando ${business.value} en ${selectedCity.value}...`
    };

    initSearch(selectedCity.value, business.value, (results) => {
      searchResults.value = results;
      store.setSearchResults(results);
      isLoading.value = false;
      
      if (results && results.length > 0) {
        searchMessage.value = {
          type: 'success',
          text: `¡Encontramos ${results.length} lugares! Revisa los resultados abajo.`
        };
      } else {
        searchMessage.value = {
          type: 'warning',
          text: 'No se encontraron lugares con esos criterios. Intenta con otra ciudad o tipo de negocio.'
        };
      }
    });
  } catch (error) {
    isLoading.value = false;
    searchMessage.value = {
      type: 'error',
      text: 'Ocurrió un error durante la búsqueda. Por favor, intenta nuevamente.'
    };
  }
};

const initAutocomplete = () => {
  const center = { lat: -31.537297012068002, lng: -68.52507581988237 };
  const defaultBounds = {
    north: center.lat + 0.1,
    south: center.lat - 0.1,
    east: center.lng + 0.1,
    west: center.lng - 0.1,
  };
  
  const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: "ar" },
    fields: ["address_components", "geometry", "icon", "name"],
    strictBounds: false,
    types: ["locality"],
  };
  
  const input = document.getElementById("autocomplete");
  if (!input) return;
  
  const autocomplete = new google.maps.places.Autocomplete(input, options);
  
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    
    if (!place.geometry || !place.geometry.location) {
      cityError.value = "Por favor, selecciona una ciudad válida de la lista";
      return;
    }
    
    cityError.value = "";
    selectedCity.value = place.name;
    selectedCityLocation.value = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };
    store.setSelectedCityLocation(selectedCityLocation.value);
  });
};

const updateAutocompleteOptions = () => {
  autocompleteOptions.value = [];
  cityError.value = "";
};

onMounted(() => {
  // Esperar a que Google Maps esté cargado
  const checkGoogleMaps = () => {
    if (window.google && window.google.maps) {
      initAutocomplete();
    } else {
      setTimeout(checkGoogleMaps, 100);
    }
  };
  checkGoogleMaps();
});
</script>

<style scoped>
.search-card {
  max-width: 400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.search-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  padding: 16px 24px;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.search-btn:disabled {
  transform: none;
  box-shadow: none;
}

:deep(.v-field--variant-outlined) {
  border-radius: 12px;
}

:deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-width: 2px;
}

:deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
  --v-theme-primary: #667eea;
}
</style>
