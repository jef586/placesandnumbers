<template>
  <div class="container">
    <div class="left-side">
      <Maps />
    </div>
    <div class="right-side">
      <div class="hello">
        <HelloWorld />
      </div>
      <div class="search">
        <Search />
      </div>
      <div class="results">
        <Results />
      </div>
    </div>
  </div>
</template>

<script setup>
import HelloWorld from '@/components/HelloWorld.vue'
import Search from '@/components/Search.vue'
import Results from '@/components/Results.vue'
import Maps from '@/components/Maps.vue'
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Dos columnas de igual ancho */
  gap: 20px; /* Espacio entre las columnas */
}

.left-side {
  grid-column: 1; /* La columna izquierda */
}

.right-side {
  grid-column: 2; /* La columna derecha */
}

/* Estilos específicos para pantallas pequeñas */
@media screen and (max-width: 768px) {
  .container {
    grid-template-columns: 1fr; /* Una sola columna en pantallas pequeñas */
  }
  
  .right-side {
    grid-column: auto; /* La columna derecha se ajustará automáticamente */
  }
}
</style>
