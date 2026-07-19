import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/app'

const STORAGE_KEY = 'placeandnumbers_prospects'

function loadLocal() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLocal(prospects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects))
  } catch { /* quota exceeded, ignore */ }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export const statusConfig = {
  new:           { label: 'Nuevo',        color: 'blue',     icon: 'Circle' },
  contacted:     { label: 'Contactado',   color: 'violet',   icon: 'PhoneCall' },
  replied:       { label: 'Respondió',    color: 'indigo',   icon: 'MessageSquare' },
  interested:    { label: 'Interesado',   color: 'emerald',  icon: 'ThumbsUp' },
  not_interested:{ label: 'No interesado',color: 'orange',   icon: 'ThumbsDown' },
  client:        { label: 'Cliente',      color: 'amber',    icon: 'Award' },
  pending:       { label: 'Pendiente',    color: 'slate',    icon: 'Clock' },
  closed:        { label: 'Cerrado',      color: 'gray',     icon: 'CheckCircle' },
}

export const statusLabels = Object.fromEntries(
  Object.entries(statusConfig).map(([k, v]) => [k, v.label])
)

const localProspects = ref(loadLocal())

watch(localProspects, saveLocal, { deep: true })

let storeSyncSetup = false

function startStoreSync() {
  if (storeSyncSetup) return
  try {
    const store = useAppStore()
    const filtered = (prospects) =>
      (prospects || []).filter(p => p && p.tipo_relevamiento !== 'comercial')
    if (store.prospects && store.prospects.length > 0 && localProspects.value.length === 0) {
      localProspects.value = filtered(store.prospects)
    }
    watch(
      () => store.prospects,
      (val) => {
        if (val && val.length > 0) {
          const f = filtered(val)
          if (JSON.stringify(f) !== JSON.stringify(localProspects.value)) {
            localProspects.value = f
          }
        }
      },
      { deep: true }
    )
    storeSyncSetup = true
  } catch { /* store not ready yet, will retry on next useCrm() call */ }
}

function syncToStore() {
  try {
    const store = useAppStore()
    if (store && store.prospects !== localProspects.value) {
      store.prospects = localProspects.value
    }
  } catch { /* store not ready */ }
}

export function detectCity(address) {
  if (!address) return 'Sin ciudad'
  const parts = address.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length < 2) return parts[0] || 'Sin ciudad'

  const postalRegex = /\b[A-Z]\d{4}\b/
  for (let i = 0; i < parts.length; i++) {
    const match = parts[i].match(postalRegex)
    if (match) {
      const afterCode = parts[i].slice(match.index + match[0].length).trim()
      if (afterCode) return afterCode
      if (i + 1 < parts.length) return parts[i + 1]
      return parts[i].replace(postalRegex, '').trim() || parts[i - 1] || parts[i]
    }
  }

  if (parts.length >= 4) return parts[parts.length - 3]
  if (parts.length === 3) return parts[1]
  return parts[0]
}

