<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ 'is-collapse': isCollapse }">
      <Sidebar />
    </div>
    
    <!-- 主要内容区 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <Navbar />
      </div>
      
      <!-- 主要内容 -->
      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'

const store = useStore()
const isCollapse = computed(() => store.state.app.sidebar.isCollapse)
</script>

<style scoped lang="scss">
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;

  .sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 210px;
    height: 100vh;
    background-color: #304156;
    transition: width 0.28s;
    z-index: 1001;
    overflow-y: auto;
    overflow-x: hidden;

    &.is-collapse {
      width: 64px;
    }

    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  .main-container {
    position: relative;
    margin-left: 210px;
    min-height: 100%;
    transition: margin-left 0.28s;
    
    .navbar {
      position: fixed;
      top: 0;
      right: 0;
      left: 210px;
      height: 50px;
      background-color: #fff;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      transition: left 0.28s;
      z-index: 1000;
    }
    
    .app-main {
      padding: 70px 20px 20px;
      min-height: calc(100vh - 50px);
      background-color: #f0f2f5;
      position: relative;
    }
  }

  // 当侧边栏收起时
  .is-collapse + .main-container {
    margin-left: 64px;
    
    .navbar {
      left: 64px;
    }
  }
}

// 添加滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}
</style> 