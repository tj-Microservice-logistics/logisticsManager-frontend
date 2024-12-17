<template>
  <div class="vehicle-return">
    <el-card class="header-card">
      <div class="card-header">
        <div class="title">
          <el-icon><Calendar /></el-icon>
          <span>回车登记</span>
        </div>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新增登记
        </el-button>
      </div>

      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="车牌号/司机"
          class="filter-item"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

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
      <el-table :data="returnList" border v-loading="loading">
        <el-table-column prop="plateNumber" label="车牌��" width="120" />
        <el-table-column prop="driver" label="司机" width="120" />
        <el-table-column prop="departureTime" label="出车时间" width="180" />
        <el-table-column prop="returnTime" label="回车时间" width="180" />
        <el-table-column prop="startMileage" label="出车里程" width="120" />
        <el-table-column prop="endMileage" label="回车里程" width="120" />
        <el-table-column prop="mileageDiff" label="行驶里程" width="120">
          <template #default="{ row }">
            {{ row.endMileage - row.startMileage }} km
          </template>
        </el-table-column>
        <el-table-column prop="fuelConsumption" label="油耗(L)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="车辆" prop="vehicleId">
          <el-select v-model="form.vehicleId" placeholder="请选择车辆" class="w-full">
            <el-option
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="司机" prop="driverId">
          <el-select v-model="form.driverId" placeholder="请选择司机" class="w-full">
            <el-option
              v-for="driver in drivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出车时间" prop="departureTime">
          <el-date-picker
            v-model="form.departureTime"
            type="datetime"
            placeholder="请选择出车时间"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="回车时间" prop="returnTime">
          <el-date-picker
            v-model="form.returnTime"
            type="datetime"
            placeholder="请选择回车时间"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="出车里程" prop="startMileage">
          <el-input-number
            v-model="form.startMileage"
            :min="0"
            :precision="0"
            :step="1000"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="回车里程" prop="endMileage">
          <el-input-number
            v-model="form.endMileage"
            :min="0"
            :precision="0"
            :step="1000"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="油耗" prop="fuelConsumption">
          <el-input-number
            v-model="form.fuelConsumption"
            :min="0"
            :precision="1"
            :step="0.5"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchQuery = ref('')
const dateRange = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)

const dialogTitle = computed(() => isEdit.value ? '编辑回车登记' : '新增回车登记')

// 表单相关
const formRef = ref<FormInstance>()
const form = ref({
  vehicleId: '',
  driverId: '',
  departureTime: '',
  returnTime: '',
  startMileage: 0,
  endMileage: 0,
  fuelConsumption: 0,
  remark: ''
})

const rules: FormRules = {
  vehicleId: [{ required: true, message: '请选择车辆', trigger: 'change' }],
  driverId: [{ required: true, message: '请选择司机', trigger: 'change' }],
  departureTime: [{ required: true, message: '请选择出车时间', trigger: 'change' }],
  returnTime: [{ required: true, message: '请选择回车时间', trigger: 'change' }],
  startMileage: [{ required: true, message: '请输入出车里程', trigger: 'blur' }],
  endMileage: [{ required: true, message: '请输入回车里程', trigger: 'blur' }]
}

// 模拟数据
const vehicles = ref([
  { id: 1, plateNumber: '沪A12345' },
  { id: 2, plateNumber: '沪B67890' }
])

const drivers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
])

const returnList = ref([
  {
    plateNumber: '沪A12345',
    driver: '张三',
    departureTime: '2024-03-18 08:00',
    returnTime: '2024-03-18 18:00',
    startMileage: 15000,
    endMileage: 15350,
    fuelConsumption: 25.5,
    status: 'completed'
  },
  {
    plateNumber: '沪B67890',
    driver: '李四',
    departureTime: '2024-03-18 07:30',
    returnTime: '2024-03-18 17:30',
    startMileage: 25000,
    endMileage: 25280,
    fuelConsumption: 22.0,
    status: 'completed'
  }
])

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: 'success',
    pending: 'warning'
  }
  return statusMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: '已完成',
    pending: '待确认'
  }
  return statusMap[status] || status
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}

const handleCreate = () => {
  isEdit.value = false
  form.value = {
    vehicleId: '',
    driverId: '',
    departureTime: '',
    returnTime: '',
    startMileage: 0,
    endMileage: 0,
    fuelConsumption: 0,
    remark: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确认删除该回车记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 执行删除操作
    ElMessage.success('删除成功')
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      // 提交表单
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.vehicle-return {
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