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
    if (store.prospects && store.prospects.length > 0 && localProspects.value.length === 0) {
      localProspects.value = store.prospects
    }
    watch(
      () => store.prospects,
      (val) => {
        if (val && val.length > 0 && JSON.stringify(val) !== JSON.stringify(localProspects.value)) {
          localProspects.value = val
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
      status: 'new',
      notes: data.notes || '',
      contact_made: false,
      last_contact: data.last_contact || null,
      next_contact: data.next_contact || null,
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
        status: 'new',
        notes: '',
        contact_made: false,
        last_contact: null,
        next_contact: null,
      }]).select().single()
      if (!error) {
        const idx = localProspects.value.findIndex(p => p.id === prospect.id)
        if (idx !== -1) localProspects.value[idx].id = data.id
      }
    }
    return true
  }

  async function updateProspect(id, updates) {
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
      await supabase.from('prospects').update(updates).eq('id', localProspects.value[idx].id)
    }
    return true
  }

  async function removeProspect(id) {
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
    statsByStatus,
    overdueProspects,
    filteredProspects,
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
