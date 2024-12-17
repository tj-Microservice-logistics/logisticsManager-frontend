<template>
  <div class="order-list">
    <el-table
      :data="orders"
      style="width: 100%"
      border
      stripe
      highlight-current-row
    >
      <el-table-column prop="orderId" label="订单号" width="180" />
      <el-table-column prop="customerName" label="客户名称" width="180" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button 
            link 
            type="primary" 
            @click="viewDetail(row.orderId)"
          >
            <el-icon><View /></el-icon>查看
          </el-button>
          <el-button 
            link 
            type="primary" 
            @click="updateStatus(row.orderId)"
          >
            <el-icon><Edit /></el-icon>更新
          </el-button>
          <el-button 
            link 
            type="danger" 
            @click="deleteOrder(row.orderId)"
          >
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Edit, Delete } from '@element-plus/icons-vue'
import { logisticsAPI } from '../api/logistics'
import type { Order } from '../api/logistics'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const orders = ref<Order[]>([
  {
    orderId: 'ORD001',
    customerName: '测试用户1',
    status: 'pending',
    createTime: '2024-03-14 10:00:00'
  },
  {
    orderId: 'ORD002',
    customerName: '测试用户2',
    status: 'processing',
    createTime: '2024-03-14 11:00:00'
  }
])

const getStatusType = (status: Order['status']): string => {
  const statusMap: Record<Order['status'], string> = {
    'pending': 'warning',
    'processing': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: Order['status']): string => {
  const statusMap: Record<Order['status'], string> = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

const viewDetail = (orderId: string) => {
  console.log('查看订单:', orderId)
  emit('view-detail', orderId)
}

const updateStatus = async (orderId: string) => {
  console.log('更新订单状态:', orderId)
}

const deleteOrder = (orderId: string) => {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await logisticsAPI.deleteOrder(orderId)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}

const emit = defineEmits<{
  (e: 'view-detail', orderId: string): void
}>()

onMounted(() => {
  console.log('OrderList组件已挂载')
})
</script>

<style scoped>
.order-list {
  width: 100%;
  height: 100%;
}

:deep(.el-table) {
  width: 100%;
  height: 100%;
}

:deep(.el-table__body-wrapper) {
  overflow-x: hidden;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 