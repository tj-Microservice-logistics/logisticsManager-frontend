<template>
  <el-card>
    <!-- 搜索和新增按钮 -->
    <div class="card-header">
      <div class="title">司机列表</div>
      <el-input v-model="searchQuery" placeholder="搜索姓名或电话" class="search-bar" clearable @input="handleSearch">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="openAddDialog">
        <el-icon>
          <Plus />
        </el-icon>新增司机
      </el-button>
    </div>

    <!-- 司机表格 -->
    <el-table :data="filteredDriverList" border v-loading="loading" size="small">
      <el-table-column prop="fullName" label="姓名" width="150" />
      <el-table-column prop="contactNumber" label="电话" width="155" />
      <el-table-column prop="warehouseName" label="所属仓库" width="150" />
      <!-- 显示司机状态 -->
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.available ? 'success' : 'danger'">
            {{ row.available ? '空闲' : '运货中' }}
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
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
        layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>

    <!-- 新增/编辑司机模态框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" :rules="rules" ref="driverFormRef" label-width="100px">
        <el-form-item label="姓名" prop="fullName">
          <el-input v-model="formData.fullName" placeholder="请输入司机姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="contactNumber">
          <el-input v-model="formData.contactNumber" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="所属仓库" prop="warehouseId">
          <el-select v-model="formData.warehouseId" placeholder="选择所属仓库">
            <el-option v-for="warehouse in warehouseList" :key="warehouse.warehouseId" :label="warehouse.warehouseName"
              :value="warehouse.warehouseId" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="available">
          <el-switch v-model="formData.available" active-text="空闲" inactive-text="运货中"
            @change="console.log(formData.available)" />
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
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import { getDrivers, addDriver, updateDriver, deleteDriver } from '@/api/drivers';
import { getVehicles } from '@/api/vehicles';
import { getWarehouses } from '@/api/warehouses';
import axios from 'axios';

// 状态变量
const driverList = ref([]);
const warehouseList = ref<{ warehouseId: number; warehouseName: string }[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formData = ref({
  driverId: null,
  fullName: '',
  contactNumber: '',
  assignedVehicle: null,
  warehouseId: null,
  available: true,
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

    // 获取仓库数据
    const warehouseResponse = await getWarehouses();
    warehouseList.value = warehouseResponse.data || [];


    driverList.value = driverResponse;
    // 调试日志
    console.log("司机列表数据:", driverList.value);
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
    driverId: null,
    fullName: '',
    contactNumber: '',
    assignedVehicle: null,
    warehouseId: null,
    available: true,
  });
  dialogVisible.value = true;
};

// 打开编辑模态框
const openEditDialog = (driver: any) => {
  dialogTitle.value = '编辑司机';
  Object.assign(formData.value, { ...driver });
  formData.value.assignedVehicle = driver.assignedVehicle || null; // 保存当前分配的车辆 ID
  dialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  try {
    // 如果是新增司机，直接提交表单数据，不需要考虑 driverId
    const response = formData.value.driverId
        ? await axios.put(`http://100.76.102.33:9081/drivers/${formData.value.driverId}`, {
          fullName: formData.value.fullName,
          contactNumber: formData.value.contactNumber,
          warehouseId: formData.value.warehouseId,
          available: formData.value.available,
          assignedVehicle: formData.value.assignedVehicle,
        })
        : await axios.post("http://100.76.102.33:9081/drivers", {
          fullName: formData.value.fullName,
          contactNumber: formData.value.contactNumber,
          warehouseId: formData.value.warehouseId,
          available: formData.value.available,
          assignedVehicle: formData.value.assignedVehicle,
        });

    ElMessage.success("司机信息保存成功");
    fetchDrivers(); // 更新司机列表
    closeDialog(); // 关闭模态框
  } catch (error) {
    console.error("保存司机失败：", error);
    ElMessage.error("司机信息保存失败，请稍后重试");
  }
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
  // if (driverFormRef.value) {
  //   driverFormRef.value.resetFields();
  // }
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
