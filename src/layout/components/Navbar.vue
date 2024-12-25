<template>
  <div class="navbar">
    <div class="left">
      <Breadcrumb />
    </div>
    
    <div class="right">
      <el-dropdown trigger="click">
        <div class="avatar-container">
          <span class="name">管理员</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import Breadcrumb from './Breadcrumb.vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()
const isCollapse = computed(() => store.state.app.sidebar.isCollapse)

const toggleSidebar = () => {
  store.dispatch('app/toggleSidebar')
}

const handleProfile = () => {
  // 处理查看个人信息
}

const handleLogout = () => {
  // 清除 localStorage 中的 token 或用户信息
  localStorage.removeItem('token')
  
  // 跳转到登录界面
  router.push('/login')
}
</script>

<style scoped lang="scss">
.navbar {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: #fff;
  
  .right {
    .avatar-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #666;
      
      .name {
        font-size: 14px;
      }

      &:hover {
        color: #333;
      }
    }
  }
}
</style> 