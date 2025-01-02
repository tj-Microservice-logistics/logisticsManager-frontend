<template>
  <div class="order-list">
    <el-card class="content-card">
      <div class="card-header">
        <span class="title">订单列表</span>
        <div class="header-buttons">
          <el-button type="primary" @click="dialogVisible = true">创建新订单</el-button>
          <el-button type="success" @click="showPaymentDialog">手动完成支付</el-button>
        </div>
      </div>
      
      <!-- 创建订单对话框 -->
      <el-dialog v-model="dialogVisible" title="创建新订单" width="50%">
        <el-form :model="orderForm" label-width="120px">
          <el-form-item label="起始地" required>
            <el-select 
              v-model="orderForm.originPlace" 
              placeholder="请选择起始地"
              @change="handleOriginPlaceChange"
            >
              <el-option
                v-for="place in warehousePlaces"
                :key="place.value"
                :label="place.label"
                :value="place.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="目的地" required>
            <el-select 
              v-model="orderForm.destinationPlace" 
              placeholder="请选择目的地"
              @change="handleDestinationPlaceChange"
            >
              <el-option
                v-for="place in availableDestinations"
                :key="place.value"
                :label="place.label"
                :value="place.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="orderForm.goodsName" />
          </el-form-item>
          <el-form-item label="商品类型">
            <el-input v-model="orderForm.goodsType" />
          </el-form-item>
          <el-form-item label="重量(kg)">
            <el-input-number 
              v-model="orderForm.goodsWeight" 
              :min="0"
              :precision="2"
              :step="0.1"
              :controls="false"
            />
          </el-form-item>
          <el-form-item label="长度(cm)">
            <el-input-number 
              v-model="orderForm.goodsLength" 
              :min="0"
              :precision="2"
              :step="0.1"
              :controls="false"
            />
          </el-form-item>
          <el-form-item label="宽度(cm)">
            <el-input-number 
              v-model="orderForm.goodsWidth" 
              :min="0"
              :precision="2"
              :step="0.1"
              :controls="false"
            />
          </el-form-item>
          <el-form-item label="高度(cm)">
            <el-input-number 
              v-model="orderForm.goodsHeight" 
              :min="0"
              :precision="2"
              :step="0.1"
              :controls="false"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="createOrder">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 支付订单对话框 -->
      <el-dialog v-model="paymentDialogVisible" title="选择需要支付的订单" width="70%">
        <el-table 
          :data="unpaidOrders" 
          border 
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="orderNumber" label="订单号" />
          <el-table-column prop="generationDate" label="创建时间" />
          <el-table-column prop="price" label="价格" />
          <el-table-column prop="goods.goodsName" label="商品名称" />
        </el-table>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="paymentDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handlePayment">确认支付</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 原有的表格部分 -->
      <el-table :data="orderList" border v-loading="loading">
        <el-table-column prop="orderNumber" label="订单号" sortable />
        <el-table-column prop="generationDate" label="创建时间" sortable />
        <el-table-column prop="finishDate" label="完成时间" sortable />
        <el-table-column prop="originPlace" label="起始地" 
          :filters="originPlaceFilters"
          :filter-method="filterOriginPlace"
        />
        <el-table-column prop="destinationPlace" label="目的地"
          :filters="destinationPlaceFilters"
          :filter-method="filterDestinationPlace"
        />
        <el-table-column prop="price" label="价格" sortable />
        <el-table-column prop="goods.goodsName" label="商品名称" />
        <el-table-column prop="goods.goodsType" label="商品类型"
          :filters="goodsTypeFilters"
          :filter-method="filterGoodsType"
        />
        <el-table-column prop="goods.goodsWeight" label="重量(kg)" sortable />
        <el-table-column prop="goods.goodsLength" label="长度(cm)" sortable />
        <el-table-column prop="goods.goodsWidth" label="宽度(cm)" sortable />
        <el-table-column prop="goods.goodsHeight" label="高度(cm)" sortable />
        <el-table-column label="路径追踪">
          <template #default="{ row }">
            <el-button type="text" @click="openRouteDialog(row.orderNumber)">追踪</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="paymentCompleted" label="支付状态"
          :filters="[
            { text: '已支付', value: true },
            { text: '未支付', value: false }
          ]"
          :filter-method="filterPaymentStatus"
        >
          <template #default="{ row }">
            <el-tag :type="row.paymentCompleted ? 'success' : 'warning'">
              {{ row.paymentCompleted ? '已支付' : '未支付' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deliverStatus" label="订单状态"
          :filters="[
            { text: '待发货', value: 0 },
            { text: '运输中', value: 1 },
            { text: '已完成', value: 2 },
            { text: '已取消', value: 3 }
          ]"
          :filter-method="filterDeliverStatus"
        >
          <template #default="{ row }">
            <el-tag :type="getDeliverStatusType(row.deliverStatus)">
              {{ getDeliverStatusLabel(row.deliverStatus) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog v-model="routeDialogVisible" title="订单路径追踪" width="70%">
        <div class="route-tracking">
          <div class="tracking-line">
            <div
                v-for="(warehouse, index) in routeWarehouses"
                :key="warehouse.warehouseId"
                class="tracking-point-wrapper"
                :style="{ left: `${index * (100 / (routeWarehouses.length - 1))}%` }"
            >
              <div
                  class="tracking-point"
                  :class="{ 'arrived': warehouse.arrival||(warehouse.sequence==1), 'not-arrived': !warehouse.arrival && (warehouse.sequence!=1) }"
              ></div>
            </div>
          </div>
          <div class="tracking-label-line">
            <div
                v-for="(warehouse, index) in routeWarehouses"
                :key="warehouse.warehouseId"
                class="tracking-label-wrapper"
                :style="{ left: `${index * (100 / 13 / (routeWarehouses.length - 1))}%` }"
            >
              <div class="tracking-label">
                <div class="warehouse-en">{{ warehouse.warehouseName }}</div>
                <div class="warehouse-cn">{{ getWarehouseChineseName(warehouse.warehouseName) }}</div>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="routeDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { orderAPI } from '@/api/order'
import type { Order } from '@/types/order'
import { getRouteWarehouses } from "@/api/routeWarehouses"
import {getWarehouse} from "@/api/warehouses";

const loading = ref(false)
const orderList = ref<Order[]>([])
const dialogVisible = ref(false)
const orderForm = ref({
  originPlace: '',
  destinationPlace: '',
  paymentCompleted: false,
  goodsName: '',
  goodsType: '',
  goodsWeight: undefined,
  goodsLength: undefined,
  goodsWidth: undefined,
  goodsHeight: undefined
})
const routeDialogVisible = ref(false); // 控制路径追踪弹窗
const routeWarehouses = ref<any[]>([]); // 存储路径数据

// 打开路径追踪对话框并获取路径数据
const warehouseMapping = [
  { label: "上海分拣中心", value: "Shanghai" },
  { label: "合肥分拣中心", value: "Hefei" },
  { label: "杭州分拣中心", value: "Hangzhou" },
  { label: "南京分拣中心", value: "Nanjing" },
  { label: "南昌分拣中心", value: "Nanchang" }
];

const getWarehouseChineseName = (englishName) => {
  const mapping = warehouseMapping.find((item) => item.value === englishName);
  return mapping ? mapping.label : '未知仓库';
};
const openRouteDialog = async (orderNumber: string) => {
  try {
    // 获取所有仓库的基本信息
    const response = await getRouteWarehouses(orderNumber);
    routeWarehouses.value = response;

    // 使用 Promise.all 获取每个仓库的详细信息
    const detailedWarehouses = await Promise.all(
        response.map(async (warehouse: { warehouseId: string }) => {
          try {
            const warehouseDetails = await getWarehouse(warehouse.warehouseId);
            return {
              ...warehouse,
              warehouseName: warehouseDetails.warehouseName, // 假设返回数据中包含 name 属性
            };
          } catch (error) {
            console.error(`获取仓库 ${warehouse.warehouseId} 信息失败`, error);
            return {
              ...warehouse,
              warehouseName: '未知', // 处理异常情况
            };
          }
        })
    );

    // 更新展示数据
    routeWarehouses.value = detailedWarehouses;
    routeDialogVisible.value = true;
    console.log(detailedWarehouses);
  } catch (error) {
    ElMessage.error('请求路径信息失败');
    console.error(error);
  }
};


const paymentDialogVisible = ref(false)
const selectedOrders = ref<any[]>([])

// 计算未支付的订单
const unpaidOrders = computed(() => {
  return (orderList.value || []).filter(order => !order.paymentCompleted)
})

const getDeliverStatusType = (status: number) => {
  const statusMap: Record<number, string> = {
    1: 'warning',
    2: 'success',
    3: 'info',
    4: 'danger'
  }
  return statusMap[status] || ''
}

const getDeliverStatusLabel = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待发货',
    1: '运输中',
    2: '已完成',
    3: '已取消'
  }
  return statusMap[status] || '未知状态'
}

const loadOrders = async () => {
  try {
    loading.value = true
    const response = await orderAPI.getOrderList({})
    console.log('订单数据:', response)
    orderList.value = Array.isArray(response) ? response : []
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

const createOrder = async () => {
  try {
    await orderAPI.createOrder(orderForm.value)
    ElMessage.success('订单创建成功')
    dialogVisible.value = false
    await loadOrders() // 刷新列表
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('创建订单失败')
  }
}

// 显示支付对话框
const showPaymentDialog = () => {
  if (unpaidOrders.value.length === 0) {
    ElMessage.info('没有未支付的订单')
    return
  }
  paymentDialogVisible.value = true
}

// 处理表格选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedOrders.value = selection
}

// 处理支付
const handlePayment = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请选择要支付的订单')
    return
  }

  try {
    for (const order of selectedOrders.value) {
      await orderAPI.updatePaymentCompleted(order.orderId)
    }
    ElMessage.success('支付成功')
    paymentDialogVisible.value = false
    await loadOrders() // 刷新列表
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.error('支付失败')
  }
}

