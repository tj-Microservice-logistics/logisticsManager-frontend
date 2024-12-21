<template>
  <div class="report-history">
    <div class="header-card">
      <div class="filter-container">
        <div class="form">
          <div class="form-row">
            <div class="form-item">
              <label>报表类型</label>
              <select v-model="filterForm.type">
                <option value="">请选择报表类型</option>
                <option value="transport">运输报表</option>
                <option value="order">订单报表</option>
                <option value="inventory">库存报表</option>
                <option value="finance">财务报表</option>
              </select>
            </div>
            <div class="form-item">
              <label>生成时间</label>
              <input type="date" v-model="filterForm.startDate">
              <span class="separator">至</span>
              <input type="date" v-model="filterForm.endDate">
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="handleSearch">
                <i class="icon"><component :is="Search" /></i>查询
              </button>
              <button class="btn" @click="handleReset">
                <i class="icon"><component :is="Refresh" /></i>重置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-header">
        <span>历史报表列表</span>
        <div class="actions">
          <button 
            class="btn btn-primary" 
            @click="handleCompare" 
            :disabled="selectedReports.length !== 2"
          >
            <i class="icon"><component :is="DocumentCopy" /></i>对比报表
          </button>
        </div>
      </div>

      <table class="data-table" :class="{ 'loading': loading }">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input type="checkbox" @change="handleSelectAll">
            </th>
            <th>报表编号</th>
            <th>报表类型</th>
            <th>生成时间</th>
            <th>创建人</th>
            <th>报表说明</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reportList" :key="item.reportNo">
            <td>
              <input 
                type="checkbox" 
                :checked="isSelected(item)"
                @change="handleSelect(item)"
              >
            </td>
            <td>{{ item.reportNo }}</td>
            <td>
              <span class="tag">{{ getReportTypeLabel(item.type) }}</span>
            </td>
            <td>{{ item.generateTime }}</td>
            <td>{{ item.creator }}</td>
            <td>{{ item.description }}</td>
            <td>
              <button class="btn-link" @click="handleView(item)">
                <i class="icon"><component :is="View" /></i>查看
              </button>
              <button class="btn-link" @click="handleDownload(item)">
                <i class="icon"><component :is="Download" /></i>下载
              </button>
              <button class="btn-link" @click="handleShare(item)">
                <i class="icon"><component :is="Share" /></i>分享
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <span class="total">共 {{ total }} 条</span>
        <select :value="pageSize" @change="(e) => handleSizeChange(Number((e.target as HTMLSelectElement).value))">
          <option :value="10">10 条/页</option>
          <option :value="20">20 条/页</option>
          <option :value="50">50 条/页</option>
          <option :value="100">100 条/页</option>
        </select>
        <div class="page-buttons">
          <button 
            class="btn" 
            :disabled="currentPage === 1"
            @click="handleCurrentChange(currentPage - 1)"
          >
            上一页
          </button>
          <span class="page-number">{{ currentPage }}</span>
          <button 
            class="btn"
            :disabled="currentPage * pageSize >= total"
            @click="handleCurrentChange(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 报表对比对话框 -->
    <div v-if="compareDialogVisible" class="dialog-overlay" @click="compareDialogVisible = false">
      <div class="dialog compare-dialog" @click.stop>
        <div class="dialog-header">
          <span>报表对比</span>
          <button class="close-btn" @click="compareDialogVisible = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="compare-grid">
            <div v-for="(report, index) in selectedReports" :key="report.reportNo" class="compare-card">
              <div class="compare-header">
                <span>{{ `报表${index + 1}: ${report.reportNo}` }}</span>
                <span class="compare-date">{{ report.generateTime }}</span>
              </div>
              <div class="compare-content">
                <dl class="compare-list">
                  <template v-for="(value, key) in report.data" :key="key">
                    <dt>{{ key }}</dt>
                    <dd :class="{ 'highlight-diff': isDifferent(key, index) }">
                      {{ value }}
                    </dd>
                  </template>
                </dl>
              </div>
            </div>
          </div>
        </div>
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
import { 
  Search, 
  Refresh, 
  DocumentCopy, 
  View, 
  Download, 
  Share 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Report {
  reportNo: string
  type: string
  generateTime: string
  creator: string
  description: string
  data: Record<string, any>
  selected?: boolean
}

// 筛选表单
const filterForm = reactive({
  type: '',
  startDate: '',
  endDate: ''
})

// 表格相关
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const selectedReports = ref<Report[]>([])

// 对话框控制
const compareDialogVisible = ref(false)
const shareDialogVisible = ref(false)
const shareLink = ref('https://example.com/report/123456')

// 模拟数据
const reportList = ref<Report[]>([
  {
    reportNo: 'R202403180001',
    type: 'transport',
    generateTime: '2024-03-18 10:00',
    creator: '张三',
    description: '3月份运输报表',
    data: {
      '订单总数': 1580,
      '完成率': '98.5%',
      '准时率': '95.8%',
      '客户满意度': 4.8
    }
  },
  {
    reportNo: 'R202403170001',
    type: 'order',
    generateTime: '2024-03-17 15:30',
    creator: '李四',
    description: '3月份订单报表',
    data: {
      '订单总数': 1520,
      '完成率': '97.5%',
      '准时率': '94.8%',
      '客户满意度': 4.7
    }
  }
])

// 获取报表类型标签
const getReportTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    transport: '运输报表',
    order: '订单报表',
    inventory: '库存报表',
    finance: '财务报表'
  }
  return typeMap[type] || type
}

