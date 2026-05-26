<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <MapPin class="w-8 h-8 text-white" />
      </div>
      <h1 class="auth-title">PlaceAndNumbers</h1>
      <p class="auth-subtitle">Prospección inteligente</p>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="auth-error">{{ error }}</div>

        <div class="input-group">
          <label class="input-label">Email</label>
          <input v-model="email" type="email" placeholder="tu@email.com" class="auth-input" required />
        </div>

        <div class="input-group">
          <label class="input-label">Contraseña</label>
          <input v-model="password" type="password" placeholder="••••••••" class="auth-input" required minlength="6" />
        </div>

        <button type="submit" :disabled="loading" class="auth-btn">
          {{ loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta' }}
        </button>
      </form>

      <button @click="isLogin = !isLogin" class="auth-toggle">
        {{ isLogin ? '¿No tenés cuenta? Crear una' : '¿Ya tenés cuenta? Iniciar sesión' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { MapPin } from '@lucide/vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  if (isLogin.value) {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (authError) {
      error.value = authError.message
    } else {
      router.push('/')
    }
  } else {
    const { error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (authError) {
      error.value = authError.message
    } else {
      error.value = 'Cuenta creada. Revisá tu email para confirmar.'
    }
  }
  loading.value = false
}
</script>

<style scoped>
.auth-page {
  @apply min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0d14] p-4;
}

.auth-card {
  @apply w-full max-w-sm bg-white dark:bg-[#111827] rounded-2xl p-8;
  @apply border border-gray-100 dark:border-white/5 shadow-soft-lg;
  @apply animate-fade-in;
}

.auth-logo {
  @apply w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600;
  @apply flex items-center justify-center mx-auto mb-4;
  @apply shadow-lg shadow-blue-500/20;
}

.auth-title {
  @apply text-xl font-bold text-gray-900 dark:text-white text-center;
}

.auth-subtitle {
  @apply text-sm text-gray-500 dark:text-gray-400 text-center mb-6;
}

.auth-form {
  @apply space-y-4;
}

.input-group {
  @apply space-y-1.5;
}

.input-label {
  @apply block text-xs font-medium text-gray-500 dark:text-gray-400;
}

.auth-input {
  @apply w-full h-11 px-4 rounded-xl text-sm;
  @apply bg-gray-50 dark:bg-white/5;
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.auth-btn {
  @apply w-full h-11 rounded-xl text-sm font-medium;
  @apply bg-blue-500 text-white hover:bg-blue-600;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-all duration-200;
  @apply shadow-lg shadow-blue-500/25;
}

.auth-toggle {
  @apply w-full text-sm text-blue-500 hover:text-blue-600 text-center mt-4;
  @apply transition-colors duration-200;
}

.auth-error {
  @apply text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl;
}
</style>
