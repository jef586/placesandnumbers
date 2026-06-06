<template>
  <div class="ai-outreach">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">AI Outreach Generator</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Genera mensajes personalizados con IA para tus prospectos
        </p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-5 h-[calc(100vh-200px)]">
      <aside class="lg:w-80 xl:w-96 flex-shrink-0">
        <div class="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 shadow-soft h-full flex flex-col">
          <div class="p-4 border-b border-gray-100 dark:border-white/5">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar prospecto..."
                class="w-full h-10 pl-10 pr-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1 custom-scroll">
            <div v-if="filteredProspects.length === 0" class="flex flex-col items-center justify-center py-12 text-center px-4">
              <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Users class="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No hay prospectos</p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">Buscá lugares y guardalos como prospectos</p>
              <router-link to="/buscar" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors no-underline">
                <Search class="w-3 h-3" /> Buscar lugares
              </router-link>
            </div>

            <button
              v-for="p in filteredProspects"
              :key="p.id || p.place_id"
              @click="selectProspect(p)"
              class="w-full text-left p-3 rounded-xl transition-all duration-200"
              :class="selectedProspect?.id === p.id || selectedProspect?.place_id === p.place_id
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  :class="`bg-gradient-to-br ${avatarGradient(p)}`">
                  {{ p.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ p.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ p.category || p.city || 'Sin categoría' }}</p>
                </div>
                <div v-if="p.rating" class="flex items-center gap-1 text-xs text-amber-500 flex-shrink-0">
                  <Star class="w-3 h-3" />
                  <span>{{ p.rating }}</span>
                </div>
              </div>
            </button>
          </div>

          <div class="p-3 border-t border-gray-100 dark:border-white/5 text-xs text-gray-400 text-center">
            {{ prospects.length }} prospectos
          </div>
        </div>
      </aside>

      <main class="flex-1 min-h-0">
        <div v-if="!selectedProspect" class="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 shadow-soft h-full flex flex-col items-center justify-center text-center p-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mb-4">
            <Sparkles class="w-8 h-8 text-blue-500" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generador de mensajes IA</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Seleccioná un prospecto de la lista para generar mensajes personalizados con IA para WhatsApp, Email e Instagram.
          </p>
        </div>

        <div v-else class="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 shadow-soft h-full flex flex-col overflow-hidden">
          <div class="p-5 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                  :class="`bg-gradient-to-br ${avatarGradient(selectedProspect)}`">
                  {{ selectedProspect.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div class="min-w-0">
                  <h2 class="text-lg font-bold text-gray-900 dark:text-white truncate">{{ selectedProspect.name }}</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedProspect.category || selectedProspect.city || 'Sin categoría' }}</p>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mt-3">
              <span v-if="analysisResult?.hasWebsite" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Globe class="w-3 h-3" /> Sitio web
              </span>
              <span v-if="analysisResult && !analysisResult.hasWebsite" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <Globe class="w-3 h-3" /> Sin sitio web
              </span>
              <span v-if="analysisResult?.hasHttps" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Lock class="w-3 h-3" /> HTTPS
              </span>
              <span v-if="analysisResult && analysisResult.hasWebsite && !analysisResult.hasHttps" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <Unlock class="w-3 h-3" /> Sin HTTPS
              </span>
              <span v-if="analysisResult?.looksOld" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                <Clock class="w-3 h-3" /> Sitio antiguo
              </span>
              <span v-if="selectedProspect?.rating" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <Star class="w-3 h-3" /> {{ selectedProspect.rating }}
              </span>
            </div>

            <div v-if="analysisResult" class="flex flex-wrap gap-1.5 mt-2">
              <span
                v-for="note in analysisResult.analysisNotes"
                :key="note"
                class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-full"
              >
                {{ note }}
              </span>
            </div>
          </div>

          <div class="p-5 flex-shrink-0 border-b border-gray-100 dark:border-white/5">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Tono:</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="t in tones"
                :key="t.key"
                @click="selectedTone = t.key"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border"
                :class="selectedTone === t.key
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                  : 'bg-white dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-[#222738]'"
              >
                {{ t.label }}
              </button>
            </div>

            <button
              @click="generate"
              :disabled="generating"
              class="mt-4 w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
              :class="generating
                ? 'bg-blue-400 dark:bg-blue-600/50 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-blue-500/10 active:scale-[0.98]'"
            >
              <Loader2 v-if="generating" class="w-4 h-4 animate-spin" />
              <Sparkles v-else class="w-4 h-4" />
              {{ generating ? 'Generando mensajes...' : (generatedResult ? 'Regenerar mensajes' : 'Generar mensaje IA') }}
            </button>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
            <div v-if="generating" class="space-y-4">
              <div v-for="i in 4" :key="i" class="rounded-xl border border-gray-100 dark:border-white/5 p-4">
                <div class="skeleton h-4 w-32 rounded mb-3"></div>
                <div class="skeleton h-3 w-full rounded mb-2"></div>
                <div class="skeleton h-3 w-3/4 rounded mb-2"></div>
                <div class="skeleton h-3 w-1/2 rounded"></div>
              </div>
            </div>

            <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-center">
              <div class="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertCircle class="w-7 h-7 text-red-400" />
              </div>
              <p class="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Error al generar mensajes</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-xs">{{ error }}</p>
              <button @click="generate" class="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25">
                Reintentar
              </button>
            </div>

            <div v-else-if="generatedResult" class="space-y-4">
              <div
                v-for="msg in messages"
                :key="msg.key"
                class="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden group"
              >
                <div class="px-4 py-3 bg-gray-50 dark:bg-white/5 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                  <div class="flex items-center gap-2">
                    <component :is="msg.icon" class="w-4 h-4" :class="msg.color" />
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ msg.label }}</span>
                    <span v-if="msg.badge" class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400">{{ msg.badge }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button
                      @click="copyMessage(msg.key)"
                      class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                      title="Copiar"
                    >
                      <Check v-if="copiedKey === msg.key" class="w-4 h-4 text-emerald-500" />
                      <Copy v-else class="w-4 h-4" />
                    </button>
                    <button
                      v-if="msg.action"
                      @click="msg.action()"
                      class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                      :title="msg.actionLabel"
                    >
                      <component :is="msg.actionIcon" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="px-4 py-3">
                  <p v-if="msg.key === 'email_formal'" class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    <span class="font-semibold text-blue-600 dark:text-blue-400">{{ emailSubject }}</span><br><br>{{ emailBody }}
                  </p>
                  <p v-else class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {{ generatedResult.messages[msg.key] }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-10 text-center">
              <MessageSquare class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p class="text-sm text-gray-500 dark:text-gray-400">Presioná "Generar mensaje IA" para comenzar</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCrm } from '@/composables/useCrm'
