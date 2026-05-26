import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    searchResults: [],
    selectedCityLocation: { lat: -31.537297012068002, lng: -68.52507581988237 },
    center: { lat: -31.537297012068002, lng: -68.52507581988237 },
    selectedLocationName: '',
    currentSearchParams: {
      city: '',
      type: '',
    },
    prospects: JSON.parse(localStorage.getItem('prospects') || '[]'),
    dashboardStats: {
      totalProspects: 0,
      citiesAnalyzed: 0,
      accommodationsFound: 0,
      contactsMade: 0,
      conversions: 0,
    },
  }),

  getters: {
    prospectStats: (state) => {
      const total = state.prospects.length
      const contacted = state.prospects.filter(p => p.status === 'contacted' || p.status === 'interested' || p.status === 'closed').length
      const interested = state.prospects.filter(p => p.status === 'interested').length
      const closed = state.prospects.filter(p => p.status === 'closed').length
      return { total, contacted, interested, closed }
    },
  },

  actions: {
    setSearchResults(results) {
      if (Array.isArray(results)) {
        this.searchResults = results
        this.dashboardStats.accommodationsFound = results.length
        this.saveToLocalStorage()
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

    addProspect(prospect) {
      const exists = this.prospects.find(p => p.placeId === prospect.placeId)
      if (exists) return false
      this.prospects.unshift({
        ...prospect,
        id: Date.now().toString(),
        status: 'new',
        priority: 'medium',
        notes: '',
        contactMade: false,
        lastContact: null,
        createdAt: new Date().toISOString(),
      })
      this.dashboardStats.totalProspects = this.prospects.length
      this.saveToLocalStorage()
      return true
    },

    updateProspect(id, updates) {
      const index = this.prospects.findIndex(p => p.id === id)
      if (index !== -1) {
        this.prospects[index] = { ...this.prospects[index], ...updates }
        this.saveToLocalStorage()
      }
    },

    removeProspect(id) {
      this.prospects = this.prospects.filter(p => p.id !== id)
      this.dashboardStats.totalProspects = this.prospects.length
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('prospects', JSON.stringify(this.prospects))
    },

    initStats() {
      this.dashboardStats.totalProspects = this.prospects.length
      const cities = new Set(this.prospects.map(p => p.city).filter(Boolean))
      this.dashboardStats.citiesAnalyzed = cities.size
      this.dashboardStats.contactsMade = this.prospects.filter(p => p.contactMade).length
      this.dashboardStats.conversions = this.prospects.filter(p => p.status === 'closed').length
    },
  },
})
