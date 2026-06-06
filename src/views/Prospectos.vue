<template>
  <div class="prospectos-view">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">CRM</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ crm.statsByStatus.total }} prospectos · {{ crm.overdueProspects.length }} vencidos
        </p>
      </div>
    </div>

    <div class="stats-row">
      <button
        v-for="s in statusList"
        :key="s.key"
        @click="crm.statusFilter = crm.statusFilter === s.key ? '' : s.key"
        class="stat-chip"
        :class="[
          `stat-${s.color}`,
          { active: crm.statusFilter === s.key }
        ]"
      >
        <span class="stat-count">{{ crm.statsByStatus[s.key] || 0 }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </button>
    </div>

    <div class="filters-row">
      <div class="search-wrapper">
        <Search class="search-icon" />
        <input
          v-model="crm.searchQuery"
          type="text"
          placeholder="Buscar por nombre, teléfono, dirección..."
          class="filter-input"
        />
      </div>
      <button
        @click="crm.showOverdueOnly = !crm.showOverdueOnly"
        class="filter-btn"
        :class="{ active: crm.showOverdueOnly }"
      >
        <CalendarClock class="w-4 h-4" />
        <span>Solo vencidos</span>
        <span v-if="crm.overdueProspects.length" class="ml-1.5 text-xs font-bold">
          ({{ crm.overdueProspects.length }})
        </span>
      </button>
    </div>

    <div v-if="crm.filteredProspects.length === 0" class="empty-state">
      <Users class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No hay prospectos</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {{ crm.searchQuery ? 'Intenta con otros términos de búsqueda' : 'Busca lugares y guárdalos como prospectos desde los resultados' }}
      </p>
      <router-link to="/buscar" class="empty-action">
        <Search class="w-4 h-4" />
        Ir a buscar lugares
      </router-link>
    </div>

    <div v-else>
      <div v-for="group in crm.prospectsByCity" :key="group.city" class="mb-5">
        <div
          @click="toggleCity(group.city)"
          class="city-header"
          :class="{ active: isCityExpanded(group.city) }"
        >
          <div class="city-header-left">
            <Building2 class="city-icon" />
            <h3 class="city-name">{{ group.city }}</h3>
            <span class="city-count">{{ group.prospects.length }} prospecto{{ group.prospects.length !== 1 ? 's' : '' }}</span>
          </div>
          <ChevronDown class="city-chevron" :class="{ rotated: isCityExpanded(group.city) }" />
        </div>

        <div v-show="isCityExpanded(group.city)" class="city-content">
          <TransitionGroup name="list" tag="div" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="prospect in group.prospects"
              :key="prospect.id || prospect.place_id"
              class="prospect-card"
              :class="{ 'card-overdue': isOverdue(prospect) }"
            >
              <div class="card-header">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="prospect-avatar" :class="`avatar-${prospect.status}`">
                      <Building2 class="w-5 h-5" />
                    </div>
                    <div class="min-w-0">
                      <h4 class="prospect-name truncate">{{ prospect.name }}</h4>
                      <p class="prospect-category truncate">{{ prospect.category || 'Sin categoría' }}</p>
                    </div>
                  </div>
                  <button
                    @click="confirmRemove(prospect)"
                    class="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                    title="Eliminar"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div class="card-body">
                <div class="flex flex-wrap items-center gap-2 mb-3">
                  <span class="status-badge" :class="`status-${prospect.status}`">
                    {{ statusLabels[prospect.status] || prospect.status }}
                  </span>
                  <span class="text-[11px] text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-full">
                    {{ prospect.origin || 'Google Maps' }}
                  </span>
                  <span v-if="isOverdue(prospect)" class="overdue-badge">
                    Vencido
                  </span>
                </div>

                <div class="prospect-info">
                  <div v-if="prospect.address" class="info-row" :title="prospect.address">
                    <MapPin class="w-3.5 h-3.5 flex-shrink-0" />
                    <span class="truncate">{{ prospect.address }}</span>
                  </div>
                  <div v-if="prospect.phone" class="info-row">
                    <Phone class="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{{ prospect.phone }}</span>
                  </div>
                  <div v-if="prospect.email" class="info-row">
                    <Mail class="w-3.5 h-3.5 flex-shrink-0" />
                    <span class="truncate">{{ prospect.email }}</span>
                  </div>
                  <div v-if="prospect.website" class="info-row">
                    <Globe class="w-3.5 h-3.5 flex-shrink-0" />
                    <a :href="prospect.website" target="_blank" class="text-blue-500 hover:underline truncate">{{ prospect.website }}</a>
                  </div>
                </div>

                <div v-if="prospect.next_contact" class="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                  <div class="flex items-center gap-1.5 text-xs" :class="isOverdue(prospect) ? 'text-red-500 font-medium' : 'text-gray-500'">
                    <CalendarClock class="w-3.5 h-3.5" />
                    <span>Seguimiento: {{ formatDate(prospect.next_contact) }}</span>
                  </div>
                </div>

                <div v-if="prospect.notes" class="mt-2">
                  <button
                    @click="openNotes(prospect)"
                    class="text-xs text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1"
                  >
                    <FileText class="w-3 h-3" />
                    <span>Ver nota{{ prospect.notes.includes('\n') ? 's' : '' }}</span>
                  </button>
                </div>

                <div class="card-actions">
                  <button
                    @click="openWhatsApp(prospect)"
                    class="action-btn action-success"
                    :disabled="!prospect.phone"
                    :title="prospect.phone ? 'Abrir WhatsApp' : 'Sin teléfono'"
                  >
                    <MessageCircle class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">WhatsApp</span>
                  </button>

                  <button
                    @click="openAiModal(prospect)"
                    class="action-btn"
                    :class="generatingFor === (prospect.id || prospect.place_id) ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20'"
                    :disabled="generatingFor === (prospect.id || prospect.place_id)"
                    title="Generar mensaje IA"
                  >
                    <Sparkles class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">{{ generatingFor === (prospect.id || prospect.place_id) ? 'Generando...' : 'IA' }}</span>
                  </button>

                  <div class="relative">
                    <button
                      @click="toggleStatusMenu($event, prospect.id)"
                      class="status-btn"
                    >
                      <span>{{ statusLabels[prospect.status] || prospect.status }}</span>
                      <ChevronDown class="w-3.5 h-3.5" />
                    </button>
                    <Teleport to="body">
                      <div
                        v-if="openMenuId === prospect.id"
                        class="status-dropdown"
                        :style="menuStyle"
                      >
                        <button
                          v-for="s in statusList"
                          :key="s.key"
                          @click="selectStatus(prospect.id, s.key)"
                          class="status-option"
                          :class="{ selected: prospect.status === s.key }"
                        >
                          <span class="status-dot" :class="`dot-${s.color}`"></span>
                          <span>{{ s.label }}</span>
                        </button>
                      </div>
                    </Teleport>
                  </div>

                  <button
                    @click="openNotes(prospect)"
                    class="action-btn action-secondary"
                    title="Agregar nota"
                  >
                    <FileText class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">Nota</span>
                  </button>

                  <button
                    @click="openSchedule(prospect)"
                    class="action-btn action-secondary"
                    :class="{ 'text-amber-500': prospect.next_contact }"
                    title="Programar seguimiento"
                  >
                    <CalendarClock class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">{{ prospect.next_contact ? 'Reprogramar' : 'Seguir' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showNotesDialog" class="modal-overlay" @click.self="showNotesDialog = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Notas</h3>
            <button @click="showNotesDialog = false" class="modal-close">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="modal-body">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ editingProspect?.name }}</p>
            <textarea
              v-model="noteText"
              placeholder="Escribe una nota..."
              class="note-textarea"
              rows="3"
            ></textarea>
            <button @click="saveNote" class="mt-3 w-full py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              Agregar nota
            </button>
            <div v-if="editingProspect?.notes" class="mt-4 space-y-2 max-h-48 overflow-y-auto">
              <div
                v-for="(note, i) in parsedNotes"
                :key="i"
                class="note-item"
              >
                <p class="text-xs text-gray-500">{{ note }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showScheduleDialog" class="modal-overlay" @click.self="showScheduleDialog = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Programar seguimiento</h3>
            <button @click="showScheduleDialog = false" class="modal-close">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="modal-body">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ editingProspect?.name }}</p>
            <input
              v-model="scheduleDate"
              type="datetime-local"
              class="schedule-input"
            />
            <div class="flex gap-2 mt-3">
              <button
                @click="crm.scheduleFollowUp(editingProspect.id, null); showScheduleDialog = false"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              >
                Quitar fecha
              </button>
              <button
                @click="saveSchedule"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                :disabled="!scheduleDate"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <AiMessageModal
      :visible="aiModalVisible"
      :prospect="aiProspect"
      :tone="aiTone"
      :generating="aiGenerating"
      :error="aiError"
      :result="aiResult"
      @close="aiModalVisible = false"
      @update:tone="aiTone = $event; generateAiMessages()"
      @regenerate="generateAiMessages()"
      @send="handleAiSend"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useCrm, statusLabels, statusConfig } from '@/composables/useCrm'
