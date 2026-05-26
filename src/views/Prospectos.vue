<template>
  <div class="prospectos-view">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Prospectos</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ store.prospects.length }} prospectos registrados</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filtrar prospectos..."
            class="filter-input"
          />
        </div>
      </div>
    </div>

    <div v-if="filteredProspects.length === 0" class="empty-state">
      <Users class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No hay prospectos aún</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Busca lugares y agrégalos como prospectos desde los resultados</p>
      <router-link to="/buscar" class="empty-action">
        <Search class="w-4 h-4" />
        Ir a buscar lugares
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="prospect in filteredProspects" :key="prospect.id" class="prospect-card">
        <div class="prospect-card-header">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="prospect-avatar">
                <Building2 class="w-5 h-5" />
              </div>
              <div>
                <h4 class="prospect-name">{{ prospect.name }}</h4>
                <p class="prospect-category">{{ prospect.category || 'Alojamiento' }}</p>
              </div>
            </div>
            <button @click="store.removeProspect(prospect.id)" class="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="prospect-card-body">
          <div class="flex items-center gap-2 mb-3">
            <span class="status-badge" :class="`status-${prospect.status}`">
              {{ statusLabels[prospect.status] || prospect.status }}
            </span>
            <span class="priority-badge" :class="`priority-${prospect.priority}`">
              {{ priorityLabels[prospect.priority] || prospect.priority }}
            </span>
          </div>

          <div class="prospect-info">
            <div v-if="prospect.address" class="info-row">
              <MapPin class="w-3.5 h-3.5" />
              <span>{{ prospect.address }}</span>
            </div>
            <div v-if="prospect.phone" class="info-row">
              <Phone class="w-3.5 h-3.5" />
              <span>{{ prospect.phone }}</span>
            </div>
            <div v-if="prospect.website" class="info-row">
              <Globe class="w-3.5 h-3.5" />
              <a :href="prospect.website" target="_blank" class="text-blue-500 hover:underline truncate">{{ prospect.website }}</a>
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <div class="flex items-center gap-2">
              <select
                v-model="prospect.status"
                @change="store.updateProspect(prospect.id, { status: prospect.status })"
                class="status-select"
              >
                <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
              </select>
              <select
                v-model="prospect.priority"
                @change="store.updateProspect(prospect.id, { priority: prospect.priority })"
                class="status-select"
              >
                <option v-for="(label, key) in priorityLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/store/app'
import { Users, Search, Building2, Trash2, MapPin, Phone, Globe } from '@lucide/vue'

const store = useAppStore()
const searchQuery = ref('')

const statusLabels = {
  new: 'Nuevo',
  pending: 'Pendiente',
  contacted: 'Contactado',
  interested: 'Interesado',
  closed: 'Cerrado',
}

const priorityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

const filteredProspects = computed(() => {
  if (!searchQuery.value) return store.prospects
  const q = searchQuery.value.toLowerCase()
  return store.prospects.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.address?.toLowerCase().includes(q) ||
    p.phone?.includes(q)
  )
})
</script>

<style scoped>
.filter-input {
  @apply w-64 h-10 pl-10 pr-4 rounded-xl text-sm;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white;
  @apply placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-20 text-center;
}

.empty-action {
  @apply inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium;
  @apply bg-blue-500 text-white hover:bg-blue-600;
  @apply transition-all duration-200 no-underline;
  @apply shadow-lg shadow-blue-500/25;
}

.prospect-card {
  @apply bg-white dark:bg-[#111827] rounded-2xl;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
  @apply hover:shadow-soft-lg transition-all duration-200;
  @apply animate-scale-in;
}

.prospect-card-header {
  @apply p-4 border-b border-gray-100 dark:border-white/5;
}

.prospect-avatar {
  @apply w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600;
  @apply flex items-center justify-center text-white;
}

.prospect-name {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.prospect-category {
  @apply text-xs text-gray-500;
}

.prospect-card-body {
  @apply p-4;
}

.status-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-new { @apply bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400; }
.status-pending { @apply bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400; }
.status-contacted { @apply bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400; }
.status-interested { @apply bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400; }
.status-closed { @apply bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400; }

.priority-badge {
  @apply inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium;
}

.priority-low { @apply bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400; }
.priority-medium { @apply bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400; }
.priority-high { @apply bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400; }

.prospect-info {
  @apply space-y-1.5;
}

.info-row {
  @apply flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400;
}

.status-select {
  @apply flex-1 px-2.5 py-1.5 rounded-lg text-xs;
  @apply bg-gray-50 dark:bg-white/5;
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-700 dark:text-gray-300;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20;
}
</style>
