<template>
  <div class="navbar">
    <div class="left">
      <el-icon class="hamburger" @click="toggleSidebar">
        <Fold v-if="!isCollapse" />
        <Expand v-else />
      </el-icon>
      <Breadcrumb />
    </div>
    
    <div class="right">
      <el-dropdown trigger="click">
        <div class="avatar-container">
          <el-avatar :size="30" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          <span class="name">管理员</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfile">个人信息</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Fold, Expand } from '@element-plus/icons-vue'
import Breadcrumb from './Breadcrumb.vue'
import { useStore } from '@/store'

const store = useStore()
const isCollapse = computed(() => store.state.app.sidebar.isCollapse)

const toggleSidebar = () => {
  store.dispatch('app/toggleSidebar')
}

const handleProfile = () => {
  // 处理查看个人信息
}

const handleLogout = () => {
  // 处理退出登录
}
</script>

<style scoped lang="scss">
.navbar {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  
  .left {
    display: flex;
    align-items: center;
    
    .hamburger {
      margin-right: 20px;
      cursor: pointer;
      font-size: 20px;
    }
  }
  
  .right {
    .avatar-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .name {
        margin-left: 8px;
        font-size: 14px;
      }
    }
  }
}
</style> 