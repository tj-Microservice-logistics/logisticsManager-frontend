<template>
  <div class="schedule">
    <el-card class="header-card">
      <div class="card-header">
        <div class="title">
          <el-icon><Clock /></el-icon>
          <span>排班管理</span>
        </div>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新增排班
        </el-button>
      </div>
    </el-card>

    <el-card class="content-card">
      <el-table :data="scheduleList" border v-loading="loading">
        <el-table-column prop="driver" label="司机" width="120" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="shift" label="班次" width="120" />
        <el-table-column label="操作" fixed="right" width="200">
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
        <el-form-item label="司机" prop="driver">
          <el-select v-model="form.driver" placeholder="请选择司机" class="w-full">
            <el-option
              v-for="driver in availableDrivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="请选择日期"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="班次" prop="shift">
          <el-select v-model="form.shift" placeholder="请选择班次" class="w-full">
            <el-option label="早班" value="morning" />
            <el-option label="晚班" value="evening" />
          </el-select>
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
import { Clock, Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)

const dialogTitle = computed(() => isEdit.value ? '编辑排班' : '新增排班')

// 表单相关
const formRef = ref<FormInstance>()
const form = ref({
  driver: '',
  date: '',
  shift: ''
})

const rules: FormRules = {
  driver: [{ required: true, message: '请选择司机', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  shift: [{ required: true, message: '请选择班次', trigger: 'change' }]
}

// 模拟数据
const scheduleList = ref([
  { driver: '张三', date: '2024-03-18', shift: 'morning' },
  { driver: '李四', date: '2024-03-18', shift: 'evening' }
])

const availableDrivers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
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
    driver: '',
    date: '',
    shift: ''
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
    `确认删除排班记录吗？`,
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