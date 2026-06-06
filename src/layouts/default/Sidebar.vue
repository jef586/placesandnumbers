<template>
  <aside
    class="sidebar"
    :class="{ collapsed }"
  >
    <div class="sidebar-inner">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <MapPin class="w-6 h-6" />
          </div>
          <span v-show="!collapsed" class="logo-text">Place<span class="font-light">And</span><span class="font-bold">Numbers</span></span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <component :is="item.icon" class="nav-icon" />
          <span v-show="!collapsed" class="nav-label">{{ item.label }}</span>
          <span
            v-if="item.badge && !collapsed"
            class="nav-badge"
            :class="`badge-${item.badgeType}`"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="$emit('toggle')" class="collapse-btn" :title="collapsed ? 'Expandir' : 'Colapsar'">
          <PanelLeftClose v-if="!collapsed" class="w-5 h-5" />
          <PanelLeftOpen v-else class="w-5 h-5" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import {
  LayoutDashboard,
  Search,
  Users,
  Mail,
  BarChart3,
  Settings,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Pill,
  Store,
} from '@lucide/vue'

defineProps({
  collapsed: Boolean,
})

defineEmits(['toggle'])

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { path: '/buscar', label: 'Buscar Lugares', icon: Search, badge: null },
  { path: '/prospectos', label: 'Prospectos', icon: Users, badge: null },
  { path: '/relevamiento-comercial', label: 'Relevamiento Comercial', icon: Store, badge: null },
  { path: '/relevamiento-farmacias', label: 'Farmacias', icon: Pill, badge: null },
  { path: '/ai-outreach', label: 'AI Outreach', icon: Sparkles, badge: null },
  { path: '/emails', label: 'Emails', icon: Mail, badge: null },
  { path: '/estadisticas', label: 'Estadísticas', icon: BarChart3, badge: null },
  { path: '/configuracion', label: 'Configuración', icon: Settings, badge: null },
]
</script>

<style scoped>
.sidebar {
  @apply fixed left-0 top-0 h-full z-50 flex flex-col;
  @apply bg-[#0f1219] dark:bg-[#0a0d14];
  @apply border-r border-white/5;
  width: 260px;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-inner {
  @apply flex flex-col h-full py-4;
}

.sidebar-header {
  @apply px-4 pb-6 mb-2;
}

.logo {
  @apply flex items-center gap-3 overflow-hidden;
}

.logo-icon {
  @apply flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20;
}

.logo-text {
  @apply text-white text-lg whitespace-nowrap;
}

.sidebar-nav {
  @apply flex-1 px-3 space-y-1;
}

.nav-item {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium;
  @apply text-gray-400 hover:text-white hover:bg-white/5;
  @apply transition-all duration-200 ease-in-out;
  @apply cursor-pointer no-underline;
}

.nav-item.active {
  @apply text-white bg-blue-500/10 shadow-sm;
  @apply border border-blue-500/20;
}

.nav-icon {
  @apply w-5 h-5 flex-shrink-0;
}

.nav-label {
  @apply whitespace-nowrap;
}

.nav-badge {
  @apply ml-auto;
}

.sidebar-footer {
  @apply px-3 pt-4 mt-2 border-t border-white/5;
}

.collapse-btn {
  @apply w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl;
  @apply text-gray-500 hover:text-white hover:bg-white/5;
  @apply transition-all duration-200;
}

.sidebar.collapsed .collapse-btn {
  @apply justify-center;
}
</style>
