import request from '@/utils/request'

// 获取待办列表
export function getTodoList(params) {
  return request({
    url: '/todo/list',
    method: 'get',
    params
  })
}

// 创建待办
export function createTodo(data) {
  return request({
    url: '/todo/create',
    method: 'post',
    data
  })
}

// 更新待办
export function updateTodo(id, data) {
  return request({
    url: `/todo/${id}`,
    method: 'put',
    data
  })
}

// 删除待办
export function deleteTodo(id) {
  return request({
    url: `/todo/${id}`,
    method: 'delete'
  })
} 