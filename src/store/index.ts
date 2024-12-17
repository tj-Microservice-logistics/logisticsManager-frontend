import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'
import app from './modules/app'
import permission from './modules/permission'
import type { RootState } from './types'

export const key: InjectionKey<Store<RootState>> = Symbol()

export const store = createStore<RootState>({
  modules: {
    app,
    permission
  }
})

// 定义自己的 useStore 组合式函数
export function useStore() {
  return baseUseStore(key)
}

export default store 