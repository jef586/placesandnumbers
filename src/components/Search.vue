<template>
  <v-sheet width="300" class="mx-auto">
    <v-form @submit.prevent>
      <v-text-field 
        id="autocomplete"
        clearable
        v-model="selectedCity"
        label="Indique la ciudad"
        :items="autocompleteOptions"
        @input="updateAutocompleteOptions"
      ></v-text-field >
      <v-select
        v-model="business"
        :items="options"
        item-value="value"
        label="Tipo de negocios"
        required
      ></v-select>
      <v-btn type="submit" block class="mt-2" @click="buscar">Buscar</v-btn>
    </v-form>
  </v-sheet>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { initSearch } from "@/composables/maps";
import { useAppStore } from "@/store/app";

const store = useAppStore();
const selectedCity = ref(""); // Nuevo ref para manejar la opción seleccionada del autocompletado
const business = ref("");
const searchResults = ref([]);
let autocompleteInput;
const autocompleteOptions = ref([]);
const selectedCityLocation = ref("")

const options = [
  { title: "Restaurante", value: "restaurant" },
  { title: "Bar", value: "bar" },
  { title: "Cafe", value: "cafe" },
  { title: "Almacen", value: "store" },
  { title: "Panadería", value: "bakery" },
  { title: "Hotel", value: "lodging" },
  { title: "Dietética", value: "dietetica" },

];

const rules = [(value) => value || "You must enter a value"];

const buscar = () => {
  initSearch(selectedCity.value, business.value, (results) => {
    searchResults.value = results;
    store.setSearchResults(results);
  });
};

autocompleteInput = () => {
  const center = { lat: -31.537297012068002, lng: -68.52507581988237 };
  const defaultBounds = {
    north: center.lat + 0.1,
    south: center.lat - 0.1,
    east: center.lng + 0.1,
    west: center.lng - 0.1,
  };
  const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: "ar" },
    fields: ["address_components", "geometry", "icon", "name"],
    strictBounds: false,
    types: ["locality"],
  };
  const input = document.getElementById("autocomplete");
  const autocomplete = new google.maps.places.Autocomplete(input, options);
  console.log(autocomplete)
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    console.log(place)
    if (!place.geometry || !place.geometry.location) {
      return;
    }
    selectedCity.value = place.name 
    selectedCityLocation.value = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };
    store.setSelectedCityLocation(selectedCityLocation.value);
    console.log(selectedCityLocation.value);
  });
};

const updateAutocompleteOptions = () => {
  autocompleteOptions.value = [];
};

onMounted(() => {
  autocompleteInput();
});
</script>
