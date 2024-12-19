<template>
  <div class="main-container">
  <router-view v-if="isRouteGenerated" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const isRouteGenerated = ref(false)

onMounted(async () => {
  await store.dispatch('permission/generateRoutes')
  isRouteGenerated.value = true
})
</script>

<style>
#app {
  height: 100vh;
}
.main-container {
  margin: 24px;
  background-color: #fff;
  overflow: auto;
  text-align: center;


  &::-webkit-scrollbar {
    width: 6px;
    height: 8px;
  }

  &::-webkit-scrollbar-button {
    display: none;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(144, 147, 153, 0.3);
    cursor: pointer;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-corner {
    display: none;
  }

  &::-webkit-resizer {
    display: none;
  }
}
</style> 