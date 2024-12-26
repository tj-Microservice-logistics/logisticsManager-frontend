<template>
  <div class="map-container">
    <div id="map" class="map"></div>
    <div class="map-buttons">
      <el-button @click="locateCity('上海')">上海分拣中心</el-button>
      <el-button @click="locateCity('合肥')">合肥分拣中心</el-button>
      <el-button @click="locateCity('杭州')">杭州分拣中心</el-button>
      <el-button @click="locateCity('南京')">南京分拣中心</el-button>
      <el-button @click="locateCity('南昌')">南昌分拣中心</el-button>
    </div>
  </div>
  <div class="waybill-list">
    <el-card class="header-card">
      <div class="card-header">
        <div class="title">
          <el-icon><Tickets /></el-icon>
          <span>运单管理</span>
        </div>
        <el-button type="primary" @click="fetchWaybills">查询</el-button>
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
        </el-select>
      </div>
    </el-card>

    <el-card class="content-card">
      <el-table :data="waybillList" border v-loading="loading">
        <el-table-column prop="waybillNo" label="运单号" width="180" />
        <el-table-column prop="orderNo" label="关联订单" width="180" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="driver" label="司机" width="120" />
        <el-table-column prop="fromAddress" label="起点仓库" width="200" />
        <el-table-column prop="toAddress" label="终点仓库" width="200" />
        <el-table-column prop="departureTime" label="发车时间" width="180" />
        <el-table-column prop="arrivalTime" label="到达时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Tickets, Search } from '@element-plus/icons-vue';
import { waybillAPI,WaybillDto } from '@/api/waybill';

let map: BMap.Map | null = null; // 地图实例
const waybillList = ref<WaybillDto[]>([]);
// 运单数据与状态
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const searchQuery = ref('');
const statusFilter = ref('');

// 初始化地图
const initMap = () => {
  if (typeof BMap !== 'undefined') {
    map = new BMap.Map('map');
    map.centerAndZoom(new BMap.Point(121.4737, 31.2304), 10); // 默认显示上海
    map.enableScrollWheelZoom(true); // 启用滚轮缩放
  } else {
    console.error('BMap 未加载，请检查 API 是否正确引入！');
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
    南昌: [115.8582, 28.7820],
  };

  const [lng, lat] = cities[city] || [121.1637, 31.2304];
  const point = new BMap.Point(lng, lat);
  map.centerAndZoom(point, 10);

  map.clearOverlays();
  const marker = new BMap.Marker(point);
  map.addOverlay(marker);
};

// 获取运单数据
const fetchWaybills = async () => {
  loading.value = true;
  try {
    const response = await waybillAPI.getAllWaybills();
    waybillList.value = response.data || [];
    total.value = waybillList.value.length;
  } catch (error) {
    console.error('获取运单数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 状态相关
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    in_transit: 'primary',
    delivered: 'success',
  };
  return statusMap[status] || 'info';
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待发车',
    in_transit: '运输中',
    delivered: '已送达',
  };
  return statusMap[status] || status;
};

// 页码变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// 挂载时初始化
onMounted(() => {
  initMap();
  fetchWaybills();
});
</script>

<style scoped lang="scss">
.map-container {
  position: relative;
  height: 400px;
  margin-bottom: 20px;
}

.map {
  height: 100%;
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
    }
  }

  .content-card {
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
