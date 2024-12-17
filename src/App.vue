<template>
  <router-view v-if="isRouteGenerated" />
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
</style> 