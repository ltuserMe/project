import { createStore } from 'vuex'
import user from './modules/user'
import todo from './modules/todo'

export default createStore({
  state: {
    // 全局状态
  },
  getters: {
    // 全局计算属性
  },
  mutations: {
    // 同步修改状态的方法
  },
  actions: {
    // 异步操作
  },
  modules: {
    user,
    todo
  }
}) 