// 检查对比数据差异
const isDifferent = (key: string, index: number) => {
  if (selectedReports.value.length !== 2) return false
  const otherIndex = index === 0 ? 1 : 0
  return selectedReports.value[index].data[key] !== selectedReports.value[otherIndex].data[key]
}

// 事件处理
const handleSearch = () => {
  // 处理搜索
  console.log('搜索条件:', filterForm)
}

const handleReset = () => {
  filterForm.type = ''
  filterForm.startDate = ''
  filterForm.endDate = ''
}

const handleSelectAll = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  selectedReports.value = checked ? [...reportList.value] : []
}

const handleSelect = (item: Report) => {
  const index = selectedReports.value.indexOf(item)
  if (index > -1) {
    selectedReports.value.splice(index, 1)
  } else {
    selectedReports.value.push(item)
  }
}

const handleCompare = () => {
  compareDialogVisible.value = true
}

const handleView = (row: any) => {
  // 处理查看报表
  console.log('查看报表:', row)
}

const handleDownload = (row: any) => {
  ElMessage.success('报表下载中...')
}

const handleShare = (row: any) => {
  shareDialogVisible.value = true
}

const copyLink = () => {
  navigator.clipboard.writeText(shareLink.value)
  ElMessage.success('链接已复制')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}

const isSelected = (item: any) => {
  return selectedReports.value.includes(item)
}
</script>

<style scoped lang="scss">
.report-history {
  .header-card, .content-card {
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
  }

  .form {
    .form-row {
      display: flex;
      gap: 20px;
      align-items: flex-end;
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

    .checkbox-col {
      width: 40px;
      text-align: center;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;

    .total {
      color: #606266;
      font-size: 14px;
    }

    select {
      height: 32px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 0 8px;
      font-size: 14px;
    }

    .page-buttons {
      display: flex;
      align-items: center;
      gap: 8px;

      .page-number {
        padding: 0 12px;
        color: #606266;
      }
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

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    &:not(:disabled):hover {
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

      &:not(:disabled):hover {
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
    display: inline-flex;
    align-items: center;
    font-size: 14px;

    &:hover {
      color: #66b1ff;
    }

    .icon {
      margin-right: 4px;
    }
  }

  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    background: #f0f2f5;
    color: #606266;
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

    &.compare-dialog {
      width: 80%;
    }
    
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
    }

    .dialog-footer {
      padding: 20px;
      border-top: 1px solid #ebeef5;
      text-align: right;
    }
  }

  .compare-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .compare-card {
    border: 1px solid #ebeef5;
    border-radius: 4px;

    .compare-header {
      padding: 12px;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .compare-date {
        font-size: 12px;
        color: #909399;
      }
    }

    .compare-content {
      padding: 12px;
    }
  }

  .compare-list {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px;
    margin: 0;

    dt {
      color: #909399;
      font-weight: normal;
    }

    dd {
      margin: 0;
      
      &.highlight-diff {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }

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
</style> 