import { useWhatsApp } from '@/composables/useWhatsApp'
import { generateMessages, analyzeProspect } from '@/services/ai'
import {
  Search, Users, Sparkles, Star, Globe, Lock, Unlock, Clock,
  MessageCircle, Mail, MessageSquare, Loader2, Copy, Check,
  AlertCircle, Send,
} from '@lucide/vue'

const route = useRoute()
const crm = reactive(useCrm())
const { getPhone, normalizePhone } = useWhatsApp()

const searchQuery = ref('')
const selectedProspect = ref(null)
const selectedTone = ref('casual')
const generating = ref(false)
const generatedResult = ref(null)
const error = ref('')
const copiedKey = ref('')

const tones = [
  { key: 'casual', label: 'Casual' },
  { key: 'professional', label: 'Profesional' },
  { key: 'seller', label: 'Vendedor' },
  { key: 'technical', label: 'Técnico' },
]

const analysisResult = computed(() => {
  if (!selectedProspect.value) return null
  return analyzeProspect(selectedProspect.value)
})

const prospects = computed(() => (crm.prospects || []).filter(Boolean))

const filteredProspects = computed(() => {
  if (!searchQuery.value) return prospects.value
  const q = searchQuery.value.toLowerCase()
  return prospects.value.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q) ||
    p.city?.toLowerCase().includes(q) ||
    p.phone?.includes(q)
  )
})

