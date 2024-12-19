<template>
  <div class="map-container">
    <div id="map" class="map"></div>
    <div class="map-buttons">
      <el-button @click="locateCity('上海')">上海分拣中心</el-button>
      <el-button @click="locateCity('合肥')">合肥分拣中心</el-button>
      <el-button @click="locateCity('杭州')">杭州分拣中心</el-button>
      <el-button @click="locateCity('南京')">南京分拣中心</el-button>
    </div>
  </div>
  <div class="waybill-list">
    <el-card class="header-card">
      <div class="card-header">
        <div class="title">
          <el-icon><Tickets /></el-icon>
          <span>运单管理</span>
        </div>
      </div>

      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="运单号/订单号"
          class="filter-item"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="statusFilter" placeholder="运单状态" clearable class="filter-item">
          <el-option label="待发车" value="pending" />
          <el-option label="运输中" value="in_transit" />
          <el-option label="已送达" value="delivered" />
          <el-option label="已完成" value="completed" />
          <el-option label="异常" value="exception" />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="filter-item"
        />
      </div>
    </el-card>

    <el-card class="content-card">
      <el-table :data="waybillList" border v-loading="loading">
        <el-table-column prop="waybillNo" label="运单号" width="180" />
        <el-table-column prop="orderNo" label="关联订单" width="180" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="driver" label="司机" width="120" />
        <el-table-column prop="fromAddress" label="发货地" width="200" />
        <el-table-column prop="toAddress" label="收货地" width="200" />
        <el-table-column prop="departureTime" label="发车时间" width="180" />
        <el-table-column prop="estimatedArrivalTime" label="预计到达" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">
              <el-icon><Document /></el-icon>详情
            </el-button>
            <el-button type="success" link @click="handleTrack(row)">
              <el-icon><Location /></el-icon>跟踪
            </el-button>
            <el-button type="warning" link @click="handleException(row)">
              <el-icon><Warning /></el-icon>异常
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 异常登记对话框 -->
    <el-dialog
      title="异常登记"
      v-model="exceptionDialogVisible"
      width="500px"
    >
      <el-form
        ref="exceptionFormRef"
        :model="exceptionForm"
        :rules="exceptionRules"
        label-width="100px"
      >
        <el-form-item label="异常类型" prop="type">
          <el-select v-model="exceptionForm.type" placeholder="请选���异常类型" class="w-full">
            <el-option label="车辆故障" value="vehicle_failure" />
            <el-option label="交通事故" value="traffic_accident" />
            <el-option label="天气原因" value="weather" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="发生时间" prop="occurTime">
          <el-date-picker
            v-model="exceptionForm.occurTime"
            type="datetime"
            placeholder="请选择发生时间"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="异常说明" prop="description">
          <el-input
            v-model="exceptionForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入异常说明"
          />
        </el-form-item>
        <el-form-item label="处理方案" prop="solution">
          <el-input
            v-model="exceptionForm.solution"
            type="textarea"
            :rows="3"
            placeholder="请输入处理方案"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exceptionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleExceptionSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 运单跟踪对话框 -->
    <el-dialog
      title="运单跟踪"
      v-model="trackDialogVisible"
      width="800px"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in trackingActivities"
          :key="index"
          :type="activity.type"
          :color="activity.color"
          :timestamp="activity.timestamp"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tickets, Search, Document, Location, Warning } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ElButton } from 'element-plus'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const exceptionDialogVisible = ref(false)
const trackDialogVisible = ref(false)

// 异常表单相关
const exceptionFormRef = ref<FormInstance>()
const exceptionForm = ref({
  type: '',
  occurTime: '',
  description: '',
  solution: ''
})
import { onMounted } from 'vue';
let map: BMap.Map | null = null; // 地图实例

// 初始化地图
const initMap = () => {
  if (typeof BMap !== "undefined") {
    map = new BMap.Map("map");
    map.centerAndZoom(new BMap.Point(121.4737, 31.2304), 10); // 默认显示上海
    map.enableScrollWheelZoom(true); // 启用滚轮缩放
  } else {
    console.error("BMap 未加载，请检查 API 是否正确引入！");
  }
};

