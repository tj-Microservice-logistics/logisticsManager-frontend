<template>
  <div class="report-generate">
    <div class="header-card">
      <div class="card-header">
        <div class="title">
          <i class="icon"><component :is="Document" /></i>
          <span>报表生成</span>
        </div>
      </div>

      <div class="filter-container">
        <div class="form">
          <div class="form-row">
            <div class="form-item">
              <label>报表类型</label>
              <select v-model="reportForm.type">
                <option value="">请选择报表类型</option>
                <option value="transport">运输报表</option>
                <option value="order">订单报表</option>
                <option value="inventory">库存报表</option>
                <option value="finance">财务报表</option>
              </select>
            </div>
            <div class="form-item">
              <label>时间范围</label>
              <input type="date" v-model="reportForm.startDate">
              <span class="separator">至</span>
              <input type="date" v-model="reportForm.endDate">
            </div>
            <div class="form-item">
              <label>报表格式</label>
              <select v-model="reportForm.format">
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div class="divider">自定义筛选</div>

          <div class="form-row">
            <div class="form-item">
              <label>区域</label>
              <select v-model="reportForm.region">
                <option value="">请选择区域</option>
                <optgroup v-for="region in regionOptions" 
                  :key="region.value" 
                  :label="region.label"
                >
                  <option v-for="city in region.children"
                    :key="city.value"
                    :value="city.value"
                  >
                    {{ city.label }}
                  </option>
                </optgroup>
              </select>
            </div>
            <div class="form-item">
              <label>业务类型</label>
              <select v-model="reportForm.businessType">
                <option value="all">全部</option>
                <option value="city">城市配送</option>
                <option value="long">长途运输</option>
              </select>
            </div>
            <div class="form-item">
              <label>客户类型</label>
              <select v-model="reportForm.customerType">
                <option value="all">全部</option>
                <option value="business">企业客户</option>
                <option value="personal">个人客户</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="handleGenerate">
              <i class="icon"><component :is="DocumentAdd" /></i>生成报表
            </button>
            <button class="btn" @click="handleReset">
              <i class="icon"><component :is="Refresh" /></i>重置
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 报表预览 -->
    <div v-if="showPreview" class="preview-card">
      <div class="card-header">
        <span>报表预览</span>
        <div class="actions">
          <button class="btn-link" @click="handleDownload">
            <i class="icon"><component :is="Download" /></i>下载
          </button>
          <button class="btn-link" @click="handleShare">
            <i class="icon"><component :is="Share" /></i>分享
          </button>
        </div>
      </div>

      <div class="preview-content">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="col in previewColumns" :key="col.prop">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in previewData" :key="index">
              <td v-for="col in previewColumns" :key="col.prop">
                {{ row[col.prop as keyof PreviewItem] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分享对话框 -->
    <div v-if="shareDialogVisible" class="dialog-overlay" @click="shareDialogVisible = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <span>分享报表</span>
          <button class="close-btn" @click="shareDialogVisible = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="share-link">
            <input type="text" readonly :value="shareLink">
            <button class="btn" @click="copyLink">复制</button>
          </div>
          <div class="qrcode-container">
            <!-- 这里放二维码 -->
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn" @click="shareDialogVisible = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Document, DocumentAdd, Refresh, Download, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 表单数据
const reportForm = reactive({
  type: '',
  startDate: '',
  endDate: '',
  format: 'excel',
  region: '',
  businessType: 'all',
  customerType: 'all'
})

// 区域选项
const regionOptions = [
  {
    value: 'east',
    label: '华东地区',
    children: [
      { value: 'sh', label: '上海' },
      { value: 'js', label: '江苏' }
    ]
  },
  {
    value: 'south',
    label: '华南地区',
    children: [
      { value: 'gd', label: '广东' },
      { value: 'gx', label: '广西' }
    ]
  }
]

// 预览相关
const showPreview = ref(false)
interface PreviewItem {
  date: string
  region: string
  amount: string
}

const previewData = ref<PreviewItem[]>([])
const previewColumns = ref([
  { prop: 'date', label: '日期' },
  { prop: 'region', label: '区域' },
  { prop: 'amount', label: '金额' }
])

// 分享相关
const shareDialogVisible = ref(false)
const shareLink = ref('https://example.com/report/123456')

// 生成报表
const handleGenerate = () => {
  // 这里调用生成报表的API
  showPreview.value = true
  previewData.value = [
    { date: '2024-03-18', region: '上海', amount: '12580' },
    { date: '2024-03-19', region: '江苏', amount: '15680' }
  ]
  ElMessage.success('报表生成成功')
}

// 重置表单
const handleReset = () => {
  reportForm.type = ''
  reportForm.startDate = ''
  reportForm.endDate = ''
  reportForm.format = 'excel'
  reportForm.region = ''
  reportForm.businessType = 'all'
  reportForm.customerType = 'all'
  showPreview.value = false
}

// 下载报表
const handleDownload = () => {
  ElMessage.success('报表下载中...')
}

// 分享报表
const handleShare = () => {
  shareDialogVisible.value = true
}

// 复制链接
const copyLink = () => {
  navigator.clipboard.writeText(shareLink.value)
  ElMessage.success('链接已复制')
}
</script>

<style scoped lang="scss">
.report-generate {
  .header-card, .preview-card {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 20px;
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;

      .icon {
        margin-right: 8px;
      }
    }
  }

  .form {
    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-item {
      flex: 1;

      label {
        display: block;
        margin-bottom: 8px;
        color: #606266;
      }

      select, input {
        width: 100%;
        height: 32px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 0 12px;
        font-size: 14px;

        &:focus {
          border-color: #409eff;
          outline: none;
        }
      }

      .separator {
        margin: 0 8px;
      }
    }

    .divider {
      border-top: 1px solid #ebeef5;
      margin: 24px 0;
      color: #909399;
      font-size: 14px;
      padding-top: 12px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
    }
  }

  .btn {
    height: 32px;
    padding: 0 16px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    background: #fff;
    color: #606266;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 14px;

    &:hover {
      border-color: #c6e2ff;
      color: #409eff;
      background: #ecf5ff;
    }

    .icon {
      margin-right: 4px;
    }

    &.btn-primary {
      background: #409eff;
      border-color: #409eff;
      color: #fff;

      &:hover {
        background: #66b1ff;
        border-color: #66b1ff;
      }
    }
  }

  .btn-link {
    background: none;
    border: none;
    color: #409eff;
    cursor: pointer;
    padding: 4px 8px;
    display: flex;
    align-items: center;

    &:hover {
      color: #66b1ff;
    }

    .icon {
      margin-right: 4px;
    }
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      border: 1px solid #ebeef5;
      padding: 12px;
      text-align: left;
    }

    th {
      background: #f5f7fa;
      font-weight: 500;
    }

    tr:hover td {
      background: #f5f7fa;
    }
  }

  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .dialog {
    background: #fff;
    border-radius: 4px;
    width: 400px;
    
    .dialog-header {
      padding: 20px;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .close-btn {
        border: none;
        background: none;
        font-size: 20px;
        color: #909399;
        cursor: pointer;

        &:hover {
          color: #606266;
        }
      }
    }

    .dialog-content {
      padding: 20px;

      .share-link {
        display: flex;
        gap: 8px;

        input {
          flex: 1;
          height: 32px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          padding: 0 12px;
        }
      }

      .qrcode-container {
        margin-top: 20px;
        text-align: center;
      }
    }

    .dialog-footer {
      padding: 20px;
      border-top: 1px solid #ebeef5;
      text-align: right;
    }
  }
}
</style> 