// 筛选方法
const filterOriginPlace = (value: string, row: any) => {
  return row.originPlace === value
}

const filterDestinationPlace = (value: string, row: any) => {
  return row.destinationPlace === value
}

const filterGoodsType = (value: string, row: any) => {
  return row.goods?.goodsType === value
}

const filterPaymentStatus = (value: boolean, row: any) => {
  return row.paymentCompleted === value
}

const filterDeliverStatus = (value: number, row: any) => {
  return row.deliverStatus === value
}

// 计算筛选选项
const originPlaceFilters = computed(() => {
  const places = new Set(orderList.value.map(order => order.originPlace))
  return Array.from(places).map(place => ({ text: place, value: place }))
})

const destinationPlaceFilters = computed(() => {
  const places = new Set(orderList.value.map(order => order.destinationPlace))
  return Array.from(places).map(place => ({ text: place, value: place }))
})

const goodsTypeFilters = computed(() => {
  const types = new Set(orderList.value.map(order => order.goods?.goodsType).filter(Boolean))
  return Array.from(types).map(type => ({ text: type, value: type }))
})

// 添加仓库地址选项
const warehousePlaces = [
  { value: 'Hefei', label: '合肥' },
  { value: 'Nanjing', label: '南京' },
  { value: 'Shanghai', label: '上海' },
  { value: 'Hangzhou', label: '杭州' },
  { value: 'Nanchang', label: '南昌' }
]

