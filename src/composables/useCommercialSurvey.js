import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/app'

const STORAGE_KEY = 'placeandnumbers_comercial_prospects'

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
  } catch {}
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export const rubros = [
  'Supermercado', 'Mercado', 'Autoservicio', 'Almacén', 'Kiosco',
  'Ferretería', 'Corralón', 'Distribuidora', 'Veterinaria', 'Pinturería',
  'Librería', 'Casa de repuestos', 'Casa de electricidad', 'Casa de computación',
  'Electrónica', 'Otro',
]

export const estadoComercialOptions = [
  { value: 'sin_contactar', label: 'Sin contactar', color: 'slate' },
  { value: 'contactado', label: 'Contactado', color: 'blue' },
  { value: 'interesado', label: 'Interesado', color: 'emerald' },
  { value: 'demo_agendada', label: 'Demo agendada', color: 'violet' },
  { value: 'propuesta_enviada', label: 'Propuesta enviada', color: 'indigo' },
  { value: 'cliente', label: 'Cliente', color: 'amber' },
  { value: 'no_interesado', label: 'No interesado', color: 'orange' },
]

export function estadoComercialLabel(value) {
  const opt = estadoComercialOptions.find(e => e.value === value)
  return opt ? opt.label : value || 'Sin contactar'
}

export function calculateOportunidad(p) {
  if (!p) return 'media'
  const noWeb = !p.website || p.website === ''
  const noStock = !p.control_stock
  const noSistema = !p.software_actual || p.software_actual === ''
  const software = (p.software_actual || '').toLowerCase()

  if (noWeb && noStock && noSistema) return 'alta'
  if (software.includes('excel') || software.includes('manual') || software.includes('papel')) return 'media'
  if (p.software_actual && !software.includes('excel') && !software.includes('manual')) return 'baja'

  return 'media'
}

export const oportunidadConfig = {
  alta: { label: 'Alta', color: 'rose', icon: 'Flame' },
  media: { label: 'Media', color: 'amber', icon: 'Circle' },
  baja: { label: 'Baja', color: 'emerald', icon: 'Circle' },
}

const localProspects = ref(loadLocal())

watch(localProspects, saveLocal, { deep: true })

let initialFetchDone = false

