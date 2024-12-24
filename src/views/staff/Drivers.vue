<template>
  <el-card>
    <!-- 搜索和新增按钮 -->
    <div class="card-header">
      <div class="title">司机列表</div>
      <el-input
        v-model="searchQuery"
        placeholder="搜索姓名或电话"
        class="search-bar"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>新增司机
      </el-button>
    </div>

    <!-- 司机表格 -->
    <el-table :data="filteredDriverList" border v-loading="loading" size="small">
  <el-table-column prop="fullName" label="姓名" width="150" />
  <el-table-column prop="contactNumber" label="电话" width="200" />
  <el-table-column prop="warehouseName" label="所属仓库" width="200" />
  <el-table-column prop="assignedVehicle" label="车牌号" width="150">
    <template #default="{ row }">
      <span v-if="row.assignedVehicle">{{ row.assignedVehicle }}</span>
      <span v-else>未分配</span>
    </template>
  </el-table-column>
  <el-table-column prop="isAvailable" label="状态" width="120">
    <template #default="{ row }">
      <el-tag :type="row.isAvailable ? 'success' : 'danger'">
        {{ row.isAvailable ? '空闲' : '忙碌' }}
      </el-tag>
    </template>
  </el-table-column>
  <el-table-column label="操作" fixed="right" width="150">
    <template #default="{ row }">
      <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
      <el-button type="danger" link @click="confirmDelete(row.driverId)">删除</el-button>
    </template>
  </el-table-column>
</el-table>


    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑司机模态框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :before-close="closeDialog"
    >
    <el-form :model="formData" :rules="rules" ref="driverFormRef" label-width="100px">
    <el-form-item label="姓名" prop="fullName">
      <el-input v-model="formData.fullName" placeholder="请输入司机姓名" />
    </el-form-item>
    <el-form-item label="电话" prop="contactNumber">
      <el-input v-model="formData.contactNumber" placeholder="请输入联系电话" />
    </el-form-item>
    <el-form-item label="所属仓库" prop="warehouseId">
      <el-select v-model="formData.warehouseId" placeholder="选择所属仓库">
        <el-option
          v-for="warehouse in warehouseList"
          :key="warehouse.warehouseId"
          :label="warehouse.warehouseName"
          :value="warehouse.warehouseId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="状态" prop="isAvailable">
      <el-switch v-model="formData.isAvailable" active-text="空闲" inactive-text="忙碌" />
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
import { getDrivers, addDriver, updateDriver, deleteDriver } from '@/api/drivers';
import { getVehicles } from '@/api/vehicles';
import { getWarehouses } from '@/api/warehouses';

// 状态变量
const driverList = ref([]);
const vehicleList = ref([]);
const warehouseList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formData = ref({
  fullName: '',
  contactNumber: '',
  assignedVehicle: null,
  warehouseId: null,
  isAvailable: true,
});
const rules = {
  fullName: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  contactNumber: [{ required: true, message: '电话不能为空', trigger: 'blur' }],
  warehouseId: [{ required: true, message: '请选择所属仓库', trigger: 'change' }],
};
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchQuery = ref('');
const driverFormRef = ref(null);

// 获取司机、车辆、仓库列表
const fetchDrivers = async () => {
  loading.value = true;

  try {
    // 获取司机数据
    const driverResponse = await getDrivers({
      page: currentPage.value,
      size: pageSize.value,
    });
    const driverItems = driverResponse.data || [];
    total.value = driverItems.length;

    // 获取车辆数据
    const vehicleResponse = await getVehicles();
    const vehicleItems = vehicleResponse.data?.items || [];
    vehicleList.value = vehicleItems;

    // 获取仓库数据
    const warehouseResponse = await getWarehouses();
    warehouseList.value = warehouseResponse.data || [];

    // 合并数据
    driverList.value = driverItems.map((driver) => {
      const vehicle = vehicleList.value.find((v) => v.vehicleId === driver.assignedVehicle);
      const warehouse = warehouseList.value.find((w) => w.warehouseId === driver.warehouseId);
      return {
        ...driver,
        assignedVehicle: vehicle ? vehicle.licensePlate : '未分配',
        warehouseName: warehouse ? warehouse.warehouseName : '未知仓库',
      };
    });
  } catch (error) {
    console.error('获取数据失败：', error);
    ElMessage.error('获取数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 搜索过滤
const filteredDriverList = computed(() => {
  if (!searchQuery.value) return driverList.value;
  return driverList.value.filter(
    (driver) =>
      driver.fullName.includes(searchQuery.value) ||
      driver.contactNumber.includes(searchQuery.value)
  );
});

// 打开新增模态框
const openAddDialog = () => {
  dialogTitle.value = '新增司机';
  Object.assign(formData.value, {
    fullName: '',
    contactNumber: '',
    assignedVehicle: null,
    warehouseId: null,
    isAvailable: true,
  });
  dialogVisible.value = true;
};

// 打开编辑模态框
const openEditDialog = (driver) => {
  dialogTitle.value = '编辑司机';
  Object.assign(formData.value, { ...driver });
  dialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  driverFormRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      if (dialogTitle.value === '新增司机') {
        await addDriver(formData.value);
        ElMessage.success('新增司机成功');
      } else {
        await updateDriver(formData.value.driverId, formData.value);
        ElMessage.success('编辑司机成功');
      }
      fetchDrivers();
      closeDialog();
    } catch (error) {
      console.error('保存司机失败：', error);
      ElMessage.error('保存司机失败，请稍后重试');
    }
  });
};

// 删除司机
const confirmDelete = (driverId) => {
  ElMessageBox.confirm('确定删除此司机吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteDriver(driverId);
        ElMessage.success('删除成功');
        fetchDrivers();
      } catch (error) {
        console.error('删除司机失败：', error);
        ElMessage.error('删除司机失败，请稍后重试');
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除操作');
    });
};

// 关闭模态框
const closeDialog = () => {
  dialogVisible.value = false;
  if (driverFormRef.value) {
    driverFormRef.value.resetFields();
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchDrivers();
};

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchDrivers();
};
const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchDrivers();
};

// 加载数据
onMounted(fetchDrivers);
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-bar {
  margin-right: auto;
  max-width: 300px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
