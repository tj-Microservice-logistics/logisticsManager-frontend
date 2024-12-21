<template>
  <div class="sidebar">
    <div class="logo">
      <span>物流管理系统</span>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      background-color="#fff"
      text-color="#666"
      active-text-color="#333"
      router
    >
      <template v-for="route in menuRoutes" :key="route.path">
        <!-- 有子菜单的情况 -->
        <el-sub-menu 
          v-if="route.children && route.children.length > 0" 
          :index="`/${route.path}`"
        >
          <template #title>
            <el-icon><component :is="route.meta?.icon" /></el-icon>
            <span>{{ route.meta?.title }}</span>
          </template>
          <el-menu-item 
            v-for="child in route.children"
            :key="`/${route.path}/${child.path}`"
            :index="`/${route.path}/${child.path}`"
          >
            <el-icon><component :is="child.meta?.icon" /></el-icon>
            <template #title>{{ child.meta?.title }}</template>
          </el-menu-item>
        </el-sub-menu>
        
        <!-- 没有子菜单的情况 -->
        <el-menu-item 
          v-else 
          :index="`/${route.path}`"
        >
          <el-icon><component :is="route.meta?.icon" /></el-icon>
          <template #title>{{ route.meta?.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'

const route = useRoute()
const store = useStore()

const menuRoutes = computed(() => {
  const routes = store.state.permission.routes || []
  return routes.filter(route => !route.meta?.hidden)
})
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.sidebar {
  height: 100%;
  border-right: 1px solid #eee;
  background-color: #fff;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #eee;
    
    span {
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  :deep(.el-menu) {
    border-right: none;
  }

  :deep(.el-sub-menu .el-sub-menu__title) {
    color: #666;
    
    &:hover {
      background-color: #f6f6f6;
      color: #333;
    }
  }

  :deep(.el-menu-item) {
    color: #666;
    
    &:hover {
      background-color: #f6f6f6;
      color: #333;
    }
    
    &.is-active {
      background-color: #f3f5f9;
      color: #333;
      font-weight: 500;
    }
  }

  :deep(.el-icon) {
    color: inherit;
  }
}
</style> 