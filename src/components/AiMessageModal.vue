<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-blue-500" />
            <h3 class="modal-title">Mensajes Generados</h3>
          </div>
          <button @click="$emit('close')" class="modal-close">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="modal-body space-y-4 max-h-[70vh] overflow-y-auto custom-scroll">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Tono:</span>
            <div class="flex gap-1.5">
              <button
                v-for="t in tones"
                :key="t.key"
                @click="$emit('update:tone', t.key)"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                :class="tone === t.key
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-gray-50 dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-100 dark:hover:bg-[#222738]'"
              >
                {{ t.label }}
              </button>
            </div>
          </div>

          <div v-if="generating" class="space-y-3">
            <div v-for="i in 4" :key="i" class="rounded-xl border border-gray-100 dark:border-white/5 p-4">
              <div class="skeleton h-4 w-28 rounded mb-3"></div>
              <div class="skeleton h-3 w-full rounded mb-2"></div>
              <div class="skeleton h-3 w-3/4 rounded mb-2"></div>
              <div class="skeleton h-3 w-1/2 rounded"></div>
            </div>
          </div>

          <div v-else-if="error" class="text-center py-8">
            <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-3">
              <AlertCircle class="w-6 h-6 text-red-400" />
            </div>
            <p class="text-sm font-medium text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <div v-else-if="result" class="space-y-3">
            <div
              v-for="msg in messageList"
              :key="msg.key"
              class="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden"
            >
              <div class="px-4 py-2.5 bg-gray-50 dark:bg-white/5 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                <div class="flex items-center gap-2">
                  <component :is="msg.icon" class="w-4 h-4" :class="msg.color" />
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ msg.label }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    @click="copy(msg.key)"
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
                <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {{ getMessageText(msg.key) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="result" class="modal-footer">
          <button @click="$emit('regenerate')" class="w-full py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            <RefreshCw class="w-4 h-4" />
            Regenerar mensajes
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Sparkles, X, Copy, Check, AlertCircle,
  MessageCircle, Mail, MessageSquare, Send, RefreshCw,
} from '@lucide/vue'

const props = defineProps({
  visible: Boolean,
  prospect: Object,
  tone: { type: String, default: 'casual' },
  generating: Boolean,
  error: String,
  result: Object,
})

const emit = defineEmits(['close', 'update:tone', 'regenerate', 'send'])

const copiedKey = ref('')

const tones = [
  { key: 'casual', label: 'Casual' },
  { key: 'professional', label: 'Profesional' },
  { key: 'seller', label: 'Vendedor' },
  { key: 'technical', label: 'Técnico' },
]

const messageList = computed(() => {
  if (!props.result) return []
  return [
    { key: 'whatsapp_corto', label: 'WhatsApp Corto', icon: MessageCircle, color: 'text-emerald-500', action: () => sendWp('whatsapp_corto'), actionLabel: 'Abrir WhatsApp', actionIcon: Send },
    { key: 'whatsapp_profesional', label: 'WhatsApp Profesional', icon: MessageCircle, color: 'text-emerald-600', action: () => sendWp('whatsapp_profesional'), actionLabel: 'Abrir WhatsApp', actionIcon: Send },
    { key: 'email_formal', label: 'Email Formal', icon: Mail, color: 'text-blue-500' },
    { key: 'instagram_dm', label: 'Instagram DM', icon: MessageSquare, color: 'text-pink-500' },
  ]
})

function getMessageText(key) {
  if (key === 'email_formal') {
    const parts = (props.result?.messages?.email_formal || '').split('|')
    if (parts.length > 1) {
      return `📧 ${parts[0].trim()}\n\n${parts.slice(1).join('|').trim()}`
    }
  }
  return props.result?.messages?.[key] || ''
}

async function copy(key) {
  const text = props.result?.messages?.[key]
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copiedKey.value = key
    setTimeout(() => { copiedKey.value = '' }, 2000)
  } catch { /* ignore */ }
}

function sendWp(channel) {
  const msg = props.result?.messages?.[channel]
  if (!msg || !props.prospect) return
  emit('send', { channel, message: msg })
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 z-[100] flex items-center justify-center p-4;
  @apply bg-black/40 backdrop-blur-sm;
}

.modal-content {
  @apply bg-white dark:bg-[#111827];
  @apply rounded-2xl shadow-2xl;
  @apply border border-gray-200 dark:border-white/10;
  @apply w-full animate-scale-in;
}

.modal-header {
  @apply flex items-center justify-between px-6 py-4;
  @apply border-b border-gray-100 dark:border-white/5;
}

.modal-title {
  @apply text-base font-semibold text-gray-900 dark:text-white;
}

.modal-close {
  @apply p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200;
  @apply hover:bg-gray-100 dark:hover:bg-white/10;
  @apply transition-colors;
}

.modal-body {
  @apply p-6;
}

.modal-footer {
  @apply px-6 py-4;
  @apply border-t border-gray-100 dark:border-white/5;
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
