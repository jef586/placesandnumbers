import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useSupabaseDb() {
  const prospects = ref([])
  const loading = ref(false)

  const fetchProspects = async (userId) => {
    if (!userId) return
    loading.value = true
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) prospects.value = data || []
    loading.value = false
    return { data: prospects.value, error }
  }

  const addProspect = async (prospect, userId) => {
    if (!userId) return { error: 'No authenticated' }
    const { data, error } = await supabase
      .from('prospects')
      .insert([{ ...prospect, user_id: userId }])
      .select()
      .single()
    if (!error && data) {
      prospects.value.unshift(data)
    }
    return { data, error }
  }

  const updateProspect = async (id, updates) => {
    const { data, error } = await supabase
      .from('prospects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      const idx = prospects.value.findIndex(p => p.id === id)
      if (idx !== -1) prospects.value[idx] = data
    }
    return { data, error }
  }

  const removeProspect = async (id) => {
    const { error } = await supabase
      .from('prospects')
      .delete()
      .eq('id', id)
    if (!error) {
      prospects.value = prospects.value.filter(p => p.id !== id)
    }
    return { error }
  }

  const saveSearch = async (search, userId) => {
    if (!userId) return
    await supabase
      .from('search_history')
      .insert([{ ...search, user_id: userId }])
  }

  return {
    prospects,
    loading,
    fetchProspects,
    addProspect,
    updateProspect,
    removeProspect,
    saveSearch,
  }
}
