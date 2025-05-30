import { getTodoList, createTodo, updateTodo, deleteTodo } from '@/api/todo'

const state = {
  todoList: [],
  total: 0
}

const mutations = {
  SET_TODO_LIST(state, { list, total }) {
    state.todoList = list
    state.total = total
  }
}

const actions = {
  // 获取待办列表
  async getTodoList({ commit }, { page, pageSize, search }) {
    try {
      const { data } = await getTodoList({ page, pageSize, search })
      commit('SET_TODO_LIST', {
        list: data.list,
        total: data.total
      })
      return data
    } catch (error) {
      throw error
    }
  },

  // 创建待办
  async createTodo({ dispatch }, todoData) {
    try {
      await createTodo(todoData)
      return true
    } catch (error) {
      throw error
    }
  },

  // 更新待办状态
  async updateTodoStatus({ dispatch }, { id, status }) {
    try {
      await updateTodo(id, { status })
      return true
    } catch (error) {
      throw error
    }
  },

  // 更新待办
  async updateTodo({ dispatch }, { id, data }) {
    try {
      await updateTodo(id, data)
      return true
    } catch (error) {
      throw error
    }
  },

  // 删除待办
  async deleteTodo({ dispatch }, id) {
    try {
      await deleteTodo(id)
      return true
    } catch (error) {
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 