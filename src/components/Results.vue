<template>
  <v-data-table :headers="headers" :items="results" class="elevation-1">
    <template v-slot:item.name="{ item }">
      <strong>{{ item.name }}</strong>
    </template>
    <template v-slot:item.phoneNumber="{ item }">
      <div>
        <span>{{ item.phoneNumber }}</span>
        <a v-if="item.phoneNumber" :href="'https://api.whatsapp.com/send/?phone=%2B' + item.phoneNumber.replace(/^0/, '')">
          <v-icon>mdi-whatsapp</v-icon>
        </a>
        <a v-if="item.phoneNumber" :href="'tel:+' + item.phoneNumber.replace(/^0/, '')">
          <v-icon>mdi-phone</v-icon>
        </a>
      </div>
    </template>
    <template v-slot:item.website="{ item }">
      <a :href="item.website" target="_blank">{{ item.website }}</a>
    </template>
  </v-data-table>
</template>

<script setup>
import { useAppStore } from "@/store/app";
import { computed } from 'vue';

const store = useAppStore();

// Si los resultados de búsqueda incluyen más información, puedes seleccionar qué mostrar.
const results = computed(() => store.searchResults.map(result => ({
  name: result.name,
  phoneNumber: result.phoneNumber,
  website: result.website,
  // más campos si son necesarios
})));

const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Phone Number', value: 'phoneNumber' },
  { title: 'Website', value: 'website' },
  // más cabeceras si son necesarias
];
</script>
