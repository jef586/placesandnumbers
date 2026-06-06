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
              <div class="relative" ref="dropdownRef">
                <button
                  type="button"
                  @click="toggleDropdown"
                  class="form-input pl-10 pr-10 flex items-center justify-between cursor-pointer"
                >
                  <span class="flex items-center gap-2 truncate">
                    <component :is="getIcon(selectedOption?.icon)" class="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span class="text-sm" :class="selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400'">
                      {{ selectedOption?.label || 'Selecciona categoría' }}
                    </span>
                  </span>
                  <ChevronDown class="w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0" :class="{ 'rotate-180': showDropdown }" />
                </button>

                <transition name="dropdown-fade">
                  <div v-if="showDropdown" class="dropdown-panel">
                    <div class="p-2 border-b border-gray-100 dark:border-white/10">
                      <div class="relative">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                          v-model="searchQuery"
                          type="text"
                          placeholder="Buscar categoría..."
                          class="dropdown-search"
                          @click.stop
                        />
                        <button
                          v-if="searchQuery"
                          type="button"
                          @click.stop="searchQuery = ''"
                          class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div class="dropdown-list">
                      <template v-for="group in filteredGroups" :key="group.name">
                        <div class="group-header">
                          <span class="mr-1.5">{{ group.icon }}</span>
                          {{ group.name }}
                        </div>
                        <button
                          v-for="item in group.items"
                          :key="item.value"
                          type="button"
                          @click.stop="selectOption(item)"
                          class="option-item"
                          :class="{ 'option-active': businessType === item.value }"
                        >
                          <component :is="getIcon(item.icon)" class="w-4 h-4 flex-shrink-0" :class="businessType === item.value ? 'text-blue-500' : 'text-gray-400'" />
                          <span class="text-sm truncate">{{ item.label }}</span>
                          <Check v-if="businessType === item.value" class="w-3.5 h-3.5 text-blue-500 ml-auto flex-shrink-0" />
                        </button>
                      </template>
                      <div v-if="filteredGroups.length === 0" class="p-6 text-center text-sm text-gray-400">
                        Sin resultados para "{{ searchQuery }}"
                      </div>
                    </div>
                  </div>
                </transition>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/app'
import { initSearch } from '@/composables/maps'
import {
  Search, MapPin, Building2, ChevronDown, Loader2, CheckCircle, AlertCircle, Info,
  X, Check, Tent, UtensilsCrossed, Coffee, Wine, Pill,
  ShoppingCart, Store, Wrench, Warehouse, Truck, Heart,
  BookOpen, Settings, Zap, Paintbrush, Monitor, Gift,
  Apple, SprayCan, Gamepad2, Shirt, PartyPopper, Sofa,
  Bed, Bike, Radio,
} from '@lucide/vue'

const route = useRoute()
const store = useAppStore()
const selectedCity = ref('')
const businessType = ref('')
const isLoading = ref(false)
const searchMessage = ref(null)
const cityError = ref('')
const showDropdown = ref(false)
const searchQuery = ref('')
const dropdownRef = ref(null)

const emit = defineEmits(['search-started', 'search-complete'])

