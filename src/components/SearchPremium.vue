<template>
  <div class="search-premium">
    <div class="card">
      <div class="card-header">
        <div class="flex items-center gap-2">
          <Search class="w-5 h-5 text-blue-500" />
          <h3 class="card-title">Buscar Lugares</h3>
        </div>
      </div>

      <div class="card-body">
        <form @submit.prevent="handleSearch">
          <div class="space-y-4">
            <div class="input-group">
              <label class="input-label">Ciudad</label>
              <div class="relative">
                <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="autocomplete"
                  v-model="selectedCity"
                  type="text"
                  placeholder="Ej: Buenos Aires, Mendoza..."
                  class="form-input pl-10"
                  @input="cityError = ''"
                />
              </div>
              <p v-if="cityError" class="input-error">{{ cityError }}</p>
            </div>

            <div class="input-group">
              <label class="input-label">Tipo de lugar</label>
              <div class="relative">
                <Building2 class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  v-model="businessType"
                  class="form-input pl-10 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Selecciona categoría</option>
                  <option v-for="opt in options" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              :disabled="!selectedCity || !businessType || isLoading"
              class="search-submit"
            >
              <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
              <Search v-else class="w-4 h-4" />
              {{ isLoading ? 'Buscando...' : 'Buscar Lugares' }}
            </button>
          </div>
        </form>

        <transition name="fade">
          <div v-if="searchMessage" class="mt-4 p-3 rounded-xl text-sm" :class="messageClass">
            <component :is="messageIcon" class="w-4 h-4 inline-block mr-2" />
            {{ searchMessage.text }}
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/store/app'
import { initSearch } from '@/composables/maps'
import { Search, MapPin, Building2, ChevronDown, Loader2, CheckCircle, AlertCircle, Info } from '@lucide/vue'

const store = useAppStore()
const selectedCity = ref('')
const businessType = ref('')
const isLoading = ref(false)
const searchMessage = ref(null)
const cityError = ref('')

const emit = defineEmits(['search-started', 'search-complete'])

const options = [
  { label: 'Hotel', value: 'lodging' },
  { label: 'Hostel', value: 'hostel' },
  { label: 'Cabañas', value: 'cabin' },
  { label: 'Apart Hotel', value: 'apartment' },
  { label: 'Camping', value: 'campground' },
  { label: 'Alojamiento', value: 'lodging' },
  { label: 'Restaurante', value: 'restaurant' },
  { label: 'Café', value: 'cafe' },
  { label: 'Bar', value: 'bar' },
]

const messageClass = computed(() => ({
  'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': searchMessage.value?.type === 'info',
  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': searchMessage.value?.type === 'success',
  'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400': searchMessage.value?.type === 'error',
  'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': searchMessage.value?.type === 'warning',
}))

const messageIcon = computed(() => {
  switch (searchMessage.value?.type) {
    case 'success': return CheckCircle
    case 'error': return AlertCircle
    default: return Info
  }
})

const handleSearch = async () => {
  if (!selectedCity.value || !businessType.value) return

  isLoading.value = true
  searchMessage.value = null
  cityError.value = ''
  emit('search-started')

  try {
    searchMessage.value = {
      type: 'info',
      text: `Buscando ${options.find(o => o.value === businessType.value)?.label} en ${selectedCity.value}...`,
    }

    store.setCurrentSearchParams({ city: selectedCity.value, type: businessType.value })

    initSearch(selectedCity.value, businessType.value, async (results) => {
      store.setSearchResults(results)
      isLoading.value = false

      if (results && results.length > 0) {
        searchMessage.value = {
          type: 'success',
          text: `¡Encontramos ${results.length} lugares!`,
        }
        await store.saveSearch(selectedCity.value, businessType.value, results.length)
      } else {
        searchMessage.value = {
          type: 'warning',
          text: 'No se encontraron lugares. Intenta con otra ciudad o categoría.',
        }
      }
      emit('search-complete', results)
    }, store.selectedCityLocation)
  } catch (error) {
    isLoading.value = false
    searchMessage.value = {
      type: 'error',
      text: 'Ocurrió un error durante la búsqueda.',
    }
  }
}

const initAutocomplete = () => {
  const center = { lat: -31.537297012068002, lng: -68.52507581988237 }
  const defaultBounds = {
    north: center.lat + 0.1, south: center.lat - 0.1,
    east: center.lng + 0.1, west: center.lng - 0.1,
  }

  const input = document.getElementById('autocomplete')
  if (!input) return

  const autocomplete = new google.maps.places.Autocomplete(input, {
    bounds: defaultBounds,
    componentRestrictions: { country: 'ar' },
    fields: ['address_components', 'geometry', 'icon', 'name'],
    strictBounds: false,
    types: ['locality'],
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place.geometry || !place.geometry.location) {
      cityError.value = 'Selecciona una ciudad válida de la lista'
      return
    }
    cityError.value = ''
    selectedCity.value = place.name
    store.setSelectedCityLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    })
  })
}

onMounted(() => {
  const checkGoogleMaps = () => {
    if (window.google && window.google.maps) {
      initAutocomplete()
    } else {
      setTimeout(checkGoogleMaps, 100)
    }
  }
  checkGoogleMaps()
})
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-[#111827] rounded-2xl;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
}

.card-header {
  @apply px-5 py-4 border-b border-gray-100 dark:border-white/5;
}

.card-title {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.card-body {
  @apply p-5;
}

.input-group {
  @apply space-y-1.5;
}

.input-label {
  @apply block text-xs font-medium text-gray-500 dark:text-gray-400;
}

.form-input {
  @apply w-full h-11 rounded-xl text-sm;
  @apply bg-gray-50 dark:bg-white/5;
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.input-error {
  @apply text-xs text-red-500 mt-1;
}

.search-submit {
  @apply w-full h-11 rounded-xl text-sm font-medium;
  @apply bg-blue-500 text-white;
  @apply hover:bg-blue-600 active:bg-blue-700;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply flex items-center justify-center gap-2;
  @apply transition-all duration-200;
  @apply shadow-lg shadow-blue-500/25;
}

.fade-enter-active, .fade-leave-active {
  @apply transition-all duration-300;
}

.fade-enter-from, .fade-leave-to {
  @apply opacity-0 translate-y-2;
}
</style>
