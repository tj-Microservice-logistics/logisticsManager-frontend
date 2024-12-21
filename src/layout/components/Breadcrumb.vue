<template>
  <div class="breadcrumb">
    {{ currentTitle }}
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentTitle = ref('')

const getTitle = () => {
  const matched = route.matched
  if (matched.length > 0) {
    const lastRoute = matched[matched.length - 1]
    currentTitle.value = lastRoute.meta?.title as string || ''
  }
}

watch(
  () => route.path,
  () => {
    getTitle()
  },
  {
    immediate: true
  }
)
</script>

<style scoped lang="scss">
.breadcrumb {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
</style> 