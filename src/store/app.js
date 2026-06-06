import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null,
    searchResults: [],
    selectedCityLocation: { lat: -31.537297012068002, lng: -68.52507581988237 },
    center: { lat: -31.537297012068002, lng: -68.52507581988237 },
    selectedLocationName: '',
    currentSearchParams: { city: '', type: '', categoryGroup: '' },
    prospects: [],
    dbReady: false,
  }),

  getters: {
    userId: (state) => state.user?.id,
    prospectStats: (state) => {
      const total = state.prospects.length
      const contacted = state.prospects.filter(p => p.status === 'contacted' || p.status === 'interested' || p.status === 'closed').length
      const interested = state.prospects.filter(p => p.status === 'interested').length
      const closed = state.prospects.filter(p => p.status === 'closed').length
      return { total, contacted, interested, closed }
    },
    dashboardStats: (state) => ({
      totalProspects: state.prospects.length,
      citiesAnalyzed: new Set(state.prospects.map(p => p.city).filter(Boolean)).size,
      accommodationsFound: state.searchResults.length,
      contactsMade: state.prospects.filter(p => p.contact_made).length,
      conversions: state.prospects.filter(p => p.status === 'closed').length,
    }),
  },

  actions: {
    setUser(user) {
      this.user = user
    },

    async fetchProspects() {
      if (!this.userId) return
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
      if (!error) {
        this.prospects = data || []
        this.dbReady = true
      }
    },

    async addProspect(prospect) {
      if (!this.userId) return false
      const exists = this.prospects.find(p => p.place_id === prospect.placeId)
      if (exists) return false

      const { data, error } = await supabase
        .from('prospects')
        .insert([{
          user_id: this.userId,
          place_id: prospect.placeId,
          name: prospect.name,
          category: prospect.category || '',
          address: prospect.address || '',
          phone: prospect.phone || '',
          website: prospect.website || '',
          rating: prospect.rating || null,
          city: prospect.city || '',
          status: 'new',
          priority: 'medium',
          notes: '',
          contact_made: false,
          last_contact: null,
        }])
        .select()
        .single()

      if (!error && data) {
        this.prospects.unshift(data)
        return true
      }
      return false
    },

    async updateProspect(id, updates) {
      const { data, error } = await supabase
        .from('prospects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        const idx = this.prospects?.findIndex(p => p.id === id)
        if (idx !== -1) this.prospects[idx] = data
      }
    },

    async removeProspect(id) {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', id)
      if (!error) {
        this.prospects = this.prospects.filter(p => p.id !== id)
      }
    },

    async saveSearch(city, type, resultsCount) {
      if (!this.userId) return
      await supabase
        .from('search_history')
        .insert([{ user_id: this.userId, city, type, results_count: resultsCount }])
    },

    setSearchResults(results) {
      if (Array.isArray(results)) {
        this.searchResults = results
      }
    },

    setSelectedCityLocation(location) {
      this.selectedCityLocation = location
    },

    setSelectedLocationName(name) {
      this.selectedLocationName = name
    },

    setCurrentSearchParams(params) {
      this.currentSearchParams = params
    },
  },
})
