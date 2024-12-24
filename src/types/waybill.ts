// 运单实体
export interface Waybill{
    waybillId: number
    routeId: number
    orderNumber: string | null
    vehiclePlateNumber: string | null
    driverName: string | null
    transportStatus: string | null
    createdAt: string | null
    updatedAt: string | null
    startWarehouseName: string
    endWarehouseName: string
    cargoWeight: number | null
}