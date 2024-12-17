<template>
  <div class="order-detail">
    <el-descriptions title="订单详情" :column="2" border>
      <el-descriptions-item label="订单号">{{ order.orderId }}</el-descriptions-item>
      <el-descriptions-item label="客户名称">{{ order.customerName }}</el-descriptions-item>
      <el-descriptions-item label="收货地址">{{ order.address }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ order.phone }}</el-descriptions-item>
      <el-descriptions-item label="订单状态">
        <el-tag :type="getStatusType(order.status)">{{ order.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ order.createTime }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { logisticsAPI } from '../api/logistics'

const props = defineProps({
  orderId: {
    type: String,
    required: true
  }
})

const order = ref({})

const getOrderDetail = async () => {
  try {
    const response = await logisticsAPI.getOrderDetail(props.orderId)
    order.value = response.data
  } catch (error) {
    console.error('获取订单详情失败:', error)
  }
}

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'processing': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return statusMap[status] || 'info'
}

onMounted(() => {
  getOrderDetail()
})
</script>

<style scoped>
.order-detail {
  padding: 20px;
}
</style> 