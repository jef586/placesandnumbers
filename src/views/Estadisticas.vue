<template>
  <div class="estadisticas-view">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Estadísticas</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Análisis detallado de datos</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>

    <div class="empty-state">
      <BarChart3 class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Más estadísticas próximamente</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Los gráficos detallados y análisis avanzados estarán disponibles pronto.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import { BarChart3 } from '@lucide/vue'

const store = useAppStore()

const stats = computed(() => [
  { label: 'Total Prospectos', value: store.prospects.length },
  { label: 'Contactados', value: store.prospects.filter(p => p.contactMade).length },
  { label: 'Interesados', value: store.prospects.filter(p => p.status === 'interested').length },
  { label: 'Cerrados', value: store.prospects.filter(p => p.status === 'closed').length },
])
</script>

<style scoped>
.stat-card {
  @apply bg-white dark:bg-[#111827] rounded-2xl p-5;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.stat-label {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-20 text-center;
}
</style>