export function useCommercialSurvey() {
  const searchQuery = ref('')
  const rubroFilter = ref('')
  const provinciaFilter = ref('')
  const ciudadFilter = ref('')
  const estadoComercialFilter = ref('')
  const oportunidadFilter = ref('')
  const showKanban = ref(false)

  const prospects = computed({
    get: () => localProspects.value,
    set: (val) => { localProspects.value = val },
  })

  const filteredProspects = computed(() => {
    let list = localProspects.value || []
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.rubro?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)
      )
    }
    if (rubroFilter.value) {
      list = list.filter(p => p.rubro === rubroFilter.value)
    }
    if (provinciaFilter.value) {
      list = list.filter(p => p.provincia === provinciaFilter.value)
    }
    if (ciudadFilter.value) {
      list = list.filter(p => (p.city || '') === ciudadFilter.value)
    }
    if (estadoComercialFilter.value) {
      list = list.filter(p => p.estadoComercial === estadoComercialFilter.value)
    }
    if (oportunidadFilter.value) {
      list = list.filter(p => calculateOportunidad(p) === oportunidadFilter.value)
    }
    return list
  })

  const uniqueRubros = computed(() => {
    const set = new Set()
    for (const p of localProspects.value) {
      if (p.rubro) set.add(p.rubro)
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'))
  })

  const uniqueProvincias = computed(() => {
    const set = new Set()
    for (const p of localProspects.value) {
      if (p.provincia) set.add(p.provincia)
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'))
  })

  const uniqueCiudades = computed(() => {
    const set = new Set()
    const prov = provinciaFilter.value
    for (const p of localProspects.value) {
      if (prov && p.provincia !== prov) continue
      if (p.city) set.add(p.city)
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'))
  })

  const prospectsByProvincia = computed(() => {
    const groups = {}
    const filtered = filteredProspects.value
    for (const p of filtered) {
      const prov = p.provincia || 'Sin provincia'
      if (!groups[prov]) groups[prov] = {}
      const city = p.city || 'Sin ciudad'
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

  const kanbanColumns = computed(() => {
    const columns = {}
    for (const opt of estadoComercialOptions) {
      if (opt.value === 'no_interesado') continue
      columns[opt.value] = {
        label: opt.label,
        color: opt.color,
        items: (localProspects.value || []).filter(
          p => (p.estadoComercial || 'sin_contactar') === opt.value
        ),
      }
    }
    return columns
  })

  const stats = computed(() => {
    const safe = localProspects.value || []
    const total = safe.length
    const sinContactar = safe.filter(p => !p.estadoComercial || p.estadoComercial === 'sin_contactar').length
    const contactados = safe.filter(p => p.estadoComercial === 'contactado').length
    const interesados = safe.filter(p => p.estadoComercial === 'interesado').length
    const demos = safe.filter(p => p.estadoComercial === 'demo_agendada').length
    const propuestas = safe.filter(p => p.estadoComercial === 'propuesta_enviada').length
    const clientes = safe.filter(p => p.estadoComercial === 'cliente').length

    const potencialMensual = safe.reduce((sum, p) => {
      return sum + (Number(p.precio_objetivo) || Number(p.precio_actual_sistema) || 0)
    }, 0)
    const comisionEstimada = potencialMensual * 0.15

    return {
      total, sinContactar, contactados, interesados,
      demos, propuestas, clientes,
      potencialMensual, comisionEstimada,
    }
  })

  async function initFetch() {
    if (initialFetchDone) return
    const store = useAppStore()
    if (!store.userId) return
    if (localProspects.value.length > 0) {
      initialFetchDone = true
      return
    }
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('user_id', store.userId)
      .eq('tipo_relevamiento', 'comercial')
      .order('created_at', { ascending: false })
    if (!error && data) {
      localProspects.value = data
    }
    initialFetchDone = true
  }

  async function addProspect(data) {
    const prospect = {
      id: genId(),
      place_id: data.placeId || data.place_id || '',
      name: data.name || '',
      category: data.category || 'Comercial',
      rubro: data.rubro || '',
      address: data.address || '',
      phone: data.phone || data.phoneNumber || '',
      email: data.email || '',
      website: data.website || '',
      rating: data.rating || null,
      city: data.city || '',
      provincia: data.provincia || '',
      whatsapp: data.whatsapp || '',
      instagram: data.instagram || '',
      googleMapsUrl: data.googleMapsUrl || data.google_maps_url || '',
      software_actual: data.software_actual || '',
      proveedor_actual: data.proveedor_actual || '',
      factura_electronica: data.factura_electronica || false,
      control_stock: data.control_stock || false,
      usa_lector_codigo: data.usa_lector_codigo || false,
      usa_balanza: data.usa_balanza || false,
      cantidad_cajas: data.cantidad_cajas || 0,
      cantidad_empleados: data.cantidad_empleados || 0,
      ventas_estimadas_mes: data.ventas_estimadas_mes || null,
      precio_actual_sistema: data.precio_actual_sistema || null,
      precio_objetivo: data.precio_objetivo || null,
      interes_cambio: data.interes_cambio || '',
      fecha_visita: data.fecha_visita || null,
      fecha_proximo_contacto: data.fecha_proximo_contacto || null,
      estadoComercial: data.estadoComercial || data.estado_comercial || 'sin_contactar',
      problemasDetectados: data.problemasDetectados || data.problemas_detectados || '',
      observaciones: data.observaciones || '',
      notas: data.notes || '',
      oportunidad_comercial: data.oportunidad_comercial || 'media',
      tipo_relevamiento: 'comercial',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const exists = localProspects.value.find(p =>
      p.place_id && p.place_id === prospect.place_id
    )
    if (exists) return false

    localProspects.value.unshift(prospect)

    const store = useAppStore()
    if (store.userId) {
      const { error } = await supabase.from('prospects').insert([{
        user_id: store.userId,
        tipo_relevamiento: 'comercial',
        place_id: prospect.place_id,
        name: prospect.name,
        category: prospect.category,
        rubro: prospect.rubro || null,
        address: prospect.address,
        phone: prospect.phone,
        email: prospect.email,
        website: prospect.website,
        rating: prospect.rating,
        city: prospect.city,
        provincia: prospect.provincia || null,
        whatsapp: prospect.whatsapp || null,
        instagram: prospect.instagram || null,
        google_maps_url: prospect.googleMapsUrl || null,
        software_actual: prospect.software_actual || null,
        proveedor_actual: prospect.proveedor_actual || null,
        factura_electronica: prospect.factura_electronica,
        control_stock: prospect.control_stock,
        usa_lector_codigo: prospect.usa_lector_codigo,
        usa_balanza: prospect.usa_balanza,
        cantidad_cajas: prospect.cantidad_cajas,
        cantidad_empleados: prospect.cantidad_empleados,
        ventas_estimadas_mes: prospect.ventas_estimadas_mes,
        precio_actual_sistema: prospect.precio_actual_sistema,
        precio_objetivo: prospect.precio_objetivo,
        interes_cambio: prospect.interes_cambio || null,
        fecha_visita: prospect.fecha_visita,
        fecha_proximo_contacto: prospect.fecha_proximo_contacto,
        estado_comercial: prospect.estadoComercial,
        problemas_detectados: prospect.problemasDetectados,
        observaciones: prospect.observaciones,
        notes: prospect.notas,
        oportunidad_comercial: calculateOportunidad(prospect),
      }]).select().single()
      if (!error && data) {
        const idx = localProspects.value.findIndex(p => p.id === prospect.id)
        if (idx !== -1) localProspects.value[idx].id = data.id
      }
    }
    return true
  }

  async function updateProspect(id, updates) {
    const idx = localProspects.value.findIndex(p => p.id === id || p.place_id === id)
    if (idx === -1) return false

    const merged = {
      ...localProspects.value[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    merged.oportunidad_comercial = calculateOportunidad(merged)
    localProspects.value[idx] = merged

    const store = useAppStore()
    if (store.userId) {
      const supabaseUpdates = {}
      for (const [key, val] of Object.entries(updates)) {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
        supabaseUpdates[snakeKey] = val
      }
      supabaseUpdates.oportunidad_comercial = merged.oportunidad_comercial
      await supabase.from('prospects').update(supabaseUpdates).eq('id', localProspects.value[idx].id)
    }
    return true
  }

  async function removeProspect(id) {
    const idx = localProspects.value.findIndex(p => p.id === id || p.place_id === id)
    if (idx === -1) return
    const realId = localProspects.value[idx].id
    localProspects.value = localProspects.value.filter(p => p.id !== id && p.place_id !== id)
    const store = useAppStore()
    if (store.userId) {
      await supabase.from('prospects').delete().eq('id', realId)
    }
  }

  function setEstado(id, estado) {
    return updateProspect(id, { estadoComercial: estado })
  }

  return {
    prospects,
    searchQuery,
    rubroFilter,
    provinciaFilter,
    ciudadFilter,
    estadoComercialFilter,
    oportunidadFilter,
    showKanban,
    filteredProspects,
    uniqueRubros,
    uniqueProvincias,
    uniqueCiudades,
    prospectsByProvincia,
    kanbanColumns,
    stats,
    initFetch,
    addProspect,
    updateProspect,
    removeProspect,
    setEstado,
  }
}
