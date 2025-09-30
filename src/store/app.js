// stores/useAppStore.js
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    searchResults: [],
    selectedCityLocation: { lat: -31.537297012068002, lng: -68.52507581988237 },
    center: { lat: -31.537297012068002, lng: -68.52507581988237 },
    selectedLocationName: '' // Nuevo estado para el nombre de la ubicación seleccionada
  }),
 // Dentro de tu store de Pinia
actions: {
  setSearchResults(results) {
    if (Array.isArray(results)) {
      this.searchResults = results;
    } else {
      console.error('setSearchResults: provided data is not an array', results);
    }
  },
  setSelectedCityLocation(location) {
    this.selectedCityLocation = location;
  },
  setSelectedLocationName(name) {
    this.selectedLocationName = name;
  }
}

})
