<template>
  <div class="statistics-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单统计分析</span>
        </div>
      </template>
      
      <!-- 筛选条件 -->
      <div class="filters">
        <el-select v-model="year" placeholder="选择年份" @change="handleYearChange">
          <el-option
            v-for="y in yearOptions"
            :key="y"
            :label="`${y}年`"
            :value="y"
          />
        </el-select>

        <!-- 统计类型选择 -->
        <el-select 
          v-model="queryForm.type" 
          placeholder="统计类型"
          @change="handleTypeChange"
        >
          <el-option label="年度统计" value="yearly" />
          <el-option label="月度统计" value="monthly" />
          <el-option label="日统计" value="daily" />
        </el-select>

        <!-- 月份选择 -->
        <el-select 
          v-if="queryForm.type === 'daily'"
          v-model="month" 
          placeholder="选择月份"
          @change="handleMonthChange"
        >
          <el-option
            v-for="m in 12"
            :key="m"
            :label="`${m}月`"
            :value="m"
          />
        </el-select>

        <el-button type="primary" @click="fetchData">查询</el-button>
        <el-button type="success" @click="handleExport">导出报表</el-button>
      </div>
    </el-card>

    <!-- 图表展示 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card v-loading="loading">
          <div class="chart-container">
            <v-chart :option="chartOption" autoresize />
    </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 汇总信息 -->
    <el-card class="mt-4" v-if="summaryData">
      <template #header>
        <div class="card-header">
          <span>汇总信息</span>
        </div>
      </template>
      
      <el-descriptions :column="4" border>
        <el-descriptions-item label="总订单数">
          {{ summaryData.totalOrders }}
        </el-descriptions-item>
        <el-descriptions-item label="总金额">
          ¥{{ formatNumber(summaryData.totalAmount) }}
        </el-descriptions-item>
        <el-descriptions-item label="平均订单数">
          {{ formatNumber(summaryData.avgOrders) }}
        </el-descriptions-item>
        <el-descriptions-item label="平均金额">
          ¥{{ formatNumber(summaryData.avgAmount) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 详细数据表格 -->
    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>详细数据</span>
        </div>
      </template>
      
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="date" label="日期" />
        <el-table-column prop="orderCount" label="订单数量">
          <template #default="{ row }">
            {{ formatNumber(row.orderCount) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额">
          <template #default="{ row }">
            ¥{{ formatNumber(row.totalAmount) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 状态定义
const loading = ref(false)
const year = ref(new Date().getFullYear())
const month = ref<number>()
const quarters = ref<number[]>([])
const tableData = ref([])
const summaryData = ref(null)

// 查询表单
const queryForm = reactive({
  type: 'yearly', // yearly, monthly, daily
  year: year,
  month: month
})

// 年份选项：从2020年到当前年份
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = 2020; y <= currentYear; y++) {
    years.push(y)
  }
  return years
})

// 处理统计类型变化
const handleTypeChange = () => {
  month.value = undefined
  quarters.value = []
  fetchData()
}

// 处理年份变化
const handleYearChange = () => {
  month.value = undefined
  quarters.value = []
  fetchData()
}

// 处理月份变化
const handleMonthChange = () => {
  quarters.value = []
  fetchData()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    let url = '/report/statistics'
    const params: any = {}

    // 根据不同统计类型调用不同接口
    switch (queryForm.type) {
      case 'daily': // 某月每天
        url = '/report/statistics'
        params.year = year.value
        params.month = month.value
        break
      case 'monthly': // 某年每月
        url = '/report/statistics'
        params.year = year.value
        break
      case 'yearly': // 每年统计
        url = '/report/statistics/years'
        break
    }

    const res = await request({
      url,
      method: 'get',
      params
    })
    
    if (res.data && res.summary) {
      // 更新表格数据
      tableData.value = res.data.map(item => ({
        date: formatDate(item.date),
        orderCount: item.totalOrders,
        totalAmount: item.totalAmount
      }))
      
      // 更新汇总数据
      summaryData.value = {
        totalOrders: res.summary.totalOrders,
        totalAmount: res.summary.totalAmount,
        avgOrders: res.summary.avgDailyOrders,
        avgAmount: res.summary.avgDailyAmount
      }
    } else {
      ElMessage.warning('暂无数据')
      tableData.value = []
      summaryData.value = null
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    tableData.value = []
    summaryData.value = null
    throw error
  } finally {
    loading.value = false
  }
}

// 格式化日期显示
const formatDate = (dateStr: string) => {
  if (queryForm.type === 'monthly' && month.value) {
    const date = new Date(dateStr)
    return `${date.getDate()}日`
  } else if (queryForm.type === 'quarterly') {
    return dateStr // 季度数据格式保持原样
  }
  return dateStr // 年度数据格式保持原样
}

// 获取图表标题
const getChartTitle = computed(() => {
  const yearText = `${year.value}年`
  if (queryForm.type === 'monthly' && month.value) {
    return `${yearText}${month.value}月订单统计`
  } else if (queryForm.type === 'quarterly' && quarters.value.length > 0) {
    const quarterText = quarters.value
      .sort((a, b) => a - b)
      .map(q => `Q${q}`)
      .join('、')
    return `${yearText}${quarterText}订单统计`
  }
  return `${yearText}订单统计`
})

// 导出报表
const handleExport = async () => {
  try {
    const params: any = {
      year: year.value
    }

    // 如果是日统计或月度统计，添加月份参数
    if (queryForm.type !== 'yearly' && month.value) {
      params.month = month.value
    }

    const res = await request({
      url: '/report/statistics/export',
      method: 'get',
      params,
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/octet-stream'
      }
    })

    // 从响应头中获取文件名
    let fileName = 'report.xlsx'
    const disposition = res.headers?.['content-disposition']
    if (disposition) {
      const filenameMatch = disposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        fileName = filenameMatch[1]
      }
    }
    
    // 创建 Blob 对象
    const blob = new Blob([new Uint8Array(res.data)], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(link.href)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    // 尝试解析错误信息
    if (error.response?.data) {
      try {
        const decoder = new TextDecoder('utf-8')
        const errorMessage = JSON.parse(decoder.decode(error.response.data))
        ElMessage.error(errorMessage.message || '导出失败，请稍后重试')
      } catch {
        ElMessage.error('导出失败，请稍后重试')
      }
    } else {
      ElMessage.error('导出失败，请稍后重试')
    }
  }
}

// 获取X轴标题
const getXAxisTitle = computed(() => {
  switch (queryForm.type) {
    case 'monthly':
      return month.value ? '日期' : '月份'
    case 'quarterly':
      return '季度'
    default:
      return '月份'
  }
})

// 图表配置
const chartOption = computed(() => ({
  title: {
    text: getChartTitle.value
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    },
    formatter: (params) => {
      const date = params[0].name
      const orders = params[0].value
      const amount = params[1].value
      let prefix = ''
      if (queryForm.type === 'monthly' && month.value) {
        prefix = `${year.value}年${month.value}月`
      }
      return `${prefix}${date}<br/>
              订单数量: ${formatNumber(orders)}<br/>
              订单金额: ¥${formatNumber(amount)}`
    }
  },
  legend: {
    data: ['订单数量', '订单金额']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: tableData.value.map(item => item.date),
    name: getXAxisTitle.value,
    axisLabel: {
      rotate: queryForm.type === 'monthly' && month.value ? 0 : 45
    }
  },
  yAxis: [
    {
      type: 'value',
      name: '订单数量',
      position: 'left',
      axisLabel: {
        formatter: '{value}'
      }
    },
    {
      type: 'value',
      name: '订单金额(元)',
      position: 'right',
      axisLabel: {
        formatter: '¥{value}'
      }
    }
  ],
  series: [
    {
      name: '订单数量',
      type: 'bar',
      data: tableData.value.map(item => item.orderCount),
      label: {
        show: true,
        position: 'top'
      }
    },
    {
      name: '订单金额',
      type: 'line',
      yAxisIndex: 1,
      data: tableData.value.map(item => item.totalAmount),
      label: {
        show: true,
        position: 'top',
        formatter: (params) => `¥${formatNumber(params.value)}`
      }
    }
  ]
}))

// 格式化数字
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.statistics-page {
    padding: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
  }
  
  .filters {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .chart-container {
    height: 400px;
  }
  
  .mt-4 {
    margin-top: 16px;
  }
}
</style> 