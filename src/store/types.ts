import { RouteRecordRaw } from 'vue-router'

export interface AppState {
  sidebar: {
    isCollapse: boolean
  }
}

export interface PermissionState {
  routes: RouteRecordRaw[]
}

export interface RootState {
  app: AppState
  permission: PermissionState
} 