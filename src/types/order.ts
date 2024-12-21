// 订单状态类型
export type OrderStatus = 'pending' | 'processing' | 'in_transit' | 'completed' | 'cancelled'

// 订单实体
export interface Order {
  orderId: number
  goodsId: number
  orderNumber: string
  generationDate: string
  finishDate: string | null
  originPlace: string
  destinationPlace: string
  price: number | null
  paymentCompleted: boolean
  deliverStatus: number
}

// 订单创建表单
export interface OrderForm {
  goodsId: number
  originPlace: string
  destinationPlace: string
  price?: number
}

// 订单商品项
export interface OrderItem {
  name: string
  quantity: number
  price: number
}

// 订单查询参数
export interface OrderQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

// 订单派车参数
export interface OrderDispatch {
  vehicleId: string
  driverId: string
} 