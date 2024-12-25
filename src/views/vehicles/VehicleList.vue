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
      <el-table-column prop="warehouseName" label="所属仓库" width="150" />
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
          <el-button type="success" link @click="markAsArrived(row)">已到达</el-button>
        </template>
      </el-table-column>
    </el-table>

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
          <el-switch v-model="formData.status" active-value="true" inactive-value="false" active-text="可用"
            inactive-text="不可用" />
        </el-form-item>
        <!-- 如果 assignedTo 是必需的，添加相应的表单项 -->
        <!-- 
        <el-form-item label="指派司机" prop="assignedTo">
          <el-select v-model="formData.assignedTo" placeholder="选择司机">
            <el-option
              v-for="driver in driverList"
              :key="driver.driverId"
              :label="driver.fullName"
              :value="driver.driverId"
            />
          </el-select>
        </el-form-item>
        -->
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
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '@/api/vehicles';
import { getWarehouses } from '@/api/warehouses';
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

const warehouseList = ref<Warehouse[]>([]); // 仓库列表
// const driverList = ref([]); // 司机列表，如果需要
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formData = ref({
  licensePlate: '',
  vehicleType: '',
  warehouseId: null,
  status: 'available',
  // assignedTo: null, // 如果需要指派司机，取消注释
});
const rules = {
  licensePlate: [{ required: true, message: '车牌号不能为空', trigger: 'blur' }],
  vehicleType: [{ required: true, message: '车型不能为空', trigger: 'blur' }],
  warehouseId: [{ required: true, message: '请选择所属仓库', trigger: 'change' }],
  // assignedTo: [{ required: true, message: '请选择指派司机', trigger: 'change' }], // 如果需要
};
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0); // 总数
const searchQuery = ref('');


const markAsArrived = async (vehicle) => {
  try {
    if (!vehicle.vehicleId) {
      ElMessage.error("车辆 ID 不存在，无法处理");
      return;
    }

    // 更新车辆状态为 "可用" 并清空指派司机
    const response = await updateVehicle(vehicle.vehicleId, {
      status: true, // 车辆变为可用
      assignedTo: null, // 取消指派司机
    });

    // 如果车辆有指派司机，则将司机状态更新为 "空闲"
    if (vehicle.assignedTo) {
      const driverId = vehicle.assignedTo.driverId;
      await updateDriver(driverId, {
        available: true, // 司机变为空闲
        assignedVehicle: null, // 取消指派车辆
      });
    }

    ElMessage.success("车辆和司机状态已更新为空闲");
    fetchVehicles(); // 刷新车辆列表
  } catch (error) {
    console.error("更新状态失败：", error);
    ElMessage.success("货物已送达");
  }
};

// 获取车辆列表
const fetchVehicles = async () => {
  loading.value = true;
  try {
    // 调用接口
    const response = await getVehicles({ page: currentPage.value, size: pageSize.value });
    console.log("接口返回数据：", response.data);

    const { items, total: totalCount } = response.data || {}; // 重命名 total 为 totalCount

    if (!Array.isArray(items)) {
      throw new Error("车辆数据格式异常");
    }

    // 更新车辆列表，确保不包含后端不需要的字段
    vehicleList.value = items.map((vehicle) => ({
      vehicleId: vehicle.vehicleId, // 确保包含 vehicleId
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType,
      warehouseId: vehicle.warehouseId,
      warehouseName: vehicle.warehouseName || "未知仓库",
      status: vehicle.status,
      // assignedTo: vehicle.assignedTo, // 如果需要
    }));

    // 更新分页总数
    if (typeof totalCount === "number") {
      total.value = totalCount; // 正确赋值
    } else {
      console.warn("total 字段格式异常，已重置为 0：", totalCount);
      total.value = 0;
    }
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
    licensePlate: '',
    vehicleType: '',
    warehouseId: null,
    status: 'available',
    // assignedTo: null, // 如果需要
  };
  dialogVisible.value = true;
};

// 打开编辑模态框
const openEditDialog = (vehicle: Vehicle) => {
  dialogTitle.value = '编辑车辆';
  formData.value = {
    ...vehicle, // 复制车辆的所有字段到表单数据
    warehouseId: vehicle.warehouseId, // 确保 warehouseId 被正确设置
  };
  dialogVisible.value = true;

  console.log('编辑车辆数据：', formData.value); // 调试输出，确保 warehouseId 正确
};


// 提交表单
const handleSubmit = async () => {
  try {
    // 检查 formData 中是否包含 vehicleId
    if (!formData.value.vehicleId) {
      ElMessage.error('车辆 ID 不能为空');
      return;
    }

    // 调用 API 更新车辆
    const response = await updateVehicle(formData.value.vehicleId, {
      vehicleType: formData.value.vehicleType,
      licensePlate: formData.value.licensePlate,
      status: formData.value.status,
      assignedTo: formData.value.assignedTo,
      warehouseId: formData.value.warehouseId,
    });

    if (response.data) {
      ElMessage.success('车辆更新成功');
      fetchVehicles(); // 刷新车辆列表
      closeDialog(); // 关闭模态框
    }
  } catch (error) {
    console.error('车辆更新失败：', error);
    ElMessage.error('车辆更新失败，请稍后重试');
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