const categoryGroups = [
  {
    name: 'Turismo',
    icon: '\u{1F3E8}',
    items: [
      { label: 'Hotel', value: 'hotel', icon: 'Building2', categoryGroup: 'tourism', googleType: 'lodging' },
      { label: 'Hostel', value: 'hostel', icon: 'Building2', categoryGroup: 'tourism', googleType: 'hostel' },
      { label: 'Caba\u00f1as', value: 'caba\u00f1as', icon: 'Building2', categoryGroup: 'tourism' },
      { label: 'Apart Hotel', value: 'apart-hotel', icon: 'Building2', categoryGroup: 'tourism' },
      { label: 'Camping', value: 'camping', icon: 'Tent', categoryGroup: 'tourism', googleType: 'campground' },
      { label: 'Alojamiento', value: 'alojamiento', icon: 'Building2', categoryGroup: 'tourism', googleType: 'lodging' },
    ],
  },
  {
    name: 'Gastronom\u00eda',
    icon: '\u{1F37D}',
    items: [
      { label: 'Restaurante', value: 'restaurante', icon: 'UtensilsCrossed', categoryGroup: 'tourism', googleType: 'restaurant' },
      { label: 'Caf\u00e9', value: 'cafe', icon: 'Coffee', categoryGroup: 'tourism', googleType: 'cafe' },
      { label: 'Bar', value: 'bar', icon: 'Wine', categoryGroup: 'tourism', googleType: 'bar' },
    ],
  },
  {
    name: 'Farmacias',
    icon: '\u{1F48A}',
    items: [
      { label: 'Farmacia', value: 'pharmacy', icon: 'Pill', categoryGroup: 'pharmacy', googleType: 'pharmacy' },
    ],
  },
  {
    name: 'Negocios para Facturaci\u00f3n',
    icon: '\u{1F9FE}',
    items: [
      { label: 'Supermercado', value: 'supermercado', icon: 'ShoppingCart', categoryGroup: 'commercial', googleType: 'supermarket' },
      { label: 'Mercado', value: 'mercado', icon: 'Store', categoryGroup: 'commercial' },
      { label: 'Autoservicio', value: 'autoservicio', icon: 'Store', categoryGroup: 'commercial' },
      { label: 'Almac\u00e9n', value: 'almacen', icon: 'Store', categoryGroup: 'commercial' },
      { label: 'Kiosco', value: 'kiosco', icon: 'Store', categoryGroup: 'commercial' },
      { label: 'Ferreter\u00eda', value: 'ferreteria', icon: 'Wrench', categoryGroup: 'commercial', googleType: 'hardware_store' },
      { label: 'Corral\u00f3n', value: 'corralon', icon: 'Warehouse', categoryGroup: 'commercial' },
      { label: 'Distribuidora', value: 'distribuidora', icon: 'Truck', categoryGroup: 'commercial' },
      { label: 'Veterinaria', value: 'veterinaria', icon: 'Heart', categoryGroup: 'commercial', googleType: 'veterinary_care' },
      { label: 'Librer\u00eda', value: 'libreria', icon: 'BookOpen', categoryGroup: 'commercial', googleType: 'book_store' },
      { label: 'Casa de repuestos', value: 'repuestos', icon: 'Settings', categoryGroup: 'commercial' },
      { label: 'Casa de electricidad', value: 'electricidad', icon: 'Zap', categoryGroup: 'commercial' },
      { label: 'Pinturer\u00eda', value: 'pintureria', icon: 'Paintbrush', categoryGroup: 'commercial' },
      { label: 'Casa de computaci\u00f3n', value: 'computacion', icon: 'Monitor', categoryGroup: 'commercial' },
      { label: 'Electr\u00f3nica', value: 'electronica', icon: 'Radio', categoryGroup: 'commercial', googleType: 'electronics_store' },
      { label: 'Bazar', value: 'bazar', icon: 'Gift', categoryGroup: 'commercial' },
      { label: 'Diet\u00e9tica', value: 'dietetica', icon: 'Apple', categoryGroup: 'commercial' },
      { label: 'Perfumer\u00eda', value: 'perfumeria', icon: 'SprayCan', categoryGroup: 'commercial' },
      { label: 'Pet Shop', value: 'pet-shop', icon: 'Heart', categoryGroup: 'commercial', googleType: 'pet_store' },
      { label: 'Jugueter\u00eda', value: 'jugueteria', icon: 'Gamepad2', categoryGroup: 'commercial' },
      { label: 'Indumentaria', value: 'indumentaria', icon: 'Shirt', categoryGroup: 'commercial' },
      { label: 'Zapater\u00eda', value: 'zapateria', icon: 'Store', categoryGroup: 'commercial', googleType: 'shoe_store' },
      { label: 'Cotill\u00f3n', value: 'cotillon', icon: 'PartyPopper', categoryGroup: 'commercial' },
      { label: 'Regaler\u00eda', value: 'regaleria', icon: 'Gift', categoryGroup: 'commercial' },
      { label: 'Muebler\u00eda', value: 'muebleria', icon: 'Sofa', categoryGroup: 'commercial', googleType: 'furniture_store' },
      { label: 'Colchoner\u00eda', value: 'colchoneria', icon: 'Bed', categoryGroup: 'commercial' },
      { label: 'Bicicleter\u00eda', value: 'bicicleteria', icon: 'Bike', categoryGroup: 'commercial', googleType: 'bicycle_store' },
    ],
  },
]

