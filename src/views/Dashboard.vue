<template>
  <div class="dashboard">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Panel de control y métricas generales</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400 dark:text-gray-500">Última actualización: hoy</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-card-inner">
          <div class="flex items-center justify-between mb-3">
            <div class="stat-icon" :class="stat.iconBg">
              <component :is="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
            </div>
          </div>
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-label">{{ stat.label }}</p>
          <div class="stat-trend" :class="stat.trend > 0 ? 'text-emerald-500' : 'text-red-500'">
            <ArrowUp v-if="stat.trend > 0" class="w-3 h-3" />
            <ArrowDown v-else class="w-3 h-3" />
            <span>{{ Math.abs(stat.trend) }}% vs mes anterior</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Actividad Reciente</h3>
            <button class="text-sm text-blue-500 hover:text-blue-600 transition-colors">Ver todo</button>
          </div>
          <div class="card-body">
            <div v-if="recentActivity.length === 0" class="empty-state-mini">
              <Activity class="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
              <p class="text-sm text-gray-400">Sin actividad reciente</p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="(activity, i) in recentActivity" :key="i" class="activity-item">
                <div class="activity-dot" :class="activity.color"></div>
                <div class="activity-content">
                  <p class="activity-text">{{ activity.text }}</p>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Prospectos por Estado</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div v-for="item in statusBreakdown" :key="item.label" class="status-item">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <div class="status-dot" :class="item.dotClass"></div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.label }}</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.count }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :class="item.barClass" :style="{ width: item.percentage + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card mt-4">
          <div class="card-header">
            <h3 class="card-title">Acciones Rápidas</h3>
          </div>
          <div class="card-body space-y-2">
            <router-link to="/buscar" class="quick-action">
              <Search class="w-4 h-4" />
              <span>Nueva búsqueda</span>
            </router-link>
            <router-link to="/prospectos" class="quick-action">
              <Users class="w-4 h-4" />
              <span>Ver prospectos</span>
            </router-link>
            <router-link to="/emails" class="quick-action">
              <Mail class="w-4 h-4" />
              <span>Gestionar emails</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/store/app'
import {
  MapPin, Building2, Users, TrendingUp,
  ArrowUp, ArrowDown, Activity,
  Search, Mail, UserCheck,
} from '@lucide/vue'

const store = useAppStore()

onMounted(() => {
  store.initStats()
})

const stats = computed(() => [
  {
    label: 'Prospectos',
    value: store.dashboardStats.totalProspects || 0,
    icon: Users,
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    trend: 12,
  },
  {
    label: 'Alojamientos Encontrados',
    value: store.dashboardStats.accommodationsFound || 0,
    icon: Building2,
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
    trend: 8,
  },
  {
    label: 'Ciudades Analizadas',
    value: store.dashboardStats.citiesAnalyzed || 0,
    icon: MapPin,
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    trend: -3,
  },
  {
    label: 'Contactos Realizados',
    value: store.dashboardStats.contactsMade || 0,
    icon: UserCheck,
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    trend: 15,
  },
])

const recentActivity = computed(() => {
  const activities = []
  const prospects = store.prospects.slice(0, 5)
  prospects.forEach(p => {
    activities.push({
      text: `Nuevo prospecto: ${p.name}`,
      time: new Date(p.createdAt).toLocaleDateString('es-AR'),
      color: 'bg-blue-500',
    })
  })
  return activities
})

const statusBreakdown = computed(() => {
  const total = store.prospects.length || 1
  const counts = {
    new: store.prospects.filter(p => p.status === 'new').length,
    pending: store.prospects.filter(p => p.status === 'pending').length,
    contacted: store.prospects.filter(p => p.status === 'contacted').length,
    interested: store.prospects.filter(p => p.status === 'interested').length,
    closed: store.prospects.filter(p => p.status === 'closed').length,
  }
  return [
    { label: 'Nuevos', count: counts.new, percentage: (counts.new / total) * 100, dotClass: 'bg-blue-500', barClass: 'bg-blue-500' },
    { label: 'Pendientes', count: counts.pending, percentage: (counts.pending / total) * 100, dotClass: 'bg-amber-500', barClass: 'bg-amber-500' },
    { label: 'Contactados', count: counts.contacted, percentage: (counts.contacted / total) * 100, dotClass: 'bg-violet-500', barClass: 'bg-violet-500' },
    { label: 'Interesados', count: counts.interested, percentage: (counts.interested / total) * 100, dotClass: 'bg-emerald-500', barClass: 'bg-emerald-500' },
    { label: 'Cerrados', count: counts.closed, percentage: (counts.closed / total) * 100, dotClass: 'bg-gray-500', barClass: 'bg-gray-500' },
  ]
})
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5;
  @apply shadow-soft;
}

.card-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5;
}

.card-title {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.card-body {
  @apply p-6;
}

.stat-card {
  @apply animate-fade-in;
}

.stat-card-inner {
  @apply bg-white dark:bg-[#111827] rounded-2xl p-5;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
  @apply hover:shadow-soft-lg transition-all duration-200;
}

.stat-icon {
  @apply w-10 h-10 rounded-xl flex items-center justify-center;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.stat-label {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
}

.stat-trend {
  @apply flex items-center gap-1 text-xs mt-2 font-medium;
}

.empty-state-mini {
  @apply flex flex-col items-center justify-center py-8 text-center;
}

.activity-item {
  @apply flex items-start gap-3;
}

.activity-dot {
  @apply w-2 h-2 rounded-full mt-2 flex-shrink-0;
}

.activity-content {
  @apply flex-1;
}

.activity-text {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.activity-time {
  @apply text-xs text-gray-400;
}

.status-item {
  @apply animate-slide-up;
}

.status-dot {
  @apply w-2 h-2 rounded-full;
}

.progress-bar {
  @apply h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full rounded-full transition-all duration-500;
}

.quick-action {
  @apply flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium;
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white;
  @apply transition-all duration-200 no-underline;
  @apply border border-gray-100 dark:border-white/5;
}
</style>
