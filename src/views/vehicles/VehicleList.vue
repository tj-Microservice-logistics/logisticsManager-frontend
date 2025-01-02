<template>
  <el-card>
    <!-- 搜索和新增按钮 -->
    <div class="card-header">
      <div class="title">车辆管理</div>
      <el-input v-model="searchQuery" placeholder="搜索车牌号或车型" clearable class="search-bar" @input="handleSearch">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="openAddDialog">
        <el-icon>
          <Plus />
        </el-icon>新增车辆
      </el-button>
    </div>

    <!-- 车辆表格 -->
    <el-table :data="filteredVehicleList" border v-loading="loading" size="small">
      <el-table-column prop="licensePlate" label="车牌号" width="150" />
      <el-table-column prop="vehicleType" label="车型" width="100" />
      <el-table-column prop="warehouse.warehouseName" label="所属仓库" width="100" />
      <el-table-column prop="driverName" label="驾驶司机" width="100" />
      <el-table-column label="车辆状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">
            {{ row.status ? '可用' : '运货中' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" width="150">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
          <el-button type="danger" link @click="confirmDelete(row.vehicleId)">删除</el-button>
          <el-button type="info" link @click="Start(row)">发车</el-button>
          <el-button type="success" link @click="markAsArrived(row)">到达</el-button>

        </template>
      </el-table-column>
    </el-table>
    <el-dialog
        v-model="warehouseDialogVisible"
        title="选择终点仓库"
        width="400px"
        :before-close="closeWarehouseDialog"
    >
      <el-form label-width="100px">
        <el-form-item label="终点仓库">
          <el-select
              v-model="selectedWarehouse"
              placeholder="请选择终点仓库"
              style="width: 100%"
          >
            <el-option
                v-for="warehouse in adjacentWarehouses"
                :key="warehouse.warehouseId"
                :label="warehouse.warehouseName"
                :value="warehouse.warehouseId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeWarehouseDialog">取消</el-button>
        <el-button type="primary" @click="confirmWarehouseSelection">确认</el-button>
      </div>
    </el-dialog>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
        layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>

    <!-- 新增/编辑车辆模态框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :before-close="closeDialog">
      <el-form :model="formData" :rules="rules" ref="vehicleFormRef" label-width="100px">
        <el-form-item label="车牌号" prop="licensePlate">
          <el-input v-model="formData.licensePlate" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="车型" prop="vehicleType">
          <el-select v-model="formData.vehicleType" placeholder="选择车型">
            <el-option v-for="type in vehicleTypes" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属仓库" prop="warehouseId">
          <el-select v-model="formData.warehouseId" placeholder="选择所属仓库">
            <el-option v-for="warehouse in warehouseList" :key="warehouse.warehouseId" :label="warehouse.warehouseName"
              :value="warehouse.warehouseId" />
          </el-select>
        </el-form-item>
        <el-form-item label="车辆状态">
          <el-switch v-model="formData.status" active-text="可用" inactive-text="不可用" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle, getAvailableVehicleAndDriver, arriveVehicle } from '@/api/vehicles';
import { getWarehouses } from '@/api/warehouses';
import { getAdjacentWarehouse } from '@/api/warehouseDistance'
// 如果有司机相关的功能，导入相应的 API 和数据
// import { getDrivers } from '@/api/drivers';

// 可选车型
const vehicleTypes = ref(['truck', 'van', 'forklift', 'drone']); // 添加更多车型时直接扩展数组

// 状态变量
const vehicleList = ref([]);
interface Warehouse {
  warehouseId: string;
  warehouseName: string;
}
const warehouseDialogVisible = ref(false); // 控制新模态框的显示
const adjacentWarehouses = ref([]); // 相邻仓库列表
const selectedWarehouse = ref(null); // 用户选择的终点仓库
const currentVehicle = ref(null); // 当前选择的车辆


const warehouseList = ref<Warehouse[]>([]); // 仓库列表
// const driverList = ref([]); // 司机列表，如果需要
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formData = ref({
  vehicleId: null,
  licensePlate: '',
  vehicleType: '',
  warehouseId: null,
  status: true,
  driverName: "",
});
const rules = {
  licensePlate: [{ required: true, message: '车牌号不能为空', trigger: 'blur' }],
  vehicleType: [{ required: true, message: '车型不能为空', trigger: 'blur' }],
  warehouseName: [{ required: true, message: '请选择所属仓库', trigger: 'change' }],
};
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0); // 总数
const searchQuery = ref('');

const Start = async (vehicle) => {
  try {
    if (!vehicle.warehouse || !vehicle.warehouse.warehouseName) {
      ElMessage.error("所属仓库不存在，无法处理");
      return;
    }

    const response = await getAdjacentWarehouse(vehicle.warehouse.warehouseId);
    if (response && response.length > 0) {
      adjacentWarehouses.value = response; // 保存相邻仓库列表
      currentVehicle.value = vehicle; // 保存当前车辆信息
      warehouseDialogVisible.value = true; // 显示模态框
    } else {
      ElMessage.error("未找到相邻仓库");
    }
  } catch (error) {
    console.error("获取相邻仓库失败：", error);
    ElMessage.error("获取相邻仓库失败，请稍后重试");
  }
};
const closeWarehouseDialog = () => {
  warehouseDialogVisible.value = false;
  selectedWarehouse.value = null;
  currentVehicle.value = null;
};