const iconMap = {
  Building2, Tent, UtensilsCrossed, Coffee, Wine, Pill,
  ShoppingCart, Store, Wrench, Warehouse, Truck, Heart,
  BookOpen, Settings, Zap, Paintbrush, Monitor, Gift,
  Apple, SprayCan, Gamepad2, Shirt, PartyPopper, Sofa,
  Bed, Bike, Radio,
}

function getIcon(name) {
  return iconMap[name] || Building2
}

const allOptions = computed(() => {
  const items = []
  for (const group of categoryGroups) {
    for (const item of group.items) {
      items.push(item)
    }
  }
  return items
})

const selectedOption = computed(() => {
  if (!businessType.value) return null
  return allOptions.value.find(o => o.value === businessType.value) || null
})

const filteredGroups = computed(() => {
  if (!searchQuery.value) return categoryGroups
  const q = searchQuery.value.toLowerCase()
  const normalized = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return categoryGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        const label = item.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return label.includes(normalized)
      }),
    }))
    .filter(group => group.items.length > 0)
})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    searchQuery.value = ''
  }
}

function selectOption(item) {
  businessType.value = item.value
  showDropdown.value = false
  searchQuery.value = ''
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false
    searchQuery.value = ''
  }
}

watch(showDropdown, (val) => {
  if (val) {
    document.addEventListener('mousedown', handleClickOutside)
  } else {
    document.removeEventListener('mousedown', handleClickOutside)
  }
})

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

  const currentOption = selectedOption.value

  try {
    searchMessage.value = {
      type: 'info',
      text: `Buscando ${currentOption?.label || businessType.value} en ${selectedCity.value}...`,
    }

    store.setCurrentSearchParams({
      city: selectedCity.value,
      type: businessType.value,
      categoryGroup: currentOption?.categoryGroup || '',
    })

    initSearch(selectedCity.value, businessType.value, async (results) => {
      store.setSearchResults(results)
      isLoading.value = false

      if (results && results.length > 0) {
        searchMessage.value = {
          type: 'success',
          text: `\u00a1Encontramos ${results.length} lugares!`,
        }
        await store.saveSearch(selectedCity.value, businessType.value, results.length)
      } else {
        searchMessage.value = {
          type: 'warning',
          text: 'No se encontraron lugares. Intenta con otra ciudad o categor\u00eda.',
        }
      }
      emit('search-complete', results)
    }, store.selectedCityLocation, currentOption?.googleType || null)
  } catch (error) {
    isLoading.value = false
    searchMessage.value = {
      type: 'error',
      text: 'Ocurri\u00f3 un error durante la b\u00fasqueda.',
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
      cityError.value = 'Selecciona una ciudad v\u00e1lida de la lista'
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
  if (route.query.tipo) {
    businessType.value = route.query.tipo
  }

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

.dropdown-panel {
  @apply absolute z-50 mt-1 w-full;
  @apply bg-white dark:bg-[#1a1f2e];
  @apply border border-gray-200 dark:border-white/10;
  @apply rounded-xl shadow-lg;
  @apply overflow-hidden;
}

.dropdown-search {
  @apply w-full h-9 pl-8 pr-8 rounded-lg text-sm;
  @apply bg-gray-50 dark:bg-white/5;
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.dropdown-list {
  @apply max-h-64 overflow-y-auto;
}

.group-header {
  @apply px-3 py-1.5 text-xs font-semibold uppercase tracking-wider;
  @apply text-gray-500 dark:text-gray-400;
  @apply bg-gray-50 dark:bg-white/[0.02];
  @apply sticky top-0;
}

.option-item {
  @apply w-full flex items-center gap-2.5 px-3 py-2.5 text-left;
  @apply text-gray-700 dark:text-gray-300;
  @apply hover:bg-gray-50 dark:hover:bg-white/[0.04];
  @apply transition-colors duration-150;
}

.option-active {
  @apply bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300;
}

.fade-enter-active, .fade-leave-active {
  @apply transition-all duration-300;
}

.fade-enter-from, .fade-leave-to {
  @apply opacity-0 translate-y-2;
}

.dropdown-fade-enter-active, .dropdown-fade-leave-active {
  @apply transition-all duration-200;
}

.dropdown-fade-enter-from, .dropdown-fade-leave-to {
  @apply opacity-0 -translate-y-1;
}
</style>
