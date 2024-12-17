<template>
  <div class="business-container">
    <el-card class="menu-card">
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        router
      >
        <el-menu-item index="/business/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/business/waybills">
          <el-icon><Tickets /></el-icon>
          <span>运单管理</span>
        </el-menu-item>
      </el-menu>
    </el-card>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Tickets } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.business-container {
  padding: 20px;

  .menu-card {
    margin-bottom: 20px;

    :deep(.el-menu--horizontal) {
      border-bottom: none;

      .el-menu-item {
        height: 50px;
        line-height: 50px;
        
        .el-icon {
          margin-right: 8px;
        }
      }
    }
  }
}
</style> 