export interface Order {
  id: string
  orderNo: string
  customerName: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createTime: string
  // 其他订单字段...
} 