<template>
  <div v-if="!ready" class="loading-screen">
    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
      <MapPin class="w-6 h-6 text-white animate-pulse-soft" />
    </div>
  </div>

  <div v-else-if="!store.user" class="loading-screen">
    <p class="text-gray-400">Redirigiendo...</p>
  </div>

  <div v-else class="app-layout" :class="{ 'dark': isDark }">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    <div class="main-wrapper" :style="{ marginLeft: sidebarCollapsed ? '70px' : '260px' }">
      <Topbar
        :collapsed="sidebarCollapsed"
        @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
        @logout="handleLogout"
      />
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
import { ref, provide, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/app'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import { MapPin } from '@lucide/vue'

const router = useRouter()
const store = useAppStore()

const sidebarCollapsed = ref(false)
const isDark = ref(localStorage.getItem('theme') === 'dark')
const ready = ref(false)

const toggleDark = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  store.setUser(null)
  store.prospects = []
  router.push('/auth')
}

provide('isDark', isDark)
provide('toggleDark', toggleDark)

if (isDark.value) {
  document.documentElement.classList.add('dark')
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    store.setUser(session.user)
    await store.fetchProspects()
  } else {
    router.push('/auth')
    return
  }
  ready.value = true
})
</script>

<style scoped>
.loading-screen {
  @apply min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0d14];
}

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
