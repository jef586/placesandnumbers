<template>
  <div class="emails-view">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Emails</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestión de correos electrónicos</p>
      </div>
    </div>

    <div class="empty-state">
      <Mail class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gestión de emails</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        Próximamente podrás gestionar campañas de email desde aquí.
        Por ahora, los emails detectados en los prospectos están disponibles en sus perfiles.
      </p>
    </div>
  </div>
</template>

<script setup>
import { Mail } from '@lucide/vue'
</script>

<style scoped>
.empty-state {
  @apply flex flex-col items-center justify-center py-20 text-center;
}
</style>
