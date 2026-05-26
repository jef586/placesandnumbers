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
          class="topbar-btn"
          title="Cambiar tema"
        >
          <Sun v-if="!isDark" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>

        <div class="avatar-dropdown">
          <button class="avatar-btn">
            <div class="avatar">
              <User class="w-4 h-4" />
            </div>
            <span class="avatar-name">{{ userEmail }}</span>
          </button>
        </div>

        <button @click="$emit('logout')" class="topbar-btn" title="Cerrar sesión">
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { useAppStore } from '@/store/app'
import { Menu, Search, Sun, Moon, User, LogOut } from '@lucide/vue'

defineProps({ collapsed: Boolean })
defineEmits(['toggleSidebar', 'logout'])

const store = useAppStore()
const isDark = inject('isDark')
const toggleDark = inject('toggleDark')
const globalSearch = ref('')

const userEmail = computed(() => store.user?.email || 'Usuario')
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
  @apply text-gray-900 dark:text-white placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.topbar-right {
  @apply flex items-center gap-2;
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
  @apply text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate;
}
</style>