import { useWhatsApp } from '@/composables/useWhatsApp'
import {
  Search, Users, Building2, Trash2, MapPin, Phone, Mail, Globe,
  MessageCircle, ChevronDown, FileText, CalendarClock, X, Sparkles,
} from '@lucide/vue'
import AiMessageModal from '@/components/AiMessageModal.vue'
import { generateMessages } from '@/services/ai'

const crm = reactive(useCrm())
const { openWhatsApp, getPhone, normalizePhone } = useWhatsApp()

const aiModalVisible = ref(false)
const aiProspect = ref(null)
const aiTone = ref('casual')
const aiGenerating = ref(false)
const aiError = ref('')
const aiResult = ref(null)
const generatingFor = ref(null)
const showNotesDialog = ref(false)
const showScheduleDialog = ref(false)
const editingProspect = ref(null)
const noteText = ref('')
const scheduleDate = ref('')

const statusList = Object.entries(statusConfig).map(([key, val]) => ({
  key,
  label: val.label,
  color: val.color,
}))

const openMenuId = ref(null)
const menuStyle = ref({})

function onBodyClick(e) {
  if (openMenuId.value !== null) {
    const btn = e.target.closest('.status-btn')
    if (!btn) openMenuId.value = null
  }
}

onMounted(() => document.addEventListener('click', onBodyClick))
onUnmounted(() => document.removeEventListener('click', onBodyClick))

