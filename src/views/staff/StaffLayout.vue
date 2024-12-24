<template>
  <div class="staff-container">
    <el-card class="menu-card">
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        router
      >
        <el-menu-item index="/staff/drivers">
          <el-icon><User /></el-icon>
          <span>司机管理</span>
        </el-menu-item>
        <el-menu-item index="/staff/schedule">
          <el-icon><Clock /></el-icon>
          <span>排班管理</span>
        </el-menu-item>
      </el-menu>
    </el-card>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.staff-container {
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