<template>
  <div class="buscar-view">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Buscar Lugares</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Encuentra alojamientos y comercios en cualquier ciudad</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div class="xl:col-span-4 space-y-4">
        <SearchPremium />
        <ResultsPanel />
      </div>
      <div class="xl:col-span-8">
        <MapsPremium />
      </div>
    </div>
  </div>
</template>

<script setup>
import SearchPremium from '@/components/SearchPremium.vue'
import ResultsPanel from '@/components/ResultsPanel.vue'
import MapsPremium from '@/components/MapsPremium.vue'
</script>
