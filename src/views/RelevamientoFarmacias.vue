<template>
  <div class="relevamiento-view">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Relevamiento de Farmacias</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ crm.pharmacyStats.total }} farmacias relevadas
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="exportToCsv" class="btn-secondary">
          <FileDown class="w-4 h-4" />
          <span class="hidden sm:inline">Exportar CSV</span>
        </button>
        <router-link to="/buscar?tipo=pharmacy" class="btn-primary">
          <Search class="w-4 h-4" />
          <span class="hidden sm:inline">Buscar farmacias</span>
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <div class="summary-card">
        <div class="summary-icon bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Building2 class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ crm.pharmacyStats.total }}</p>
        <p class="summary-label">Total relevadas</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <PhoneCall class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ crm.pharmacyStats.contactadas }}</p>
        <p class="summary-label">Contactadas</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <ThumbsUp class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ crm.pharmacyStats.interesadas }}</p>
        <p class="summary-label">Interesadas</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <DollarSign class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ formatPrice(crm.pharmacyStats.precioPromedio) }}</p>
        <p class="summary-label">Precio prom. actual</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <Monitor class="w-5 h-5" />
        </div>
        <div class="summary-value text-base leading-tight" v-if="crm.pharmacyStats.sistemasMasUsados.length">
          <span v-for="s in crm.pharmacyStats.sistemasMasUsados" :key="s.sistema" class="block">
            {{ s.sistema }} ({{ s.count }})
          </span>
        </div>
        <p v-else class="summary-value">-</p>
        <p class="summary-label">Sistemas + usados</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400">
          <Clock class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ crm.pharmacyStats.sinContactar }}</p>
        <p class="summary-label">Sin contactar</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-wrapper">
        <Search class="search-icon" />
        <input
          v-model="crm.searchQuery"
          type="text"
          placeholder="Buscar por nombre, dirección, teléfono..."
          class="filter-input"
        />
      </div>
      <select v-model="crm.provinciaFilter" class="filter-select">
        <option value="">Todas las provincias</option>
        <option v-for="p in crm.uniqueProvincias" :key="p" :value="p">{{ p }}</option>
      </select>
      <select v-model="crm.ciudadFilter" class="filter-select">
        <option value="">Todas las ciudades</option>
        <option v-for="c in crm.uniqueCiudades" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="crm.estadoComercialFilter" class="filter-select">
        <option value="">Todos los estados</option>
        <option v-for="e in estadoComercialOptions" :key="e.value" :value="e.value">{{ e.label }}</option>
      </select>
      <select v-model="crm.nivelInteresFilter" class="filter-select">
        <option value="">Todo interés</option>
        <option value="alto">Alto</option>
        <option value="medio">Medio</option>
        <option value="bajo">Bajo</option>
      </select>
      <select v-model="crm.sistemaActualFilter" class="filter-select">
        <option value="">Todos los sistemas</option>
        <option v-for="s in crm.uniqueSistemasActuales" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <div v-if="crm.filteredPharmacyProspects.length === 0" class="empty-state">
      <Building2 class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No hay farmacias relevadas</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {{ crm.searchQuery ? 'Intenta con otros términos de búsqueda' : 'Busca farmacias en Google Maps y guárdalas como prospectos' }}
      </p>
      <router-link to="/buscar?tipo=pharmacy" class="empty-action">
        <Search class="w-4 h-4" />
        Ir a buscar farmacias
      </router-link>
    </div>

    <div v-else>
      <div v-for="provGroup in crm.pharmacyProspectsByProvincia" :key="provGroup.provincia" class="mb-6">
        <div
          @click="toggleProvincia(provGroup.provincia)"
          class="provincia-header"
          :class="{ active: isProvExpanded(provGroup.provincia) }"
        >
          <div class="provincia-header-left">
            <MapPin class="provincia-icon" />
            <h3 class="provincia-name">{{ provGroup.provincia }}</h3>
            <span class="provincia-count">
              {{ provGroup.ciudades.reduce((s, c) => s + c.prospects.length, 0) }} farmacia{{ provGroup.ciudades.reduce((s, c) => s + c.prospects.length, 0) !== 1 ? 's' : '' }}
            </span>
          </div>
          <ChevronDown class="provincia-chevron" :class="{ rotated: isProvExpanded(provGroup.provincia) }" />
        </div>

        <div v-show="isProvExpanded(provGroup.provincia)" class="provincia-content">
          <div v-for="cityGroup in provGroup.ciudades" :key="cityGroup.ciudad" class="mb-4">
            <div
              @click="toggleCiudad(cityGroup.ciudad)"
              class="ciudad-header"
              :class="{ active: isCityExpanded(cityGroup.ciudad) }"
            >
              <div class="ciudad-header-left">
                <Building2 class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <h4 class="ciudad-name">{{ cityGroup.ciudad }}</h4>
                <span class="ciudad-count">{{ cityGroup.prospects.length }} farmacia{{ cityGroup.prospects.length !== 1 ? 's' : '' }}</span>
              </div>
              <ChevronDown class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" :class="{ rotated: isCityExpanded(cityGroup.ciudad) }" />
            </div>

            <div v-show="isCityExpanded(cityGroup.ciudad)" class="ciudad-content">
              <TransitionGroup name="list" tag="div" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <div
                  v-for="prospect in cityGroup.prospects"
                  :key="prospect.id || prospect.place_id"
                  class="pharmacy-card"
                >
                  <div class="card-header">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="pharmacy-avatar">
                          <Pill class="w-5 h-5" />
                        </div>
                        <div class="min-w-0">
                          <h4 class="pharmacy-name truncate">{{ prospect.name }}</h4>
                          <p class="pharmacy-address truncate">{{ prospect.address }}</p>
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
                    <div class="flex flex-wrap items-center gap-1.5 mb-3">
                      <span class="badge-estado" :class="`estado-${prospect.estadoComercial || 'sin_contactar'}`">
                        {{ estadoComercialLabel(prospect.estadoComercial) }}
                      </span>
                      <span v-if="prospect.nivelInteres" class="badge-interes" :class="`interes-${prospect.nivelInteres}`">
                        {{ nivelInteresLabel(prospect.nivelInteres) }}
                      </span>
                      <span v-if="prospect.sistemaActual" class="badge-sistema">
                        <Monitor class="w-3 h-3" />
                        {{ prospect.sistemaActual }}
                      </span>
                    </div>

                    <div class="pharmacy-info">
                      <div v-if="prospect.phone" class="info-row">
                        <Phone class="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{{ prospect.phone }}</span>
                      </div>
                      <div v-if="prospect.precioMensualActual" class="info-row">
                        <DollarSign class="w-3.5 h-3.5 flex-shrink-0" />
                        <span>$ {{ formatNumber(prospect.precioMensualActual) }}/mes</span>
                      </div>
                      <div v-if="prospect.cantidadSucursales" class="info-row">
                        <GitBranch class="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{{ prospect.cantidadSucursales }} sucursal{{ prospect.cantidadSucursales !== 1 ? 'es' : '' }}</span>
                      </div>
                      <div v-if="prospect.cantidadPuestos" class="info-row">
                        <Users class="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{{ prospect.cantidadPuestos }} puesto{{ prospect.cantidadPuestos !== 1 ? 's' : '' }}</span>
                      </div>
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
                        @click="openDetail(prospect)"
                        class="action-btn action-primary"
                        title="Ver detalle"
                      >
                        <Eye class="w-3.5 h-3.5" />
                        <span class="hidden sm:inline">Detalle</span>
                      </button>

                      <div class="relative">
                        <button
                          @click="toggleStatusMenu($event, prospect.id)"
                          class="status-btn"
                        >
                          <span>{{ estadoComercialLabel(prospect.estadoComercial) }}</span>
                          <ChevronDown class="w-3.5 h-3.5" />
                        </button>
                        <Teleport to="body">
                          <div
                            v-if="openMenuId === prospect.id"
                            class="status-dropdown"
                            :style="menuStyle"
                          >
                            <button
                              v-for="e in estadoComercialOptions"
                              :key="e.value"
                              @click="selectEstado(prospect.id, e.value)"
                              class="status-option"
                              :class="{ selected: prospect.estadoComercial === e.value }"
                            >
                              <span class="status-dot" :class="`dot-${e.color}`"></span>
                              <span>{{ e.label }}</span>
                            </button>
                          </div>
                        </Teleport>
                      </div>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">Detalle de relevamiento</h3>
            <button @click="showDetailModal = false" class="modal-close">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="modal-body max-h-[70vh] overflow-y-auto scrollbar-thin">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div class="field-group">
                <label class="field-label">Nombre</label>
                <input v-model="editForm.name" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Provincia</label>
                <select v-model="editForm.provincia" class="field-input">
                  <option value="">Seleccionar...</option>
                  <option value="La Rioja">La Rioja</option>
                  <option value="Catamarca">Catamarca</option>
                  <option value="Tucumán">Tucumán</option>
                  <option v-for="p in otrasProvincias" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Ciudad / Localidad</label>
                <input v-model="editForm.city" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Dirección</label>
                <input v-model="editForm.address" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Teléfono</label>
                <input v-model="editForm.phone" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">WhatsApp</label>
                <input v-model="editForm.whatsapp" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Email</label>
                <input v-model="editForm.email" type="email" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Sitio web</label>
                <input v-model="editForm.website" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Instagram</label>
                <input v-model="editForm.instagram" class="field-input" placeholder="ej: @farmacia..." />
              </div>
              <div class="field-group">
                <label class="field-label">Google Maps URL</label>
                <input v-model="editForm.googleMapsUrl" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Sistema actual</label>
                <input v-model="editForm.sistemaActual" class="field-input" placeholder="Ej: Farmanet, RX, etc" />
              </div>
              <div class="field-group">
                <label class="field-label">Precio mensual actual ($)</label>
                <input v-model.number="editForm.precioMensualActual" type="number" min="0" step="100" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Cantidad de sucursales</label>
                <input v-model.number="editForm.cantidadSucursales" type="number" min="1" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Cantidad de puestos</label>
                <input v-model.number="editForm.cantidadPuestos" type="number" min="1" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Nivel de interés</label>
                <select v-model="editForm.nivelInteres" class="field-input">
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Estado comercial</label>
                <select v-model="editForm.estadoComercial" class="field-input">
                  <option v-for="e in estadoComercialOptions" :key="e.value" :value="e.value">{{ e.label }}</option>
                </select>
              </div>
              <div class="field-group md:col-span-2">
                <label class="field-label">Problemas detectados</label>
                <textarea v-model="editForm.problemasDetectados" class="field-input field-textarea" rows="2"></textarea>
              </div>
              <div class="field-group md:col-span-2">
                <label class="field-label">Observaciones</label>
                <textarea v-model="editForm.observaciones" class="field-input field-textarea" rows="2"></textarea>
              </div>
              <div class="field-group">
                <label class="field-label">Precio estimado recomendado ($)</label>
                <input v-model.number="editForm.precioEstimadoRecomendado" type="number" min="0" step="500" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Último contacto</label>
                <input :value="formatDateInput(editForm.fechaUltimoContacto)" @input="e => editForm.fechaUltimoContacto = e.target.value ? new Date(e.target.value).toISOString() : null" type="date" class="field-input" />
              </div>
            </div>
          </div>
          <div class="modal-footer flex gap-2">
            <button @click="showDetailModal = false" class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              Cancelar
            </button>
            <button @click="saveDetail" class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useCrm } from '@/composables/useCrm'
