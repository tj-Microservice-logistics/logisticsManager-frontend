<template>
  <div class="vehicle-types">
    <el-card class="header-card">
      <div class="card-header">
        <div class="title">
          <el-icon><Van /></el-icon>
          <span>车型管理</span>
        </div>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新增车型
        </el-button>
      </div>

      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="车型编号/名称"
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
      <el-table :data="typeList" border v-loading="loading" size="small">
        <el-table-column prop="code" label="车型编码" width="120" />
        <el-table-column prop="name" label="车型名称" width="150" />
        <el-table-column prop="capacity" label="载重(吨)" width="120" />
        <el-table-column prop="quantity" label="车型数量" width="120" />
        <el-table-column prop="length" label="车厢长度(米)" width="120" />
        <el-table-column prop="width" label="车厢宽度(米)" width="120" />
        <el-table-column prop="height" label="车厢高度(米)" width="120" />
        <el-table-column prop="description" label="说明" />
        <el-table-column label="操作" width="150" fixed="right">
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
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="车型编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入车型编码" />
        </el-form-item>
        <el-form-item label="车型名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入车型名称" />
        </el-form-item>
        <el-form-item label="载重" prop="capacity">
          <el-input-number 
            v-model="form.capacity" 
            :min="0"
            :precision="2"
            :step="0.5"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="车型数量" prop="quantity">
          <el-input-number
            v-model="form.quantity"
            :min="0"
            :precision="0"
            :step="1"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="车厢长度" prop="length">
          <el-input-number
            v-model="form.length"
            :min="0"
            :precision="2"
            :step="0.5"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="车厢宽度" prop="width">
          <el-input-number
            v-model="form.width"
            :min="0"
            :precision="2"
            :step="0.5"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="车厢高度" prop="height">
          <el-input-number
            v-model="form.height"
            :min="0"
            :precision="2"
            :step="0.5"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入说明"
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
import { Van, Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchQuery = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)

const dialogTitle = computed(() => isEdit.value ? '编辑车型' : '新增车型')

// 表单相关
const formRef = ref<FormInstance>()
const form = ref({
  code: '',
  name: '',
  capacity: 0,
  quantity: 0,
  length: 0,
  width: 0,
  height: 0,
  description: ''
})

const rules: FormRules = {
  code: [{ required: true, message: '请输入车型编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入车型名称', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入载重', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入车型数量', trigger: 'blur' }],
  length: [{ required: true, message: '请输入车厢长度', trigger: 'blur' }],
  width: [{ required: true, message: '请输入车厢宽度', trigger: 'blur' }],
  height: [{ required: true, message: '请输入车厢高度', trigger: 'blur' }]
}

// 模拟数据
const typeList = ref([
  {
    code: 'VT001',
    name: '小型厢式货车',
    capacity: 2.5,
    quantity: 12,
    length: 4.2,
    width: 1.8,
    height: 2.0,
    description: '适合城市配送'
  },
  {
    code: 'VT002', 
    name: '中型厢式货车',
    capacity: 4.5,
    quantity: 8,
    length: 6.8,
    width: 2.3,
    height: 2.5,
    description: '适合城际运输'
  }
])

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
    code: '',
    name: '',
    capacity: 0,
    quantity: 0,
    length: 0,
    width: 0,
    height: 0,
    description: ''
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
    `确认删除车型 ${row.name} 吗？`,
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
.vehicle-types {
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

  :deep(.w-full) {
    width: 100%;
  }

  /* 防止横向滚动条 */
  :deep(.el-table) {
    overflow-x: auto;
  }
}
</style> 