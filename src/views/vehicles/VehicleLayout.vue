<template>
  <div class="vehicles-container">
    <el-card class="menu-card">
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        router
      >
        <el-menu-item index="/vehicles/list">
          <el-icon><List /></el-icon>
          <span>车辆列表</span>
        </el-menu-item>
        <el-menu-item index="/vehicles/return">
          <el-icon><Calendar /></el-icon>
          <span>回车登记</span>
        </el-menu-item>
      </el-menu>
    </el-card>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { List, Calendar } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.vehicles-container {
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
