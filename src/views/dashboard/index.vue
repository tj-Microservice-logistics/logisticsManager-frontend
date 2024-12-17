<template>
  <div class="dashboard-container">
    <!-- 数据统计卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>待处理订单</span>
                <el-tag type="warning">{{ pendingOrders }}</el-tag>
              </div>
            </template>
            <div class="card-content">
              <el-icon class="icon"><Document /></el-icon>
              <div class="stat-value">{{ pendingOrders }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>在途运单</span>
                <el-tag type="primary">{{ inTransitWaybills }}</el-tag>
              </div>
            </template>
            <div class="card-content">
              <el-icon class="icon"><Van /></el-icon>
              <div class="stat-value">{{ inTransitWaybills }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>空闲车辆</span>
                <el-tag type="success">{{ availableVehicles }}</el-tag>
              </div>
            </template>
            <div class="card-content">
              <el-icon class="icon"><TakeawayBox /></el-icon>
              <div class="stat-value">{{ availableVehicles }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>今日收入</span>
                <el-tag type="info">¥{{ todayIncome }}</el-tag>
              </div>
            </template>
            <div class="card-content">
              <el-icon class="icon"><Money /></el-icon>
              <div class="stat-value">¥{{ todayIncome }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 待办任务 -->
    <el-card class="task-card">
      <template #header>
        <div class="card-header">
          <span>待办任务</span>
          <el-button type="primary" link>查看全部</el-button>
        </div>
      </template>
      <el-table :data="todoTasks" style="width: 100%">
        <el-table-column prop="title" label="任务内容" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTaskTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 执行中的任务 -->
    <el-card class="task-card">
      <template #header>
        <div class="card-header">
          <span>执行中的任务</span>
          <el-button type="primary" link>查看全部</el-button>
        </div>
      </template>
      <el-table :data="inProgressTasks" style="width: 100%">
        <el-table-column prop="title" label="任务内容" />
        <el-table-column prop="assignee" label="负责人" width="120" />
        <el-table-column prop="progress" label="进度" width="180">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" />
          </template>
        </el-table-column>
        <el-table-column prop="estimatedTime" label="预计完成时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Document, Van, TakeawayBox, Money } from '@element-plus/icons-vue'

// 统计数据
const pendingOrders = ref(15)
const inTransitWaybills = ref(8)
const availableVehicles = ref(12)
const todayIncome = ref('12,580')

// 待办任务数据
const todoTasks = ref([
  {
    title: '新订单待处理 - 上海至北京',
    type: '订单处理',
    deadline: '2024-03-20 18:00',
    status: '待处理'
  },
  {
    title: '车辆年检提醒 - 沪A12345',
    type: '车辆管理',
    deadline: '2024-03-22 12:00',
    status: '紧急'
  }
])

// 执行中的任务
const inProgressTasks = ref([
  {
    title: '北京仓库货物配送',
    assignee: '张三',
    progress: 68,
    estimatedTime: '2024-03-21 15:00'
  },
  {
    title: '上海仓库库存盘点',
    assignee: '李四',
    progress: 35,
    estimatedTime: '2024-03-22 18:00'
  }
])

// 任务类型标签
const getTaskTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '订单处理': 'primary',
    '车辆管理': 'warning',
    '仓库管理': 'success'
  }
  return typeMap[type] || 'info'
}

// 状态标签
const getStatusTag = (status: string) => {
  const statusMap: Record<string, string> = {
    '待处理': 'info',
    '紧急': 'danger',
    '进行中': 'warning',
    '已完成': 'success'
  }
  return statusMap[status] || 'info'
}
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;

  .stat-cards {
    margin-bottom: 20px;

    .stat-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-content {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 0;

        .icon {
          font-size: 48px;
          margin-right: 16px;
          color: #409EFF;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
        }
      }
    }
  }

  .task-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style> 