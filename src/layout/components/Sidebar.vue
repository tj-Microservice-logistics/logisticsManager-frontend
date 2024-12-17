<template>
  <div class="sidebar">
    <div class="logo">
      <img src="@/assets/logo.svg" alt="Logo" class="logo-img">
      <span v-if="!isCollapse">物流管理系统</span>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      unique-opened
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

const isCollapse = computed(() => store.state.app.sidebar.isCollapse)
const menuRoutes = computed(() => {
  const routes = store.state.permission.routes || []
  return routes.filter(route => !route.meta?.hidden)
})
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.sidebar {
  height: 100%;
  
  .logo {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #2b2f3a;
    
    .logo-img {
      width: 32px;
      height: 32px;
      filter: invert(1);
    }
    
    span {
      margin-left: 10px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
    }
  }
  
  :deep(.el-menu) {
    border-right: none;
  }
}
</style> 