import { useWhatsApp } from '@/composables/useWhatsApp'
import {
  Search, Building2, PhoneCall, ThumbsUp, DollarSign, Monitor,
  Clock, FileDown, MapPin, ChevronDown, Pill, Phone, Trash2,
  MessageCircle, Eye, GitBranch, Users, X, Plus,
} from '@lucide/vue'

const crm = reactive(useCrm())
const { openWhatsApp, getPhone, normalizePhone, buildWhatsAppMessage } = useWhatsApp()

const showDetailModal = ref(false)
const editingProspect = ref(null)
const editForm = reactive({})
const openMenuId = ref(null)
const menuStyle = ref({})
const provinciaExpanded = reactive({})
const ciudadExpanded = reactive({})

function onBodyClick(e) {
  if (openMenuId.value !== null) {
    const btn = e.target.closest('.status-btn')
    if (!btn) openMenuId.value = null
  }
}

onMounted(() => document.addEventListener('click', onBodyClick))
onUnmounted(() => document.removeEventListener('click', onBodyClick))

const estadoComercialOptions = [
  { value: 'sin_contactar', label: 'Sin contactar', color: 'slate' },
  { value: 'contactado', label: 'Contactado', color: 'blue' },
  { value: 'interesado', label: 'Interesado', color: 'emerald' },
  { value: 'no_interesado', label: 'No interesado', color: 'orange' },
  { value: 'visita_agendada', label: 'Visita agendada', color: 'violet' },
  { value: 'cliente', label: 'Cliente', color: 'amber' },
]

