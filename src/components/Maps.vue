<template>
  <div>
    <GoogleMap style="width: 100%; height: 1000px" :center="center" :zoom="15" v-if="filteredResults">
      <Marker v-for="(result, index) in filteredResults" :key="index" :options="{ position: { lat: result.location.lat, lng: result.location.lng  , scrollwheel: true} }" @click="showInfoWindow(result)" >
        <InfoWindow 
        :position="{ lat: result.location.lat, lng: result.location.lng }"  
        :options="{ 
          pixelOffset: { width: 0, height: -35 },
          content: `${result.name}`
        }" 
        :visible="result === selectedResult" 
        />
      </Marker>
    </GoogleMap>
  </div>
</template>

<script setup>
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";
import { useAppStore } from "@/store/app";
import { ref, watch } from "vue";

const store = useAppStore();
const center = ref(store.selectedCityLocation); // Usamos una referencia para que se actualice automáticamente
const searchResults = store.searchResults || [];
const selectedResult = ref(null);

// Variable ref para almacenar los resultados filtrados
const filteredResults = ref([]);

// Observa los cambios en searchResults y actualiza filteredResults
watch(() => store.searchResults, (newSearchResults) => {
  // Filtra los resultados cuando searchResults cambie
  filteredResults.value = newSearchResults.filter((result) => result.location);
  console.log(filteredResults)
});

// Observa los cambios en selectedCityLocation y actualiza center
watch(() => store.selectedCityLocation, (newCenter) => {
  center.value = newCenter;
});

const showInfoWindow = (result) => {
  selectedResult.value = result;
};
</script>