const confirmWarehouseSelection = async () => {
  if (!selectedWarehouse.value) {
    ElMessage.warning("请选择终点仓库");
    return;
  }

  // 获取起始仓库和终点仓库 ID，以及当前车辆的 vehicleId
  const startWarehouseId = currentVehicle.value.warehouse.warehouseId;
  const endWarehouseId = selectedWarehouse.value;
  const vehicleId = currentVehicle.value.vehicleId;

  try {
    // 调用 API 获取可用车辆和司机
    const response = await getAvailableVehicleAndDriver({
      startWarehouseId,
      endWarehouseId,
      vehicleId,
    });
    console.log("调用接口成功：", response);
    ElMessage.success("发车操作成功！");
    fetchVehicles(); // 刷新车辆列表
  } catch (error) {
    console.error("调用接口失败：", error);
    ElMessage.error("发车操作失败，请稍后重试");
  } finally {
    closeWarehouseDialog();
  }
};


const markAsArrived = async (vehicle) => {
  try {
    if (!vehicle.vehicleId) {
      ElMessage.error("车辆 ID 不存在，无法处理");
      return;
    }
    const vehicleId = vehicle.vehicleId;
    const driverName = vehicle.driverName;
    const response = await arriveVehicle({vehicleId, driverName});
    ElMessage.success("车辆和司机状态已更新为空闲");
    fetchVehicles(); // 刷新车辆列表
  } catch (error) {
    console.error("更新状态失败：", error);
    ElMessage.error("货物已送达");
  }
};

// 获取车辆列表
const fetchVehicles = async () => {
  loading.value = true;
  try {
    // 调用接口
    const response = await getVehicles({ page: currentPage.value, size: pageSize.value });
    console.log("接口返回数据：", response);

    const warehouseResponse = await getWarehouses();
    warehouseList.value = warehouseResponse.data || [];
    // 更新车辆列表，确保不包含后端不需要的字段
    vehicleList.value = response;

  } catch (error) {
    console.error("获取车辆列表失败：", error);
    ElMessage.error("获取车辆列表失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};



// 获取仓库列表
const fetchWarehouses = async () => {
  try {
    const response = await getWarehouses();
    warehouseList.value = response.data || [];

    console.log('仓库列表：', warehouseList.value); // 调试输出仓库列表
  } catch (error) {
    console.error('获取仓库列表失败：', error);
    ElMessage.error('获取仓库列表失败，请稍后重试');
  }
};

// 如果有司机相关功能，获取司机列表
// const fetchDrivers = async () => {
//   try {
//     const response = await getDrivers();
//     driverList.value = response.data || [];
//   } catch (error) {
//     console.error('获取司机列表失败：', error);
//     ElMessage.error('获取司机列表失败，请稍后重试');
//   }
// };

// 搜索过滤
const filteredVehicleList = computed(() => {
  if (!searchQuery.value) return vehicleList.value;
  const query = searchQuery.value.toLowerCase();
  return vehicleList.value.filter(
    (vehicle) =>
      vehicle.licensePlate.toLowerCase().includes(query) ||
      vehicle.vehicleType.toLowerCase().includes(query)
  );
});

// 打开新增车辆模态框
const openAddDialog = () => {
  dialogTitle.value = '新增车辆';
  formData.value = {
    vehicleId: null,
    licensePlate: '',
    vehicleType: '',
    warehouseId: null,
    status: true,
    driverName: "",
  };
  dialogVisible.value = true;
};

// 打开编辑模态框
const openEditDialog = (vehicle: Vehicle) => {
  dialogTitle.value = '编辑车辆';
  formData.value = {
    ...vehicle, // 复制车辆的所有字段到表单数据
    warehouseName: vehicle.warehouseName, // 确保 warehouseName 被正确设置
  };
  dialogVisible.value = true;

  console.log('编辑车辆数据：', formData.value); // 调试输出，确保 warehouseName 正确
};


// 提交表单
const handleSubmit = async () => {
  try {

    // 根据是否存在 vehicleId 判断是更新还是新增车辆
    let response;
    if (formData.value.vehicleId) {
      // 更新车辆
      response = await updateVehicle(formData.value.vehicleId, {
        vehicleType: formData.value.vehicleType,
        licensePlate: formData.value.licensePlate,
        status: formData.value.status,
        warehouseId: formData.value.warehouseId,
      });
    } else {
      // 新增车辆，不需要提供 vehicleId
      response = await addVehicle({
        vehicleType: formData.value.vehicleType,
        licensePlate: formData.value.licensePlate,
        status: formData.value.status,
        warehouseId: formData.value.warehouseId,
      });
    }

    if (response) {
      ElMessage.success('车辆操作成功');
      fetchVehicles(); // 刷新车辆列表
      closeDialog(); // 关闭模态框
    }
  } catch (error) {
    console.error('车辆操作失败：', error);
    ElMessage.error('车辆操作失败，请稍后重试');
  }
};


// 删除车辆
const confirmDelete = (vehicleId) => {
  ElMessageBox.confirm('确定删除此车辆吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteVehicle(vehicleId);
        ElMessage.success('删除成功');
        fetchVehicles();
      } catch (error) {
        console.error('删除车辆失败：', error);
        ElMessage.error('删除车辆失败，请稍后重试');
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除操作');
    });
};

// 关闭模态框
const closeDialog = () => {
  dialogVisible.value = false;
};

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchVehicles();
};
const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchVehicles();
};

// 定义 handleSearch 方法
const handleSearch = () => {
  // 重置到第一页
  currentPage.value = 1;
  fetchVehicles();
};

// 加载数据
onMounted(async () => {
  await fetchWarehouses();
  // 如果有司机相关功能，调用 fetchDrivers()
  // await fetchDrivers();
  await fetchVehicles();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  max-width: 300px;
  margin-right: auto;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
