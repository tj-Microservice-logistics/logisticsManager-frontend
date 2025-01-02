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
          <el-option label="待发车" value="待发车" />
          <el-option label="运输中" value="运输中" />
          <el-option label="已送达" value="已送达" />
        </el-select>

        <el-input
            v-model="driverNameFilter"
            placeholder="司机姓名"
            class="filter-item"
            clearable
        ></el-input>

        <el-input
            v-model="vehiclePlateNumberFilter"
            placeholder="车牌号"
            class="filter-item"
            clearable
        ></el-input>

        <el-select v-model="startWarehouseFilter" placeholder="起点仓库" clearable class="filter-item">
          <el-option label="上海分拣中心" value="Shanghai" />
          <el-option label="合肥分拣中心" value="Hefei" />
          <el-option label="杭州分拣中心" value="Hangzhou" />
          <el-option label="南京分拣中心" value="Nanjing" />
          <el-option label="南昌分拣中心" value="Nanchang" />
        </el-select>

        <el-select v-model="endWarehouseFilter" placeholder="终点仓库" clearable class="filter-item">
          <el-option label="上海分拣中心" value="Shanghai" />
          <el-option label="合肥分拣中心" value="Hefei" />
          <el-option label="杭州分拣中心" value="Hangzhou" />
          <el-option label="南京分拣中心" value="Nanjing" />
          <el-option label="南昌分拣中心" value="Nanchang" />
        </el-select>

      </div>
    </el-card>

    <el-card class="content-card">
      <el-table :data="pagedWaybills" border>
        <el-table-column prop="waybillId" label="运单号" width="180" />
        <el-table-column prop="orderNumber" label="关联订单" width="180" />
        <el-table-column prop="vehiclePlateNumber" label="车牌号" width="120" />
        <el-table-column prop="driverName" label="司机" width="120" />
        <el-table-column prop="startWarehouseName" label="起点仓库" width="200" />
        <el-table-column prop="endWarehouseName" label="终点仓库" width="200" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column prop="cargoWeight" label="商品重量" width="180" />
        <el-table-column prop="transportStatus" label="运输状态" width="100">
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="filteredWaybills.length"
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
import { ref, onMounted, computed } from 'vue';
import { Tickets, Search } from '@element-plus/icons-vue';
import { waybillAPI } from '@/api/waybill';
import { Waybill } from '@/types/waybill';

declare var BMap: any;
const currentPage = ref(1);  // 当前页，默认为第 1 页
const pageSize = ref(10);  // 每页显示条数，默认为 10
const loading = ref(false);  // 定义 loading 变量
const total = ref(0);  // 运单总数
const waybillList = ref<Waybill[]>([]);

let map: BMap.Map | null = null; // 地图实例
const searchQuery = ref('');
const statusFilter = ref(null);
const driverNameFilter = ref('');
const vehiclePlateNumberFilter = ref('');
const startWarehouseFilter = ref('');
const endWarehouseFilter = ref('');

const filteredWaybills = computed(() => {
  return waybillList.value.filter((waybill) => {
    const matchesQuery =
        searchQuery.value === '' ||
        (waybill.waybillId?.toString().includes(searchQuery.value) ||
            waybill.orderNumber?.includes(searchQuery.value));
    const matchesStatus =
        !statusFilter.value || waybill.transportStatus === statusFilter.value;
    const matchesDriver =
        !driverNameFilter.value ||
        waybill.driverName?.includes(driverNameFilter.value);
    const matchesPlateNumber =
        !vehiclePlateNumberFilter.value ||
        waybill.vehiclePlateNumber?.includes(vehiclePlateNumberFilter.value);
    const matchesStartWarehouse =
        !startWarehouseFilter.value ||
        waybill.startWarehouseName === startWarehouseFilter.value;
    const matchesEndWarehouse =
        !endWarehouseFilter.value ||
        waybill.endWarehouseName === endWarehouseFilter.value;

    return (
        matchesQuery &&
        matchesStatus &&
        matchesDriver &&
        matchesPlateNumber &&
        matchesStartWarehouse &&
        matchesEndWarehouse
    );
  });
});

const pagedWaybills = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredWaybills.value.slice(start, end);
});
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
  try {
    loading.value = true;
    const response = await waybillAPI.getAllWaybills();
    console.log('Response:', response); // 打印返回的数据
    waybillList.value = Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('运单数据加载失败:', error);
  } finally {
    loading.value = false;
  }
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