<template>
  <header class="topbar" :style="{ left: collapsed ? '70px' : '260px' }">
    <div class="topbar-inner">
      <div class="topbar-left">
        <button @click="$emit('toggleSidebar')" class="topbar-btn" title="Toggle sidebar">
          <Menu class="w-5 h-5" />
        </button>
        <div class="search-global">
          <Search class="search-icon" />
          <input
            v-model="globalSearch"
            type="text"
            placeholder="Buscar lugares, prospectos..."
            class="search-input"
          />
        </div>
      </div>

      <div class="topbar-right">
        <button
          @click="toggleDark"
          class="topbar-btn relative"
          title="Cambiar tema"
        >
          <Sun v-if="!isDark" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>

        <div class="notifications-btn relative">
          <button class="topbar-btn" title="Notificaciones">
            <Bell class="w-5 h-5" />
            <span class="notification-dot"></span>
          </button>
        </div>

        <div class="avatar-dropdown">
          <button class="avatar-btn">
            <div class="avatar">
              <User class="w-4 h-4" />
            </div>
            <span class="avatar-name">Usuario</span>
            <ChevronDown class="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, inject } from 'vue'
import { Menu, Search, Bell, Sun, Moon, User, ChevronDown } from '@lucide/vue'

defineProps({
  collapsed: Boolean,
})

defineEmits(['toggleSidebar'])

const isDark = inject('isDark')
const toggleDark = inject('toggleDark')
const globalSearch = ref('')
</script>

<style scoped>
.topbar {
  @apply fixed top-0 right-0 z-40 h-16;
  @apply bg-white/80 dark:bg-[#0f1219]/80;
  @apply backdrop-blur-xl border-b border-gray-100 dark:border-white/5;
  transition: left 0.3s ease;
}

.topbar-inner {
  @apply flex items-center justify-between h-full px-6;
}

.topbar-left {
  @apply flex items-center gap-4 flex-1;
}

.topbar-btn {
  @apply w-10 h-10 flex items-center justify-center rounded-xl;
  @apply text-gray-500 dark:text-gray-400;
  @apply hover:bg-gray-100 dark:hover:bg-white/5;
  @apply transition-all duration-200;
}

.search-global {
  @apply flex-1 max-w-md relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400;
}

.search-input {
  @apply w-full h-10 pl-10 pr-4 rounded-xl text-sm;
  @apply bg-gray-50 dark:bg-white/5;
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white;
  @apply placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.topbar-right {
  @apply flex items-center gap-2;
}

.notifications-btn {
  @apply relative;
}

.notification-dot {
  @apply absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500;
  @apply ring-2 ring-white dark:ring-[#0f1219];
}

.avatar-dropdown {
  @apply ml-2;
}

.avatar-btn {
  @apply flex items-center gap-2 px-3 py-2 rounded-xl;
  @apply hover:bg-gray-100 dark:hover:bg-white/5;
  @apply transition-all duration-200;
}

.avatar {
  @apply w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600;
  @apply flex items-center justify-center text-white;
}

.avatar-name {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

</style>
