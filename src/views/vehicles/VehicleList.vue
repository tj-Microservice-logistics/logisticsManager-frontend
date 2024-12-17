<template>
  <div class="vehicle-list">
    <el-card class="header-card">
      <div class="card-header">
        <div class="title">
          <el-icon><Van /></el-icon>
          <span>车辆列表</span>
        </div>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新增车辆
        </el-button>
      </div>

      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="车牌号/车型"
          class="filter-item"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </el-card>

    <el-card class="content-card">
      <el-table :data="vehicleList" border v-loading="loading" size="small">
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="type" label="车型" width="150" />
        <el-table-column prop="capacity" label="载重(吨)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="success" link @click="handleMaintenance(row)">
              <el-icon><Tools /></el-icon>维护记录
            </el-button>
            <el-button type="warning" link @click="handleAssign(row)">
              <el-icon><User /></el-icon>分配司机
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
        <el-form-item label="车牌号" prop="plateNumber">
          <el-input v-model="form.plateNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="车型" prop="type">
          <el-select v-model="form.type" placeholder="请选择车型" class="w-full">
            <el-option
              v-for="item in vehicleTypes"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="购置日期" prop="purchaseDate">
          <el-date-picker
            v-model="form.purchaseDate"
            type="date"
            placeholder="请选择购置日期"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="初始里程" prop="initialMileage">
          <el-input-number
            v-model="form.initialMileage"
            :min="0"
            :precision="0"
            :step="1000"
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

    <!-- 维护记录对话框 -->
    <el-dialog
      title="维护记录"
      v-model="maintenanceDialogVisible"
      width="800px"
    >
      <el-table :data="maintenanceRecords" border>
        <el-table-column prop="date" label="维护日期" width="180" />
        <el-table-column prop="type" label="维护类型" width="120" />
        <el-table-column prop="mileage" label="维护里程" width="120" />
        <el-table-column prop="cost" label="维护费用" width="120" />
        <el-table-column prop="description" label="维护内容" />
        <el-table-column prop="maintainer" label="维护人员" width="120" />
      </el-table>
    </el-dialog>

    <!-- 分配司机对话框 -->
    <el-dialog
      title="分配司机"
      v-model="assignDialogVisible"
      width="500px"
    >
      <el-form
        ref="assignFormRef"
        :model="assignForm"
        :rules="assignRules"
        label-width="100px"
      >
        <el-form-item label="选择司机" prop="driverId">
          <el-select v-model="assignForm.driverId" placeholder="请选择司机" class="w-full">
            <el-option
              v-for="driver in availableDrivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生效日期" prop="startDate">
          <el-date-picker
            v-model="assignForm.startDate"
            type="date"
            placeholder="请选择生效日期"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="assignForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAssignSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Van, Plus, Edit, Search, Tools, User } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dialogVisible = ref(false)
const maintenanceDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const isEdit = ref(false)

const dialogTitle = computed(() => isEdit.value ? '编辑车辆' : '新增车辆')

// 表单相关
const formRef = ref<FormInstance>()
const form = ref({
  plateNumber: '',
  type: '',
  purchaseDate: '',
  initialMileage: 0,
  remark: ''
})

const rules: FormRules = {
  plateNumber: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  type: [{ required: true, message: '请选择车型', trigger: 'change' }],
  purchaseDate: [{ required: true, message: '请选择购置日期', trigger: 'change' }]
}

// 分配司机表单
const assignFormRef = ref<FormInstance>()
const assignForm = ref({
  driverId: '',
  startDate: '',
  remark: ''
})

const assignRules: FormRules = {
  driverId: [{ required: true, message: '请选择司机', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }]
}

// 模拟数据
const vehicleTypes = ref([
  { code: 'VT001', name: '小型厢式货车' },
  { code: 'VT002', name: '中型厢式货车' }
])

const vehicleList = ref([
  {
    plateNumber: '沪A12345',
    type: '小型厢式货车',
    capacity: 2.5,
    status: 'idle',
    driver: '张三',
    lastMaintenance: '2024-02-15',
    nextMaintenance: '2024-05-15',
    mileage: 15000
  },
  {
    plateNumber: '沪B67890',
    type: '中型厢式货车',
    capacity: 4.5,
    status: 'in_transit',
    driver: '李四',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-04-20',
    mileage: 25000
  }
])

const maintenanceRecords = ref([
  {
    date: '2024-02-15',
    type: '定期保养',
    mileage: 15000,
    cost: 2000,
    description: '更换机油、机滤、空滤',
    maintainer: '王师傅'
  }
])

const availableDrivers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    idle: 'success',
    in_transit: 'warning',
    maintenance: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    idle: '空闲',
    in_transit: '在途',
    maintenance: '维修'
  }
  return statusMap[status] || status
}

// ... 其他方法实现（handleSizeChange, handleCurrentChange, handleCreate, handleEdit, handleMaintenance, handleAssign等）
</script>

<style scoped lang="scss">
.vehicle-list {
  .header-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        display: flex;
        align-items: center;
        font-size: 16px;
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

  /* 防止横向滚动条 */
  :deep(.el-table) {
    overflow-x: auto;
  }
}
</style> 