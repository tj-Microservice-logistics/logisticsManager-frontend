<template>
  <div class="data-analysis">
    <el-button @click="testConnection">测试连接</el-button>
  </div>
</template>

<script setup lang="ts">
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const testConnection = async () => {
  try {
    const res = await request({
      url: '/report/test/connection',
      method: 'get'
    })
    ElMessage.success('连接成功')
    console.log('测试接口返回数据：', res)
  } catch (error) {
    console.error('连接失败：', error)
  }
}
</script>

<style scoped lang="scss">
.data-analysis {
  padding: 20px;
}
</style> 