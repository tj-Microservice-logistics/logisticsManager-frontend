<template>
  <div class="order-detail">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="订单号">
        {{ orderDetail?.orderNo }}
      </el-descriptions-item>
      <el-descriptions-item label="客户名称">
        {{ orderDetail?.customerName }}
      </el-descriptions-item>
      <el-descriptions-item label="订单状态">
        <el-tag :type="getStatusType(orderDetail?.status)">
          {{ getStatusLabel(orderDetail?.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ orderDetail?.createTime }}
      </el-descriptions-item>
      <!-- 其他订单详情字段 -->
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Order } from '@/types/order'

const props = defineProps<{
  orderId: string
}>()

const orderDetail = ref<Order | null>(null)

const getStatusType = (status?: Order['status']) => {
  if (!status) return ''
  const statusMap = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return statusMap[status]
}

const getStatusLabel = (status?: Order['status']) => {
  if (!status) return ''
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status]
}

const fetchOrderDetail = async () => {
  try {
    // 这里调用获取订单详情的 API
    // const { data } = await getOrderDetail(props.orderId)
    // orderDetail.value = data
  } catch (error) {
    console.error('获取订单详情失败:', error)
  }
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped lang="scss">
.order-detail {
  padding: 20px;
}
</style> 