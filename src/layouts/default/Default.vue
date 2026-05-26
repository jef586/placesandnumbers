<template>
  <div class="app-layout" :class="{ 'dark': isDark }">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    <div class="main-wrapper" :style="{ marginLeft: sidebarCollapsed ? '70px' : '260px' }">
      <Topbar :collapsed="sidebarCollapsed" @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'

const sidebarCollapsed = ref(false)
const isDark = ref(localStorage.getItem('theme') === 'dark')

const toggleDark = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

provide('isDark', isDark)
provide('toggleDark', toggleDark)

if (isDark.value) {
  document.documentElement.classList.add('dark')
}
</script>

<style scoped>
.app-layout {
  @apply min-h-screen bg-gray-50 dark:bg-[#0a0d14] transition-colors duration-300;
}

.main-wrapper {
  @apply min-h-screen transition-all duration-300 ease-in-out;
}

.main-content {
  @apply p-6 pt-[88px];
}

.page-enter-active,
.page-leave-active {
  @apply transition-all duration-300 ease-in-out;
}

.page-enter-from {
  @apply opacity-0 translate-y-4;
}

.page-leave-to {
  @apply opacity-0 -translate-y-4;
}
</style>