// 添加可选目的地的响应式引用
const availableDestinations = ref(warehousePlaces)

// 处理起始地变化
const handleOriginPlaceChange = (value: string) => {
  // 重置目的地
  if (orderForm.value.destinationPlace === value) {
    orderForm.value.destinationPlace = ''
  }
  // 更新可选目的地列表
  availableDestinations.value = warehousePlaces.filter(place => place.value !== value)
}

// 处理目的地变化
const handleDestinationPlaceChange = (value: string) => {
  if (value === orderForm.value.originPlace) {
    ElMessage.warning('目的地不能与起始地相同')
    orderForm.value.destinationPlace = ''
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
.order-list {
  .content-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .header-buttons {
        display: flex;
        gap: 10px;
      }
    }
  }
}
.warehouse-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.warehouse-tag {
  font-size: 14px;
  padding: 5px;
  border-radius: 20px;
}
.route-tracking {
  display: flex;
  flex-direction: column; /* Stacks lines and labels vertically */
  align-items: center;
  position: relative;
  width: 100%;
  height: 150px; /* Adjusted height to fit lines and labels */
}

.tracking-line {
  position: relative;
  width: 85%;
  height: 12px; /* Line thickness */
  background-color: #f0f0f0;
  margin-bottom: 20px; /* Space between line and labels */
}

.tracking-point-wrapper {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

.tracking-point {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #ccc;
  background-color: #fff;
}

.tracking-point.arrived {
  background-color: #67c23a;
  border-color: #67c23a;
}

.tracking-point.not-arrived {
  background-color: #dcdfe6;
  border-color: #dcdfe6;
}

.tracking-label-line {
  position: relative;
  width: 85%;
  height: 12px;
  display: flex;
  margin-bottom: 20px;
  justify-content: space-between;
}

.tracking-label-wrapper {
  position: relative;
  text-align: center;
  transform: translateX(-50%);
}

.tracking-label {
  text-align: center;
}

.warehouse-en {
  font-size: 14px;
  font-weight: bold;
}

.warehouse-cn {
  font-size: 12px;
  color: #606266;
}
</style> 