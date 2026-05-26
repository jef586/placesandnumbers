<template>
  <div class="configuracion-view">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Ajustes de la aplicación</p>
      </div>
    </div>

    <div class="max-w-2xl space-y-6">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Preferencias</h3>
        </div>
        <div class="card-body space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Tema Oscuro</p>
              <p class="text-xs text-gray-500">Cambiar entre tema claro y oscuro</p>
            </div>
            <button
              @click="toggleDark()"
              class="theme-toggle"
              :class="{ active: isDark }"
            >
              <Sun v-if="!isDark" class="w-4 h-4" />
              <Moon v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Acerca de</h3>
        </div>
        <div class="card-body">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            PlaceAndNumbers v1.0 - Herramienta de prospección comercial inteligente.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { Sun, Moon } from '@lucide/vue'

const isDark = inject('isDark')
const toggleDark = inject('toggleDark')
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-[#111827] rounded-2xl;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-100 dark:border-white/5;
}

.card-title {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.card-body {
  @apply p-6;
}

.theme-toggle {
  @apply w-10 h-10 rounded-xl flex items-center justify-center;
  @apply bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400;
  @apply hover:bg-gray-200 dark:hover:bg-white/10;
  @apply transition-all duration-200;
}

.theme-toggle.active {
  @apply bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400;
}
</style>