const otrasProvincias = computed(() =>
  crm.uniqueProvincias.filter(p => !['La Rioja', 'Catamarca', 'Tucumán'].includes(p))
)

function estadoComercialLabel(value) {
  const opt = estadoComercialOptions.find(e => e.value === value)
  return opt ? opt.label : value || 'Sin contactar'
}

function nivelInteresLabel(value) {
  const labels = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto' }
  return labels[value] || value || '-'
}

function formatNumber(n) {
  if (n == null) return '-'
  return Number(n).toLocaleString('es-AR')
}

function formatPrice(n) {
  if (!n || n === 0) return '-'
  return '$ ' + Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

function formatDateInput(iso) {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}

function toggleProvincia(prov) {
  provinciaExpanded[prov] = !provinciaExpanded[prov]
}

function isProvExpanded(prov) {
  return provinciaExpanded[prov] ?? true
}

function toggleCiudad(city) {
  ciudadExpanded[city] = !ciudadExpanded[city]
}

function isCityExpanded(city) {
  return ciudadExpanded[city] ?? true
}

// Initialize default expansions
onMounted(() => {
  initExpansions()
})

function initExpansions() {
  for (const group of crm.pharmacyProspectsByProvincia) {
    if (!(group.provincia in provinciaExpanded)) {
      provinciaExpanded[group.provincia] = true
    }
    for (const cityGroup of group.ciudades) {
      if (!(cityGroup.ciudad in ciudadExpanded)) {
        ciudadExpanded[cityGroup.ciudad] = true
      }
    }
  }
}

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

function selectEstado(id, estado) {
  crm.updateProspect(id, { estadoComercial: estado })
  openMenuId.value = null
}

function openDetail(prospect) {
  editingProspect.value = prospect
  Object.keys(editForm).forEach(k => delete editForm[k])
  Object.assign(editForm, {
    name: prospect.name || '',
    provincia: prospect.provincia || '',
    city: prospect.city || '',
    address: prospect.address || '',
    phone: prospect.phone || '',
    whatsapp: prospect.whatsapp || '',
    email: prospect.email || '',
    website: prospect.website || '',
    instagram: prospect.instagram || '',
    googleMapsUrl: prospect.googleMapsUrl || '',
    sistemaActual: prospect.sistemaActual || '',
    precioMensualActual: prospect.precioMensualActual || null,
    cantidadSucursales: prospect.cantidadSucursales || 1,
    cantidadPuestos: prospect.cantidadPuestos || 1,
    nivelInteres: prospect.nivelInteres || 'bajo',
    estadoComercial: prospect.estadoComercial || 'sin_contactar',
    problemasDetectados: prospect.problemasDetectados || '',
    observaciones: prospect.observaciones || '',
    precioEstimadoRecomendado: prospect.precioEstimadoRecomendado || null,
    fechaUltimoContacto: prospect.last_contact || null,
    notas: prospect.notes || '',
  })
  showDetailModal.value = true
}

function saveDetail() {
  if (!editingProspect.value) return
  crm.updateProspect(editingProspect.value.id, { ...editForm })
  showDetailModal.value = false
}

function confirmRemove(prospect) {
  if (confirm(`¿Eliminar "${prospect.name}" del relevamiento?`)) {
    crm.removeProspect(prospect.id)
  }
}

function exportToCsv() {
  const data = crm.filteredPharmacyProspects.value
  if (data.length === 0) return

  const headers = [
    'Nombre', 'Provincia', 'Ciudad', 'Dirección', 'Teléfono', 'WhatsApp',
    'Email', 'Sitio web', 'Instagram', 'Google Maps URL',
    'Sistema actual', 'Precio mensual actual', 'Cant. sucursales',
    'Cant. puestos', 'Nivel de interés', 'Estado comercial',
    'Problemas detectados', 'Observaciones',
    'Precio estimado recomendado', 'Último contacto',
  ]

  const rows = data.map(p => [
    escapeCsv(p.name),
    escapeCsv(p.provincia),
    escapeCsv(p.city),
    escapeCsv(p.address),
    escapeCsv(p.phone),
    escapeCsv(p.whatsapp),
    escapeCsv(p.email),
    escapeCsv(p.website),
    escapeCsv(p.instagram),
    escapeCsv(p.googleMapsUrl),
    escapeCsv(p.sistemaActual),
    p.precioMensualActual || '',
    p.cantidadSucursales || '1',
    p.cantidadPuestos || '1',
    nivelInteresLabel(p.nivelInteres),
    estadoComercialLabel(p.estadoComercial),
    escapeCsv(p.problemasDetectados),
    escapeCsv(p.observaciones),
    p.precioEstimadoRecomendado || '',
    p.last_contact ? new Date(p.last_contact).toLocaleDateString('es-AR') : '',
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relevamiento-farmacias-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCsv(val) {
  if (!val) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
</script>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-50 dark:hover:bg-white/5;
  @apply transition-all duration-200;
  @apply no-underline;
}

.btn-primary {
  @apply inline-flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium;
  @apply bg-blue-500 text-white;
  @apply hover:bg-blue-600;
  @apply transition-all duration-200;
  @apply shadow-lg shadow-blue-500/25;
  @apply no-underline;
}

.summary-card {
  @apply bg-white dark:bg-[#111827] rounded-2xl p-4;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
  @apply animate-fade-in;
}

.summary-icon {
  @apply w-9 h-9 rounded-xl flex items-center justify-center mb-2;
}

.summary-value {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.summary-label {
  @apply text-[11px] text-gray-500 dark:text-gray-400 mt-0.5;
}

.filters-bar {
  @apply flex flex-wrap items-center gap-2 mb-6;
}

.search-wrapper {
  @apply relative flex-1 min-w-[200px];
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

.filter-select {
  @apply h-10 px-3 rounded-xl text-sm;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
  min-width: 120px;
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

.pharmacy-card {
  @apply bg-white dark:bg-[#111827] rounded-2xl;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
  @apply transition-all duration-200;
  @apply animate-scale-in;
  @apply overflow-hidden;
}

.card-header {
  @apply p-4 border-b border-gray-100 dark:border-white/5;
}

.pharmacy-avatar {
  @apply w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600;
  @apply flex items-center justify-center text-white flex-shrink-0;
}

.pharmacy-name {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.pharmacy-address {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.card-body {
  @apply p-4;
}

.badge-estado {
  @apply inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium;
}

.estado-sin_contactar { @apply bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400; }
.estado-contactado { @apply bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400; }
.estado-interesado { @apply bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400; }
.estado-no_interesado { @apply bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400; }
.estado-visita_agendada { @apply bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400; }
.estado-cliente { @apply bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400; }

.badge-interes {
  @apply inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium;
}

.interes-alto { @apply bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400; }
.interes-medio { @apply bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400; }
.interes-bajo { @apply bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400; }

.badge-sistema {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium;
  @apply bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400;
}

.pharmacy-info {
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

.action-success {
  @apply bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400;
  @apply hover:bg-emerald-100 dark:hover:bg-emerald-900/30;
}

.action-primary {
  @apply bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400;
  @apply hover:bg-blue-100 dark:hover:bg-blue-900/30;
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
  @apply z-50;
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
.dot-emerald   { @apply bg-emerald-500; }
.dot-orange    { @apply bg-orange-500; }
.dot-violet    { @apply bg-violet-500; }
.dot-amber     { @apply bg-amber-500; }
.dot-slate     { @apply bg-gray-400; }

.modal-overlay {
  @apply fixed inset-0 z-[100] flex items-center justify-center p-4;
  @apply bg-black/40 backdrop-blur-sm;
}

.modal-content {
  @apply bg-white dark:bg-[#111827];
  @apply rounded-2xl shadow-2xl;
  @apply border border-gray-200 dark:border-white/10;
  @apply w-full max-w-lg mx-4;
  @apply animate-scale-in;
}

.modal-content.modal-lg {
  @apply max-w-2xl;
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

.field-group {
  @apply space-y-1;
}

.field-label {
  @apply block text-xs font-medium text-gray-500 dark:text-gray-400;
}

.field-input {
  @apply w-full h-10 px-3 rounded-xl text-sm;
  @apply bg-gray-50 dark:bg-white/5;
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.field-textarea {
  @apply h-auto py-2.5 resize-none;
}

.provincia-header {
  @apply flex items-center justify-between w-full px-5 py-3.5 rounded-xl cursor-pointer select-none;
  @apply bg-gray-50 dark:bg-white/[0.04];
  @apply border border-gray-200 dark:border-white/10;
  @apply transition-all duration-200;
}

.provincia-header:hover {
  @apply bg-gray-100 dark:bg-white/[0.08];
}

.provincia-header.active {
  @apply border-blue-200 dark:border-blue-900/50;
}

.provincia-header-left {
  @apply flex items-center gap-3 min-w-0;
}

.provincia-icon {
  @apply w-4 h-4 text-emerald-500 flex-shrink-0;
}

.provincia-name {
  @apply text-base font-bold text-gray-900 dark:text-white;
}

.provincia-count {
  @apply text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap;
}

.provincia-chevron {
  @apply w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0;
}

.provincia-chevron.rotated {
  transform: rotate(180deg);
}

.provincia-content {
  @apply pt-3 pl-4;
}

.ciudad-header {
  @apply flex items-center justify-between w-full px-4 py-2.5 rounded-xl cursor-pointer select-none;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-100 dark:border-white/5;
  @apply transition-all duration-200;
}

.ciudad-header:hover {
  @apply bg-gray-50 dark:bg-white/[0.04];
}

.ciudad-header.active {
  @apply border-blue-100 dark:border-blue-900/30;
}

.ciudad-header-left {
  @apply flex items-center gap-2 min-w-0;
}

.ciudad-name {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.ciudad-count {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.ciudad-content {
  @apply pt-3;
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

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.15s ease-out;
}
</style>