// 定位城市
const locateCity = (city: string) => {
  if (!map) return;

  const cities: Record<string, [number, number]> = {
    上海: [121.1637, 31.2304],
    合肥: [117.2830, 31.9206],
    杭州: [120.3551, 30.2741],
    南京: [118.7969, 31.9603],
  };

  const [lng, lat] = cities[city] || [121.1637, 31.2304]; // 默认上海
  const point = new BMap.Point(lng, lat);
  map.centerAndZoom(point, 10);

  map.clearOverlays();
  // 创建一个默认的红色标记
  const marker = new BMap.Marker(point);  // 默认是红色标记
  map.addOverlay(marker); // 添加标记到地图
};

// 确保地图在组件挂载后初始化
onMounted(() => {
  initMap();  // 初始化地图
});
const exceptionRules: FormRules = {
  type: [{ required: true, message: '请选择异常类型', trigger: 'change' }],
  occurTime: [{ required: true, message: '请选择发生时间', trigger: 'change' }],
  description: [{ required: true, message: '请输入异常说明', trigger: 'blur' }]
}

// 模拟数据
const waybillList = ref([
  {
    waybillNo: 'YD202403180001',
    orderNo: 'DD202403180001',
    plateNumber: '沪A12345',
    driver: '张师傅',
    fromAddress: '上海市浦东新区XX路XX号',
    toAddress: '北京市朝阳区XX路XX号',
    departureTime: '2024-03-18 09:00',
    estimatedArrivalTime: '2024-03-20 14:00',
    status: 'in_transit'
  },
  {
    waybillNo: 'YD202403180002',
    orderNo: 'DD202403180002',
    plateNumber: '沪B67890',
    driver: '李师傅',
    fromAddress: '广州市天河区XX路XX号',
    toAddress: '深圳市南山区XX路XX号',
    departureTime: '2024-03-18 08:30',
    estimatedArrivalTime: '2024-03-19 16:00',
    status: 'pending'
  }
])

const trackingActivities = ref([
  {
    content: '运单创建',
    timestamp: '2024-03-18 08:00',
    type: 'primary',
    color: '#409EFF'
  },
  {
    content: '车辆已发车',
    timestamp: '2024-03-18 09:00',
    type: 'success',
    color: '#67C23A'
  },
  {
    content: '正在派送',
    timestamp: '2024-03-19 10:30',
    type: 'warning',
    color: '#E6A23C'
  },
  {
    content: '到达目的地',
    timestamp: '2024-03-19 11:00',
    type: 'info',
    color: '#909399'
  }
])

// 状态相关
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    in_transit: 'primary',
    delivered: 'success',
    completed: 'info',
    exception: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待发车',
    in_transit: '运输中',
    delivered: '已送达',
    completed: '已完成',
    exception: '异常'
  }
  return statusMap[status] || status
}

// 事件处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}

const handleDetail = (row: any) => {
  // 查看运单详情
  console.log('查看运单详情', row)
}

const handleTrack = (row: any) => {
  trackDialogVisible.value = true
}

const handleException = (row: any) => {
  exceptionForm.value = {
    type: '',
    occurTime: '',
    description: '',
    solution: ''
  }
  exceptionDialogVisible.value = true
}

const handleExceptionSubmit = async () => {
  if (!exceptionFormRef.value) return
  
  await exceptionFormRef.value.validate((valid) => {
    if (valid) {
      // 提交异常登记
      ElMessage.success('异常登记成功')
      exceptionDialogVisible.value = false
    }
  })
}
</script>

<style scoped lang="scss">

.map-container {
  position: relative;
  height: 400px;
  margin-bottom: 20px;
}

.map {
  height: 100%;  /* 确保地图容器占满可用高度 */
  width: 100%;
}

.map-buttons {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 999;
  display: flex;
  gap: 30px;
}
.waybill-list {

  .header-card {
    margin-bottom: 20px;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .title {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: bold;

        .el-icon {
          margin-right: 8px;
        }
      }
    }

    .filter-container {
      display: flex;
      gap: 12px;

      .filter-item {
        min-width: 200px;
      }
    }
  }

  .content-card {
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  :deep(.w-full) {
    width: 100%;
  }
}
</style> 