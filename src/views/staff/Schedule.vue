<template>
  <el-card>
    <div class="card-header">
      <div class="title">排班管理</div>
    </div>

    <!-- 司机列表 -->
    <el-table :data="drivers" border v-loading="loading" size="small">
      <el-table-column prop="fullName" label="司机姓名" width="200" />
      <el-table-column prop="contactNumber" label="联系电话" width="200" />
      <el-table-column label="分配车辆" width="250">
        <template #default="{ row }">
          <el-select
            v-model="selectedVehicle[row.driverId]"
            placeholder="选择车辆"
            @change="handleVehicleSelect(row.driverId)"
          >
            <el-option
              v-for="vehicle in vehicles"
              :key="vehicle.vehicleId"
              :label="vehicle.licensePlate"
              :value="vehicle.vehicleId"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button
            type="primary"
            @click="assignVehicle(row.driverId)"
            :disabled="!selectedVehicle[row.driverId]"
          >
            确认分配
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getUnassignedDrivers, getAvailableVehicles, assignVehicleToDriver } from '@/api/schedule';

const drivers = ref([]);
const vehicles = ref([]);
const selectedVehicle = ref({});
const loading = ref(false);

// 获取未分配司机列表
const fetchDrivers = async () => {
  try {
    const response = await getUnassignedDrivers({ warehouseId: 1 }); // 假设当前仓库 ID = 1
    drivers.value = response.data || [];
  } catch (error) {
    console.error('获取司机列表失败：', error);
    ElMessage.error('获取司机列表失败');
  }
};

// 获取未分配车辆列表
const fetchVehicles = async () => {
  try {
    const response = await getAvailableVehicles({ warehouseId: 1 });
    vehicles.value = response.data || [];
  } catch (error) {
    console.error('获取车辆列表失败：', error);
    ElMessage.error('获取车辆列表失败');
  }
};

// 分配车辆
const assignVehicle = async (driverId: number) => {
  try {
    const vehicleId = selectedVehicle.value[driverId];
    await assignVehicleToDriver({ driverId, vehicleId });
    ElMessage.success('车辆分配成功');
    fetchDrivers();
    fetchVehicles();
  } catch (error) {
    console.error('车辆分配失败：', error);
    ElMessage.error('车辆分配失败，请稍后重试');
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchDrivers();
  fetchVehicles();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>


<style scoped lang="scss">
.schedule {
  .header-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

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