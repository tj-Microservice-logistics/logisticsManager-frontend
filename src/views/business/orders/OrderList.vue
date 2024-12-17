<template>
  <div class="order-list">
    <el-card class="header-card">
      <div class="card-header">
        <div class="title">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </div>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新增订单
        </el-button>
      </div>

      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="订单号/客户名称"
          class="filter-item"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="statusFilter" placeholder="订单状态" clearable class="filter-item">
          <el-option label="待确认" value="pending" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="运输中" value="in_transit" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
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
      <el-table :data="orderList" border v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="customerName" label="客户名称" width="150" />
        <el-table-column prop="fromAddress" label="发货地" width="200" />
        <el-table-column prop="toAddress" label="收货地" width="200" />
        <el-table-column prop="goodsType" label="货物类型" width="120" />
        <el-table-column prop="weight" label="重量(吨)" width="100" />
        <el-table-column prop="volume" label="体积(m³)" width="100" />
        <el-table-column prop="expectedDeliveryTime" label="预计送达" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="success" link @click="handleDispatch(row)">
              <el-icon><Van /></el-icon>派车
            </el-button>
            <el-button type="danger" link @click="handleCancel(row)">
              <el-icon><CircleClose /></el-icon>取消
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
      width="700px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="customerPhone">
              <el-input v-model="form.customerPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发货地" prop="fromAddress">
              <el-input v-model="form.fromAddress" placeholder="请输入发货地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收货地" prop="toAddress">
              <el-input v-model="form.toAddress" placeholder="请输入收货地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="货物类型" prop="goodsType">
              <el-select v-model="form.goodsType" placeholder="请选择货物类型" class="w-full">
                <el-option label="普通货物" value="normal" />
                <el-option label="易碎品" value="fragile" />
                <el-option label="冷藏品" value="refrigerated" />
                <el-option label="危险品" value="dangerous" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="重量" prop="weight">
              <el-input-number
                v-model="form.weight"
                :min="0"
                :precision="2"
                :step="0.5"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="体积" prop="volume">
              <el-input-number
                v-model="form.volume"
                :min="0"
                :precision="2"
                :step="0.5"
                class="w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="预计送达" prop="expectedDeliveryTime">
          <el-date-picker
            v-model="form.expectedDeliveryTime"
            type="datetime"
            placeholder="请选择预计送达时间"
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

    <!-- 派车对话框 -->
    <el-dialog
      title="派车安排"
      v-model="dispatchDialogVisible"
      width="500px"
    >
      <el-form
        ref="dispatchFormRef"
        :model="dispatchForm"
        :rules="dispatchRules"
        label-width="100px"
      >
        <el-form-item label="选择车辆" prop="vehicleId">
          <el-select v-model="dispatchForm.vehicleId" placeholder="请选择车辆" class="w-full">
            <el-option
              v-for="vehicle in availableVehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择司机" prop="driverId">
          <el-select v-model="dispatchForm.driverId" placeholder="请选择司机" class="w-full">
            <el-option
              v-for="driver in availableDrivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预计发车" prop="departureTime">
          <el-date-picker
            v-model="dispatchForm.departureTime"
            type="datetime"
            placeholder="请选择预计发车时间"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="dispatchForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dispatchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDispatchSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Document, Plus, Edit, Search, Van, CircleClose } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const dialogVisible = ref(false)
const dispatchDialogVisible = ref(false)
const isEdit = ref(false)

const dialogTitle = computed(() => isEdit.value ? '编辑订单' : '新增订单')

// 表单相关
const formRef = ref<FormInstance>()
const form = ref({
  customerName: '',
  customerPhone: '',
  fromAddress: '',
  toAddress: '',
  goodsType: '',
  weight: 0,
  volume: 0,
  expectedDeliveryTime: '',
  remark: ''
})

const rules: FormRules = {
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  customerPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  fromAddress: [{ required: true, message: '请输入发货地址', trigger: 'blur' }],
  toAddress: [{ required: true, message: '请输入收货地址', trigger: 'blur' }],
  goodsType: [{ required: true, message: '请选择货物类型', trigger: 'change' }],
  weight: [{ required: true, message: '请输入重量', trigger: 'blur' }],
  volume: [{ required: true, message: '请输入体积', trigger: 'blur' }],
  expectedDeliveryTime: [{ required: true, message: '请选择预计送达时间', trigger: 'change' }]
}

// 派车表单相关
const dispatchFormRef = ref<FormInstance>()
const dispatchForm = ref({
  vehicleId: '',
  driverId: '',
  departureTime: '',
  remark: ''
})

const dispatchRules: FormRules = {
  vehicleId: [{ required: true, message: '请选择车辆', trigger: 'change' }],
  driverId: [{ required: true, message: '请选择司机', trigger: 'change' }],
  departureTime: [{ required: true, message: '请选择预计发车时间', trigger: 'change' }]
}

// 模拟数据
const orderList = ref([
  {
    orderNo: 'DD202403180001',
    customerName: '张三',
    customerPhone: '13800138000',
    fromAddress: '上海市浦东新区XX路XX号',
    toAddress: '北京市朝阳区XX路XX号',
    goodsType: 'normal',
    weight: 2.5,
    volume: 3.0,
    expectedDeliveryTime: '2024-03-20 14:00',
    status: 'pending',
    amount: 2800
  },
  {
    orderNo: 'DD202403180002',
    customerName: '李四',
    customerPhone: '13900139000',
    fromAddress: '广州市天河区XX路XX号',
    toAddress: '深圳市南山区XX路XX号',
    goodsType: 'fragile',
    weight: 1.5,
    volume: 2.0,
    expectedDeliveryTime: '2024-03-19 16:00',
    status: 'confirmed',
    amount: 1500
  }
])

const availableVehicles = ref([
  { id: 1, plateNumber: '沪A12345' },
  { id: 2, plateNumber: '沪B67890' }
])

const availableDrivers = ref([
  { id: 1, name: '张师傅' },
  { id: 2, name: '李师傅' }
])

// 状态相关
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    in_transit: 'success',
    completed: 'info',
    cancelled: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    in_transit: '运输中',
    completed: '已完成',
    cancelled: '已取消'
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

const handleCreate = () => {
  isEdit.value = false
  form.value = {
    customerName: '',
    customerPhone: '',
    fromAddress: '',
    toAddress: '',
    goodsType: '',
    weight: 0,
    volume: 0,
    expectedDeliveryTime: '',
    remark: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDispatch = (row: any) => {
  dispatchForm.value = {
    vehicleId: '',
    driverId: '',
    departureTime: '',
    remark: ''
  }
  dispatchDialogVisible.value = true
}

const handleCancel = (row: any) => {
  ElMessageBox.confirm(
    `确认取消订单 ${row.orderNo} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 执行取消操作
    ElMessage.success('订单已取消')
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

const handleDispatchSubmit = async () => {
  if (!dispatchFormRef.value) return
  
  await dispatchFormRef.value.validate((valid) => {
    if (valid) {
      // 提交派车表单
      ElMessage.success('派车成功')
      dispatchDialogVisible.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.order-list {
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