function toggleStatusMenu(e, id) {
  if (openMenuId.value === id) {
    openMenuId.value = null
    return
  }
  const rect = e.currentTarget.getBoundingClientRect()
  menuStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${Math.max(rect.width, 150)}px`,
  }
  openMenuId.value = id
}

function selectStatus(id, status) {
  crm.setStatus(id, status)
  openMenuId.value = null
}

const prospectsSafe = computed(() =>
  (crm.filteredProspects || []).filter(p => p && typeof p === 'object')
)

const cityExpanded = reactive({})

watch(() => crm.prospectsByCity, (groups) => {
  const seen = new Set()
  for (const group of groups) {
    seen.add(group.city)
    if (!(group.city in cityExpanded)) {
      cityExpanded[group.city] = group.prospects.some(p => p.status === 'new' || p.status === 'pending')
    }
  }
  for (const key of Object.keys(cityExpanded)) {
    if (!seen.has(key)) delete cityExpanded[key]
  }
}, { immediate: true })

function toggleCity(city) {
  cityExpanded[city] = !cityExpanded[city]
}

function isCityExpanded(city) {
  return cityExpanded[city] ?? true
}

const parsedNotes = computed(() => {
  if (!editingProspect.value?.notes) return []
  return editingProspect.value.notes.split('\n').filter(Boolean).reverse()
})

function isOverdue(p) {
  if (!p || !p.next_contact) return false
  return new Date(p.next_contact) < new Date()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function openNotes(prospect) {
  editingProspect.value = prospect
  noteText.value = ''
  showNotesDialog.value = true
}

function saveNote() {
  if (!noteText.value.trim() || !editingProspect.value) return
  crm.addNote(editingProspect.value.id, noteText.value.trim())
  noteText.value = ''
}

function openSchedule(prospect) {
  editingProspect.value = prospect
  if (prospect.next_contact) {
    const d = new Date(prospect.next_contact)
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - offset * 60000)
    scheduleDate.value = local.toISOString().slice(0, 16)
  } else {
    scheduleDate.value = ''
  }
  showScheduleDialog.value = true
}

function saveSchedule() {
  if (!editingProspect.value || !scheduleDate.value) return
  crm.scheduleFollowUp(editingProspect.value.id, new Date(scheduleDate.value).toISOString())
  showScheduleDialog.value = false
}

function confirmRemove(prospect) {
  if (confirm(`¿Eliminar "${prospect.name}" de prospectos?`)) {
    crm.removeProspect(prospect.id)
  }
}

function openAiModal(prospect) {
  aiProspect.value = prospect
  aiTone.value = 'casual'
  aiResult.value = null
  aiError.value = ''
  aiModalVisible.value = true
  generateAiMessages()
}

async function generateAiMessages() {
  if (!aiProspect.value) return
  aiGenerating.value = true
  aiError.value = ''
  aiResult.value = null
  const key = aiProspect.value.id || aiProspect.value.place_id
  generatingFor.value = key

  try {
    aiResult.value = await generateMessages(aiProspect.value, aiTone.value)
  } catch (e) {
    aiError.value = e.message || 'Error al generar mensajes'
  } finally {
    aiGenerating.value = false
    generatingFor.value = null
  }
}

function handleAiSend({ message }) {
  const phone = getPhone(aiProspect.value)
  if (!phone) return
  const normalized = normalizePhone(phone)
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
</script>

<style scoped>
.stats-row {
  @apply flex flex-wrap gap-2 mb-5;
}

.stat-chip {
  @apply inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-600 dark:text-gray-400;
  @apply transition-all duration-200;
  @apply cursor-pointer hover:shadow-sm;
}

.stat-chip.active {
  @apply ring-2 ring-offset-1;
}

.stat-chip .stat-count {
  @apply text-lg font-bold;
}

.stat-label {
  @apply text-xs;
}

.stat-blue.active { @apply ring-blue-500 text-blue-600 dark:text-blue-400; }
.stat-violet.active { @apply ring-violet-500 text-violet-600 dark:text-violet-400; }
.stat-indigo.active { @apply ring-indigo-500 text-indigo-600 dark:text-indigo-400; }
.stat-emerald.active { @apply ring-emerald-500 text-emerald-600 dark:text-emerald-400; }
.stat-orange.active { @apply ring-orange-500 text-orange-600 dark:text-orange-400; }
.stat-amber.active { @apply ring-amber-500 text-amber-600 dark:text-amber-400; }
.stat-slate.active { @apply ring-slate-500 text-slate-600 dark:text-slate-400; }
.stat-gray.active { @apply ring-gray-500 text-gray-600 dark:text-gray-400; }

.filters-row {
  @apply flex items-center gap-3 mb-6;
}

.search-wrapper {
  @apply relative flex-1;
}

.search-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none;
}

.filter-input {
  @apply w-full h-10 pl-10 pr-4 rounded-xl text-sm;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.filter-btn {
  @apply inline-flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-medium;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:border-red-300 dark:hover:border-red-800;
  @apply transition-all duration-200;
  @apply whitespace-nowrap;
}

.filter-btn.active {
  @apply border-red-400 text-red-600 dark:text-red-400;
  @apply bg-red-50 dark:bg-red-900/20;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-20 text-center;
}

.empty-action {
  @apply inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium;
  @apply bg-blue-500 text-white hover:bg-blue-600;
  @apply transition-all duration-200 no-underline;
  @apply shadow-lg shadow-blue-500/25;
}

.prospect-card {
  @apply bg-white dark:bg-[#111827] rounded-2xl;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
  @apply transition-all duration-200;
  @apply animate-scale-in;
  @apply overflow-hidden;
}

.prospect-card.card-overdue {
  @apply border-red-300 dark:border-red-800;
  @apply shadow-[0_0_0_1px_theme(colors.red.300)];
}

.dark .prospect-card.card-overdue {
  @apply shadow-[0_0_0_1px_theme(colors.red.800)];
}

.card-header {
  @apply p-4 border-b border-gray-100 dark:border-white/5;
}

.prospect-avatar {
  @apply w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0;
}

.avatar-new { @apply bg-gradient-to-br from-blue-500 to-blue-600; }
.avatar-contacted { @apply bg-gradient-to-br from-violet-500 to-violet-600; }
.avatar-replied { @apply bg-gradient-to-br from-indigo-500 to-indigo-600; }
.avatar-interested { @apply bg-gradient-to-br from-emerald-500 to-emerald-600; }
.avatar-not_interested { @apply bg-gradient-to-br from-orange-500 to-orange-600; }
.avatar-client { @apply bg-gradient-to-br from-amber-500 to-amber-600; }
.avatar-pending { @apply bg-gradient-to-br from-slate-500 to-slate-600; }
.avatar-closed { @apply bg-gradient-to-br from-gray-500 to-gray-600; }

.prospect-name {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.prospect-category {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.card-body {
  @apply p-4;
}

.status-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-new { @apply bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400; }
.status-contacted { @apply bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400; }
.status-replied { @apply bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400; }
.status-interested { @apply bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400; }
.status-not_interested { @apply bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400; }
.status-client { @apply bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400; }
.status-pending { @apply bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400; }
.status-closed { @apply bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400; }

.overdue-badge {
  @apply inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium;
  @apply bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400;
  @apply animate-pulse-soft;
}

.prospect-info {
  @apply space-y-1.5;
}

.info-row {
  @apply flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400;
}

.card-actions {
  @apply mt-3 pt-3 border-t border-gray-100 dark:border-white/5;
  @apply flex items-center gap-2;
}

.action-btn {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium;
  @apply transition-all duration-200;
}

.action-btn:disabled {
  @apply opacity-40 cursor-not-allowed;
}

.action-secondary {
  @apply bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-100 dark:hover:bg-white/10;
}

.action-success {
  @apply bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400;
  @apply hover:bg-emerald-100 dark:hover:bg-emerald-900/30;
}

.action-success:disabled {
  @apply bg-gray-50 dark:bg-white/5 text-gray-400;
}

.status-btn {
  @apply flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-lg text-xs font-medium;
  @apply bg-gray-100 dark:bg-white/10;
  @apply border border-gray-300 dark:border-white/20;
  @apply text-gray-800 dark:text-gray-200;
  @apply hover:bg-gray-200 dark:hover:bg-white/20;
  @apply transition-colors cursor-pointer whitespace-nowrap;
  min-width: 90px;
}

.status-btn svg {
  @apply text-gray-400 dark:text-gray-500 shrink-0;
}

.status-dropdown {
  @apply absolute right-0 top-full mt-1 z-50;
  @apply bg-white dark:bg-[#1e293b];
  @apply border border-gray-200 dark:border-white/15;
  @apply rounded-xl shadow-xl;
  @apply py-1.5;
  @apply animate-fade-in;
}

.status-option {
  @apply flex items-center gap-2 w-full px-3 py-2 text-xs text-left;
  @apply text-gray-700 dark:text-gray-200;
  @apply hover:bg-gray-100 dark:hover:bg-white/10;
  @apply transition-colors cursor-pointer;
}

.status-option.selected {
  @apply font-semibold;
  @apply bg-blue-50 dark:bg-blue-900/20;
  @apply text-blue-700 dark:text-blue-300;
}

.status-dot {
  @apply w-2 h-2 rounded-full shrink-0;
}

.dot-blue      { @apply bg-blue-500; }
.dot-violet    { @apply bg-violet-500; }
.dot-indigo    { @apply bg-indigo-500; }
.dot-emerald   { @apply bg-emerald-500; }
.dot-orange    { @apply bg-orange-500; }
.dot-amber     { @apply bg-amber-500; }
.dot-slate     { @apply bg-slate-500; }
.dot-gray      { @apply bg-gray-500; }

.modal-overlay {
  @apply fixed inset-0 z-[100] flex items-center justify-center;
  @apply bg-black/40 backdrop-blur-sm;
}

.modal-content {
  @apply bg-white dark:bg-[#111827];
  @apply rounded-2xl shadow-2xl;
  @apply border border-gray-200 dark:border-white/10;
  @apply w-full max-w-md mx-4;
  @apply animate-scale-in;
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

.note-textarea {
  @apply w-full px-4 py-3 rounded-xl text-sm;
  @apply bg-gray-50 dark:bg-white/5;
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply resize-none transition-all duration-200;
}

.note-item {
  @apply p-3 rounded-xl text-xs;
  @apply bg-gray-50 dark:bg-white/5;
  @apply text-gray-600 dark:text-gray-400;
  @apply leading-relaxed;
}

.schedule-input {
  @apply w-full px-4 py-3 rounded-xl text-sm;
  @apply bg-gray-50 dark:bg-white/5;
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.list-enter-active,
.list-leave-active {
  @apply transition-all duration-300 ease-in-out;
}

.list-enter-from {
  @apply opacity-0 translate-y-4;
}

.list-leave-to {
  @apply opacity-0 -translate-y-4;
}

.list-move {
  @apply transition-all duration-300;
}

.city-header {
  @apply flex items-center justify-between w-full px-5 py-3 rounded-xl cursor-pointer select-none;
  @apply bg-gray-50 dark:bg-white/[0.04];
  @apply border border-gray-200 dark:border-white/10;
  @apply transition-all duration-200;
}

.city-header:hover {
  @apply bg-gray-100 dark:bg-white/[0.08];
}

.city-header.active {
  @apply border-blue-200 dark:border-blue-900/50;
}

.city-header-left {
  @apply flex items-center gap-3 min-w-0;
}

.city-icon {
  @apply w-4 h-4 text-gray-400 flex-shrink-0;
}

.city-name {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.city-count {
  @apply text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap;
}

.city-chevron {
  @apply w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0;
}

.city-chevron.rotated {
  transform: rotate(180deg);
}

.city-content {
  @apply pt-3;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.15s ease-out;
}
</style>
