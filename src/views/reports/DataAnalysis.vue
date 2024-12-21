<template>
  <div class="data-analysis">
    <!-- 关键指标卡片 -->
    <div class="kpi-row">
      <div class="kpi-card" v-for="kpi in kpiData" :key="kpi.title">
        <div class="kpi-header">
          <span class="title">{{ kpi.title }}</span>
          <span class="tag" :class="kpi.trend">
            {{ kpi.trend === 'up' ? '↑' : '↓' }} {{ kpi.change }}%
          </span>
        </div>
        <div class="kpi-value">{{ kpi.value }}</div>
        <div class="kpi-footer">同比上月</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-row">
      <!-- 订单趋势图 -->
      <div class="chart-card">
        <div class="card-header">
          <span>订单趋势</span>
          <div class="period-selector">
            <button 
              v-for="period in ['week', 'month', 'year']" 
              :key="period"
              :class="{ active: orderTrendPeriod === period }"
              @click="orderTrendPeriod = period"
            >
              {{ getPeriodLabel(period) }}
            </button>
          </div>
        </div>
        <div class="chart-content">
          <!-- 这里放订单趋势图表 -->
        </div>
      </div>

      <!-- 收入分析图 -->
      <div class="chart-card">
        <div class="card-header">
          <span>收入分析</span>
          <select v-model="incomeType" class="type-selector">
            <option value="region">按区域</option>
            <option value="business">按业务类型</option>
          </select>
        </div>
        <div class="chart-content">
          <!-- 这里放收入分析图表 -->
        </div>
      </div>
    </div>

    <!-- 异常数据分析 -->
    <div class="anomaly-card">
      <div class="card-header">
        <span>异常数据分析</span>
        <button class="btn-link">查看详情</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>异常类型</th>
            <th>异常描述</th>
            <th>异常值</th>
            <th>阈值</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in anomalyData" :key="item.date">
            <td>{{ item.date }}</td>
            <td>
              <span class="tag" :class="getAnomalyType(item.type)">
                {{ item.type }}
              </span>
            </td>
            <td>{{ item.description }}</td>
            <td>{{ item.value }}</td>
            <td>{{ item.threshold }}</td>
            <td>
              <span class="tag" :class="item.status === 'resolved' ? 'success' : 'danger'">
                {{ item.status === 'resolved' ? '已处理' : '未处理' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// KPI数据
const kpiData = ref([
  { title: '订单完成率', value: '98.5%', trend: 'up', change: 2.5 },
  { title: '准时率', value: '95.8%', trend: 'up', change: 1.2 },
  { title: '客户满意度', value: '4.8', trend: 'up', change: 0.3 },
  { title: '运营成本', value: '￥125,800', trend: 'down', change: 5.6 }
])

// 图表相关
const orderTrendPeriod = ref('month')
const incomeType = ref('region')

// 异常数据
const anomalyData = ref([
  {
    date: '2024-03-18 10:30',
    type: 'delivery_delay',
    description: '配送时间超出预期',
    value: '120分钟',
    threshold: '60分钟',
    status: 'pending'
  },
  {
    date: '2024-03-18 09:15',
    type: 'order_cancel',
    description: '订单取消率异常',
    value: '15%',
    threshold: '5%',
    status: 'resolved'
  }
])

// 获取异常类型样式
const getAnomalyType = (type: string) => {
  const typeMap: Record<string, string> = {
    delivery_delay: 'warning',
    order_cancel: 'danger',
    cost_overrun: 'info'
  }
  return typeMap[type] || 'info'
}

const getPeriodLabel = (period: string) => {
  const labels: Record<string, string> = {
    week: '周',
    month: '月',
    year: '年'
  }
  return labels[period] || period
}
</script>

<style scoped lang="scss">
.data-analysis {
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }

  .kpi-card {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 20px;

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .title {
        font-size: 14px;
        color: #606266;
      }
    }

    .kpi-value {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .kpi-footer {
      font-size: 12px;
      color: #909399;
    }
  }

  .chart-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }

  .chart-card {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .chart-content {
      height: 300px;
    }
  }

  .period-selector {
    display: flex;
    gap: 4px;

    button {
      padding: 4px 12px;
      border: 1px solid #dcdfe6;
      background: #fff;
      color: #606266;
      cursor: pointer;
      font-size: 12px;

      &:first-child {
        border-radius: 4px 0 0 4px;
      }

      &:last-child {
        border-radius: 0 4px 4px 0;
      }

      &.active {
        background: #409eff;
        border-color: #409eff;
        color: #fff;
      }
    }
  }

  .type-selector {
    height: 28px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 0 8px;
    font-size: 12px;
    color: #606266;
  }

  .anomaly-card {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      border: 1px solid #ebeef5;
      padding: 12px;
      text-align: left;
    }

    th {
      background: #f5f7fa;
      font-weight: 500;
    }

    tr:hover td {
      background: #f5f7fa;
    }
  }

  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;

    &.up {
      color: #67c23a;
      background: #f0f9eb;
    }

    &.down {
      color: #f56c6c;
      background: #fef0f0;
    }

    &.warning {
      color: #e6a23c;
      background: #fdf6ec;
    }

    &.danger {
      color: #f56c6c;
      background: #fef0f0;
    }

    &.success {
      color: #67c23a;
      background: #f0f9eb;
    }

    &.info {
      color: #909399;
      background: #f4f4f5;
    }
  }

  .btn-link {
    background: none;
    border: none;
    color: #409eff;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      color: #66b1ff;
    }
  }
}
</style> 