<template>
  <div class="results-panel">
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <List class="w-5 h-5 text-blue-500" />
            <h3 class="card-title">Resultados</h3>
          </div>
          <span v-if="results.length > 0" class="results-count">
            {{ results.length }}
          </span>
        </div>
      </div>

      <div class="card-body p-0">
        <div v-if="results.length === 0" class="empty-state">
          <MapPin class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Realiza una búsqueda para ver resultados</p>
        </div>

        <div v-else class="results-list scrollbar-thin">
          <div
            v-for="result in results"
            :key="result.placeId"
            class="result-card"
            :class="{ selected: store.selectedLocationName === result.name }"
            @click="selectResult(result)"
          >
            <div class="result-card-inner">
              <div class="result-header">
                <div class="result-avatar">
                  <Building2 class="w-4 h-4" />
                </div>
                <div class="result-info">
                  <h4 class="result-name">{{ result.name }}</h4>
                  <span class="result-category">{{ businessTypeLabel }}</span>
                </div>
                <div v-if="result.rating" class="result-rating">
                  <Star class="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{{ result.rating }}</span>
                </div>
              </div>

              <div class="result-details">
                <div v-if="result.address" class="detail-row">
                  <MapPin class="w-3 h-3" />
                  <span>{{ result.address }}</span>
                </div>
                <div v-if="result.phoneNumber" class="detail-row">
                  <Phone class="w-3 h-3" />
                  <span>{{ result.phoneNumber }}</span>
                </div>
              </div>

              <div class="result-badges">
                <span v-if="result.website" class="badge badge-success">
                  <Globe class="w-3 h-3 mr-1" />
                  Tiene web
                </span>
                <span v-else class="badge badge-neutral">
                  <Globe class="w-3 h-3 mr-1" />
                  Sin web
                </span>
                <span v-if="result.rating && result.rating >= 4" class="badge badge-info">
                  Oportunidad alta
                </span>
              </div>

              <div class="result-actions">
                <a
                  v-if="result.website"
                  :href="result.website"
                  target="_blank"
                  class="action-btn secondary"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                  Web
                </a>
                <button
                  @click.stop="openWhatsApp(result)"
                  class="action-btn secondary"
                >
                  <MessageCircle class="w-3.5 h-3.5" />
                  WhatsApp
                </button>
                <button
                  @click.stop="addToProspects(result)"
                  class="action-btn primary"
                  :disabled="isProspectAdded(result)"
                >
                  <UserPlus class="w-3.5 h-3.5" />
                  {{ isProspectAdded(result) ? 'Agregado' : 'Prospecto' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import { useWhatsApp } from '@/composables/useWhatsApp'
import {
  List, MapPin, Building2, Star, Phone, Globe,
  ExternalLink, MessageCircle, UserPlus,
} from '@lucide/vue'

const store = useAppStore()

const results = computed(() => store.searchResults)

const businessTypeLabel = computed(() => {
  const type = store.currentSearchParams.type
  const labels = {
    lodging: 'Hotel/Alojamiento',
    hostel: 'Hostel',
    cabin: 'Cabañas',
    apartment: 'Apart Hotel',
    campground: 'Camping',
    restaurant: 'Restaurante',
    cafe: 'Café',
    bar: 'Bar',
  }
  return labels[type] || 'Alojamiento'
})

const selectResult = (result) => {
  if (result.location) {
    store.center = {
      lat: result.location.lat,
      lng: result.location.lng,
    }
    store.setSelectedLocationName(result.name)
  }
}

const isProspectAdded = (result) => {
  return store.prospects.some(p => p.placeId === result.placeId)
}

const addToProspects = (result) => {
  store.addProspect({
    placeId: result.placeId,
    name: result.name,
    category: businessTypeLabel.value,
    address: result.address,
    phone: result.phoneNumber,
    website: result.website,
    rating: result.rating,
    city: store.currentSearchParams.city,
  })
}

const { openWhatsApp } = useWhatsApp()
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-[#111827] rounded-2xl;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.card-header {
  @apply px-5 py-4 border-b border-gray-100 dark:border-white/5 flex-shrink-0;
}

.card-title {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.card-body {
  @apply flex-1 overflow-hidden;
}

.results-count {
  @apply inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold;
  @apply bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.results-list {
  @apply overflow-y-auto max-h-[500px];
}

.result-card {
  @apply border-b border-gray-50 dark:border-white/5 cursor-pointer;
  @apply transition-all duration-200;
}

.result-card:hover {
  @apply bg-gray-50 dark:bg-white/[0.02];
}

.result-card.selected {
  @apply bg-blue-50/50 dark:bg-blue-500/5;
}

.result-card-inner {
  @apply p-4;
}

.result-header {
  @apply flex items-start gap-3;
}

.result-avatar {
  @apply w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600;
  @apply flex items-center justify-center text-white flex-shrink-0;
}

.result-info {
  @apply flex-1 min-w-0;
}

.result-name {
  @apply text-sm font-semibold text-gray-900 dark:text-white truncate;
}

.result-category {
  @apply text-xs text-gray-500;
}

.result-rating {
  @apply flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 flex-shrink-0;
}

.result-details {
  @apply mt-2 ml-12 space-y-1;
}

.detail-row {
  @apply flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400;
}

.result-badges {
  @apply mt-2 ml-12 flex items-center gap-2;
}

.result-actions {
  @apply mt-3 ml-12 flex items-center gap-2;
}

.action-btn {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium;
  @apply transition-all duration-200;
}

.action-btn.secondary {
  @apply bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-100 dark:hover:bg-white/10;
  @apply no-underline;
}

.action-btn.primary {
  @apply bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400;
  @apply hover:bg-blue-100 dark:hover:bg-blue-500/20;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