export function useCrm() {
  startStoreSync()

  const searchQuery = ref('')
  const statusFilter = ref('')
  const showOverdueOnly = ref(false)
  const provinciaFilter = ref('')
  const ciudadFilter = ref('')
  const nivelInteresFilter = ref('')
  const sistemaActualFilter = ref('')
  const estadoComercialFilter = ref('')

  const prospects = computed({
    get: () => localProspects.value,
    set: (val) => { localProspects.value = val },
  })

  const statsByStatus = computed(() => {
    const safe = (localProspects.value || []).filter(p => p && typeof p === 'object')
    const counts = {}
    for (const key of Object.keys(statusConfig)) {
      counts[key] = safe.filter(p => p.status === key).length
    }
    counts.total = safe.length
    return counts
  })

  const overdueProspects = computed(() =>
    (localProspects.value || []).filter(p => p && typeof p === 'object').filter(p => {
      if (!p.next_contact) return false
      return new Date(p.next_contact) < new Date()
    })
  )

  const filteredProspects = computed(() => {
    let list = (localProspects.value || []).filter(Boolean)
    if (statusFilter.value) {
      list = list.filter(p => p.status === statusFilter.value)
    }
    if (showOverdueOnly.value) {
      list = list.filter(p => {
        if (!p.next_contact) return false
        return new Date(p.next_contact) < new Date()
      })
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
    }
    return list
  })

  function isPharmacy(p) {
    if (!p || typeof p !== 'object') return false
    const cat = (p.category || '').toLowerCase()
    return cat.includes('farmacia') || cat.includes('pharmacy')
  }

  const pharmacyProspects = computed(() =>
    (localProspects.value || []).filter(p => p && typeof p === 'object' && isPharmacy(p))
  )

  const filteredPharmacyProspects = computed(() => {
    let list = pharmacyProspects.value
    if (statusFilter.value) {
      list = list.filter(p => p.status === statusFilter.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.sistemaActual?.toLowerCase().includes(q)
      )
    }
    if (provinciaFilter.value) {
      list = list.filter(p => p.provincia === provinciaFilter.value)
    }
    if (ciudadFilter.value) {
      list = list.filter(p => p.city === ciudadFilter.value || detectCity(p.address) === ciudadFilter.value)
    }
    if (nivelInteresFilter.value) {
      list = list.filter(p => p.nivelInteres === nivelInteresFilter.value)
    }
    if (sistemaActualFilter.value) {
      list = list.filter(p => p.sistemaActual === sistemaActualFilter.value)
    }
    if (estadoComercialFilter.value) {
      list = list.filter(p => p.estadoComercial === estadoComercialFilter.value)
    }
    return list
  })

  const uniqueProvincias = computed(() => {
    const provincias = new Set()
    for (const p of pharmacyProspects.value) {
      if (p.provincia) provincias.add(p.provincia)
    }
    return [...provincias].sort((a, b) => a.localeCompare(b, 'es'))
  })

  const uniqueCiudades = computed(() => {
    const ciudades = new Set()
    const prov = provinciaFilter.value
    for (const p of pharmacyProspects.value) {
      if (prov && p.provincia !== prov) continue
      const city = p.city || detectCity(p.address)
      if (city && city !== 'Sin ciudad') ciudades.add(city)
    }
    return [...ciudades].sort((a, b) => a.localeCompare(b, 'es'))
  })

  const uniqueSistemasActuales = computed(() => {
    const sistemas = new Set()
    for (const p of pharmacyProspects.value) {
      if (p.sistemaActual) sistemas.add(p.sistemaActual)
    }
    return [...sistemas].sort()
  })

  const pharmacyProspectsByProvincia = computed(() => {
    const groups = {}
    const filtered = filteredPharmacyProspects.value
    for (const p of filtered) {
      const prov = p.provincia || 'Sin provincia'
      if (!groups[prov]) groups[prov] = {}
      const city = p.city || detectCity(p.address) || 'Sin ciudad'
      if (!groups[prov][city]) groups[prov][city] = []
      groups[prov][city].push(p)
    }
    const sorted = Object.keys(groups).sort((a, b) => a.localeCompare(b, 'es'))
    return sorted.map(prov => ({
      provincia: prov,
      ciudades: Object.keys(groups[prov])
        .sort((a, b) => a.localeCompare(b, 'es'))
        .map(city => ({ ciudad: city, prospects: groups[prov][city] }))
    }))
  })

  const pharmacyStats = computed(() => {
    const safe = pharmacyProspects.value
    const total = safe.length
    const contactadas = safe.filter(p => p.estadoComercial === 'contactado' || p.estadoComercial === 'interesado' || p.estadoComercial === 'no_interesado' || p.estadoComercial === 'visita_agendada' || p.estadoComercial === 'cliente').length
    const interesadas = safe.filter(p => p.nivelInteres === 'alto' || p.nivelInteres === 'medio').length
    const sinContactar = safe.filter(p => p.estadoComercial === 'sin_contactar' || !p.estadoComercial).length
    const conPrecio = safe.filter(p => p.precioMensualActual && p.precioMensualActual > 0)
    const precioPromedio = conPrecio.length > 0
      ? conPrecio.reduce((s, p) => s + Number(p.precioMensualActual), 0) / conPrecio.length
      : 0
    const sistemaCount = {}
    for (const p of safe) {
      if (p.sistemaActual) {
        sistemaCount[p.sistemaActual] = (sistemaCount[p.sistemaActual] || 0) + 1
      }
    }
    const sistemasMasUsados = Object.entries(sistemaCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([sistema, count]) => ({ sistema, count }))
    return { total, contactadas, interesadas, sinContactar, precioPromedio, sistemasMasUsados }
  })

  const prospectsByCity = computed(() => {
    const groups = {}
    const filtered = filteredProspects.value
    for (const p of filtered) {
      const city = detectCity(p.address)
      if (!groups[city]) groups[city] = []
      groups[city].push(p)
    }
    return Object.keys(groups)
      .sort((a, b) => a.localeCompare(b, 'es'))
      .map(city => ({ city, prospects: groups[city] }))
  })

  async function addProspect(data) {
    const prospect = {
      id: genId(),
      place_id: data.placeId || data.place_id || '',
      name: data.name || '',
      category: data.category || '',
      address: data.address || '',
      phone: data.phone || data.phoneNumber || '',
      email: data.email || '',
      website: data.website || '',
      rating: data.rating || null,
      city: data.city || '',
      origin: data.origin || 'Google Maps',
      status: data.status || 'new',
      notes: data.notes || '',
      contact_made: false,
      last_contact: data.last_contact || null,
      next_contact: data.next_contact || null,
      provincia: data.provincia || '',
      whatsapp: data.whatsapp || '',
      instagram: data.instagram || '',
      googleMapsUrl: data.googleMapsUrl || data.google_maps_url || '',
      sistemaActual: data.sistemaActual || data.sistema_actual || '',
      precioMensualActual: data.precioMensualActual || data.precio_mensual_actual || null,
      cantidadSucursales: data.cantidadSucursales || data.cantidad_sucursales || 1,
      cantidadPuestos: data.cantidadPuestos || data.cantidad_puestos || 1,
      nivelInteres: data.nivelInteres || data.nivel_interes || 'bajo',
      estadoComercial: data.estadoComercial || data.estado_comercial || 'sin_contactar',
      problemasDetectados: data.problemasDetectados || data.problemas_detectados || '',
      observaciones: data.observaciones || '',
      precioEstimadoRecomendado: data.precioEstimadoRecomendado || data.precio_estimado_recomendado || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const exists = localProspects.value.find(p =>
      p.place_id && p.place_id === prospect.place_id
    )
    if (exists) return false
    localProspects.value.unshift(prospect)
    syncToStore()

    const store = useAppStore()
    if (store.userId) {
      const { error } = await supabase.from('prospects').insert([{
        user_id: store.userId,
        place_id: prospect.place_id,
        name: prospect.name,
        category: prospect.category,
        address: prospect.address,
        phone: prospect.phone,
        email: prospect.email,
        website: prospect.website,
        rating: prospect.rating,
        city: prospect.city,
        origin: prospect.origin,
        status: prospect.status,
        notes: prospect.notes,
        contact_made: false,
        last_contact: prospect.last_contact,
        next_contact: prospect.next_contact,
        provincia: prospect.provincia || null,
        whatsapp: prospect.whatsapp || null,
        instagram: prospect.instagram || null,
        google_maps_url: prospect.googleMapsUrl || null,
        sistema_actual: prospect.sistemaActual || null,
        precio_mensual_actual: prospect.precioMensualActual,
        cantidad_sucursales: prospect.cantidadSucursales,
        cantidad_puestos: prospect.cantidadPuestos,
        nivel_interes: prospect.nivelInteres,
        estado_comercial: prospect.estadoComercial,
        problemas_detectados: prospect.problemasDetectados,
        observaciones: prospect.observaciones,
        precio_estimado_recomendado: prospect.precioEstimadoRecomendado,
      }]).select().single()
      if (!error) {
        const idx = localProspects.value.findIndex(p => p.id === prospect.id)
        if (idx !== -1) localProspects.value[idx].id = data.id
      }
    }
    return true
  }

  async function updateProspect(id, updates) {
    if (id == null) return false
    const idx = localProspects.value.findIndex(p => p.id === id || p.place_id === id)
    if (idx === -1) return false
    localProspects.value[idx] = {
      ...localProspects.value[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    syncToStore()

    const store = useAppStore()
    if (store.userId) {
      const p = localProspects.value[idx]
      if (p.id) {
        await supabase.from('prospects').update(updates).eq('id', p.id)
      } else if (p.place_id) {
        await supabase.from('prospects').update(updates).eq('place_id', p.place_id)
      }
    }
    return true
  }

  async function removeProspect(id) {
    if (id == null) return
    localProspects.value = localProspects.value.filter(p => p.id !== id && p.place_id !== id)
    syncToStore()

    const store = useAppStore()
    if (store.userId) {
      await supabase.from('prospects').delete().eq('id', id)
    }
  }

  function setStatus(id, status) {
    return updateProspect(id, { status })
  }

  function addNote(id, note) {
    if (id == null) return
    const idx = localProspects.value.findIndex(p => p.id === id || p.place_id === id)
    if (idx === -1) return
    const existing = localProspects.value[idx].notes || ''
    const timestamp = new Date().toLocaleString('es-AR')
    const newNote = existing
      ? `${existing}\n[${timestamp}] ${note}`
      : `[${timestamp}] ${note}`
    const store = useAppStore()
    if (store.userId) {
      supabase.from('prospects').update({ notes: newNote }).eq('id', id)
    }
    localProspects.value[idx].notes = newNote
    localProspects.value[idx].updated_at = new Date().toISOString()
    syncToStore()
  }

  function scheduleFollowUp(id, date) {
    if (id == null) return
    const idx = localProspects.value.findIndex(p => p.id === id || p.place_id === id)
    if (idx === -1) return
    localProspects.value[idx].next_contact = date
    localProspects.value[idx].updated_at = new Date().toISOString()
    syncToStore()
    const store = useAppStore()
    if (store.userId) {
      supabase.from('prospects').update({ next_contact: date }).eq('id', id)
    }
  }

  function setLastContact(id) {
    if (id == null) return
    const now = new Date().toISOString()
    const idx = localProspects.value.findIndex(p => p.id === id || p.place_id === id)
    if (idx === -1) return
    localProspects.value[idx].last_contact = now
    localProspects.value[idx].contact_made = true
    localProspects.value[idx].updated_at = new Date().toISOString()
    syncToStore()
    const store = useAppStore()
    if (store.userId) {
      supabase.from('prospects').update({ last_contact: now, contact_made: true }).eq('id', id)
    }
  }

  return {
    prospects,
    searchQuery,
    statusFilter,
    showOverdueOnly,
    provinciaFilter,
    ciudadFilter,
    nivelInteresFilter,
    sistemaActualFilter,
    estadoComercialFilter,
    statsByStatus,
    overdueProspects,
    filteredProspects,
    filteredPharmacyProspects,
    uniqueProvincias,
    uniqueCiudades,
    uniqueSistemasActuales,
    pharmacyProspectsByProvincia,
    pharmacyStats,
    prospectsByCity,
    addProspect,
    updateProspect,
    removeProspect,
    setStatus,
    addNote,
    scheduleFollowUp,
    setLastContact,
  }
}
