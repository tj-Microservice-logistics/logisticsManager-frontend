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
import { ArrowDown } from '@element-plus/icons-vue'
import Breadcrumb from './Breadcrumb.vue'

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