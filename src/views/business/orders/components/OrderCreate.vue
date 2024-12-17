<template>
  <div class="order-create">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="客户名称" prop="customerName">
        <el-input v-model="formData.customerName" placeholder="请输入客户名称" />
      </el-form-item>
      
      <el-form-item label="收货人信息" required>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="receiverName">
              <el-input v-model="formData.receiverName" placeholder="收货人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="receiverPhone">
              <el-input v-model="formData.receiverPhone" placeholder="收货人电话" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="收货地址" required>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item prop="province">
              <el-select v-model="formData.province" placeholder="省份" @change="handleProvinceChange">
                <el-option v-for="item in provinceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="city">
              <el-select v-model="formData.city" placeholder="城市">
                <el-option v-for="item in cityOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="district">
              <el-select v-model="formData.district" placeholder="区县">
                <el-option v-for="item in districtOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item prop="address">
          <el-input v-model="formData.address" placeholder="详细地址" />
        </el-form-item>
      </el-form-item>

      <el-form-item label="商品信息">
        <div v-for="(item, index) in formData.items" :key="index" class="item-row">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item :prop="`items.${index}.name`" :rules="rules.itemName">
                <el-input v-model="item.name" placeholder="商品名称" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :prop="`items.${index}.quantity`" :rules="rules.itemQuantity">
                <el-input-number v-model="item.quantity" :min="1" placeholder="数量" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :prop="`items.${index}.price`" :rules="rules.itemPrice">
                <el-input-number v-model="item.price" :min="0" :precision="2" placeholder="单价" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-button type="danger" icon="Delete" @click="removeItem(index)" v-if="formData.items.length > 1">
                删除
              </el-button>
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" plain icon="Plus" @click="addItem">添加商品</el-button>
      </el-form-item>

      <el-form-item label="备注">
        <el-input v-model="formData.remark" type="textarea" rows="3" placeholder="请输入备注信息" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">生成订单</el-button>
        <el-button @click="resetForm(formRef)">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

const formRef = ref<FormInstance>()

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface OrderForm {
  customerName: string
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  address: string
  items: OrderItem[]
  remark: string
}

const formData = reactive<OrderForm>({
  customerName: '',
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  items: [{ name: '', quantity: 1, price: 0 }],
  remark: ''
})

const rules = reactive<FormRules>({
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  receiverName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  receiverPhone: [
    { required: true, message: '请输入收货人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请选择省份', trigger: 'change' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  district: [{ required: true, message: '请选择区县', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  itemName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  itemQuantity: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
  itemPrice: [{ required: true, message: '请输入商品单价', trigger: 'blur' }]
})

// 模拟地址数据
const provinceOptions = [
  { label: '广东省', value: 'guangdong' },
  { label: '浙江省', value: 'zhejiang' }
]

const cityOptions = ref([
  { label: '广州市', value: 'guangzhou' },
  { label: '深圳市', value: 'shenzhen' }
])

const districtOptions = ref([
  { label: '天河区', value: 'tianhe' },
  { label: '越秀区', value: 'yuexiu' }
])

const handleProvinceChange = (val: string) => {
  // 这里应该根据选择的省份获取对应的城市列表
  console.log('省份变更:', val)
}

const addItem = () => {
  formData.items.push({ name: '', quantity: 1, price: 0 })
}

const removeItem = (index: number) => {
  formData.items.splice(index, 1)
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      try {
        // 这里调用创建订单的 API
        // const { data } = await createOrder(formData)
        ElMessage.success('订单创建成功')
        // 关闭对话框
        emit('success')
      } catch (error) {
        console.error('创建订单失败:', error)
        ElMessage.error('创建订单失败')
      }
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  formData.items = [{ name: '', quantity: 1, price: 0 }]
}

const emit = defineEmits<{
  (e: 'success'): void
}>()
</script>

<style scoped lang="scss">
.order-create {
  padding: 20px;

  .item-row {
    margin-bottom: 20px;
    padding: 10px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;

    &:last-child {
      margin-bottom: 10px;
    }
  }
}
</style> 