const emailSubject = computed(() => {
  if (!generatedResult.value) return ''
  const email = generatedResult.value.messages.email_formal || ''
  const parts = email.split('|')
  return parts.length > 1 ? parts[0].trim() : ''
})

const emailBody = computed(() => {
  if (!generatedResult.value) return ''
  const email = generatedResult.value.messages.email_formal || ''
  const parts = email.split('|')
  return parts.length > 1 ? parts.slice(1).join('|').trim() : email
})

const messages = computed(() => {
  if (!generatedResult.value) return []

  return [
    {
      key: 'whatsapp_corto',
      label: 'WhatsApp Corto',
      icon: MessageCircle,
      color: 'text-emerald-500',
      badge: 'Directo',
      action: () => openWp(selectedProspect.value, 'whatsapp_corto'),
      actionLabel: 'Abrir WhatsApp',
      actionIcon: Send,
    },
    {
      key: 'whatsapp_profesional',
      label: 'WhatsApp Profesional',
      icon: MessageCircle,
      color: 'text-emerald-600',
      badge: 'Detallado',
      action: () => openWp(selectedProspect.value, 'whatsapp_profesional'),
      actionLabel: 'Abrir WhatsApp',
      actionIcon: Send,
    },
    {
      key: 'email_formal',
      label: 'Email Formal',
      icon: Mail,
      color: 'text-blue-500',
      badge: null,
      action: () => copyMessage('email_formal'),
      actionLabel: 'Copiar email',
      actionIcon: Copy,
    },
    {
      key: 'instagram_dm',
      label: 'Instagram DM',
      icon: MessageSquare,
      color: 'text-pink-500',
      badge: 'Redes',
    },
  ]
})

function avatarGradient(p) {
  const gradients = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-violet-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
    'from-orange-500 to-orange-600',
    'from-indigo-500 to-indigo-600',
  ]
  const idx = (p?.name?.length || 0) % gradients.length
  return gradients[idx]
}

function selectProspect(p) {
  selectedProspect.value = p
  generatedResult.value = null
  error.value = ''
}

async function generate() {
  if (!selectedProspect.value) return
  generating.value = true
  error.value = ''
  generatedResult.value = null

  try {
    generatedResult.value = await generateMessages(selectedProspect.value, selectedTone.value)
  } catch (e) {
    error.value = e.message || 'Error inesperado al generar mensajes'
  } finally {
    generating.value = false
  }
}

function openWp(prospect, channel) {
  const msg = generatedResult.value?.messages[channel]
  if (!msg) return
  const phone = getPhone(prospect)
  if (!phone) return
  const normalized = normalizePhone(phone)
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`
  window.open(url, '_blank')
}

async function copyMessage(key) {
  const msg = generatedResult.value?.messages[key]
  if (!msg) return
  try {
    await navigator.clipboard.writeText(msg)
    copiedKey.value = key
    setTimeout(() => { copiedKey.value = '' }, 2000)
  } catch {
    /* fallback */
  }
}

watch(() => route.query.prospect, (id) => {
  if (id) {
    const found = prospects.value.find(p => p.id === id || p.place_id === id)
    if (found) selectProspect(found)
  }
}, { immediate: true })
</script>

<style scoped>
.ai-outreach {
  @apply h-full;
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.dark .custom-scroll {
  scrollbar-color: #374151 transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 2px;
}

.dark .custom-scroll::-webkit-scrollbar-thumb {
  background-color: #374151;
}
</style>
