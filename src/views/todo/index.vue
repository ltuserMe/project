<template>
  <div class="todo-container">
    <!-- 顶部操作栏 -->
    <div class="todo-header">
      <van-search
        v-model="searchText"
        placeholder="搜索待办事项"
        @search="onSearch"
      />
      <van-button type="primary" size="small" @click="showAddDialog = true">
        新建待办
      </van-button>
    </div>

    <!-- 待办列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell
          v-for="item in todoList"
          :key="item.id"
          :title="item.title"
          :label="item.description"
          :class="{ 'todo-item': true, 'todo-item-done': item.status === 'done' }"
          @click="showTodoDetail(item)"
        >
          <template #right-icon>
            <van-icon
              :name="item.status === 'done' ? 'success' : 'circle-o'"
              :class="{ 'todo-status': true, 'todo-status-done': item.status === 'done' }"
              @click.stop="toggleTodoStatus(item)"
            />
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>

    <!-- 新建待办对话框 -->
    <van-dialog
      v-model:show="showAddDialog"
      title="新建待办"
      show-cancel-button
      @confirm="handleAddTodo"
    >
      <van-form>
        <van-field
          v-model="newTodo.title"
          label="标题"
          placeholder="请输入标题"
          :rules="[{ required: true, message: '请输入标题' }]"
        />
        <van-field
          v-model="newTodo.description"
          label="描述"
          type="textarea"
          placeholder="请输入描述"
          rows="3"
        />
        <van-field name="priority" label="优先级">
          <template #input>
            <van-radio-group v-model="newTodo.priority" direction="horizontal">
              <van-radio name="high">高</van-radio>
              <van-radio name="medium">中</van-radio>
              <van-radio name="low">低</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-form>
    </van-dialog>

    <!-- 待办详情弹窗 -->
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="todo-detail">
        <div class="todo-detail-header">
          <h3>{{ currentTodo?.title }}</h3>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        <div class="todo-detail-content">
          <p class="description">{{ currentTodo?.description }}</p>
          <div class="meta-info">
            <span class="priority" :class="currentTodo?.priority">
              优先级：{{ priorityText[currentTodo?.priority] }}
            </span>
            <span class="status">
              状态：{{ statusText[currentTodo?.status] }}
            </span>
          </div>
        </div>
        <div class="todo-detail-footer">
          <van-button type="primary" @click="handleEditTodo">编辑</van-button>
          <van-button type="danger" @click="handleDeleteTodo">删除</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { showToast, showDialog } from 'vant'
import { useStore } from 'vuex'

const store = useStore()
const searchText = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const showAddDialog = ref(false)
const showDetailPopup = ref(false)
const currentTodo = ref(null)

const todoList = ref([])
const newTodo = reactive({
  title: '',
  description: '',
  priority: 'medium'
})

const priorityText = {
  high: '高',
  medium: '中',
  low: '低'
}

const statusText = {
  pending: '待完成',
  done: '已完成'
}

// 加载待办列表
const onLoad = async () => {
  try {
    const { data } = await store.dispatch('todo/getTodoList', {
      page: 1,
      pageSize: 10,
      search: searchText.value
    })
    todoList.value = [...todoList.value, ...data.list]
    finished.value = data.list.length < 10
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  try {
    todoList.value = []
    finished.value = false
    await onLoad()
  } finally {
    refreshing.value = false
  }
}

// 搜索
const onSearch = () => {
  todoList.value = []
  finished.value = false
  onLoad()
}

// 切换待办状态
const toggleTodoStatus = async (todo) => {
  try {
    await store.dispatch('todo/updateTodoStatus', {
      id: todo.id,
      status: todo.status === 'done' ? 'pending' : 'done'
    })
    todo.status = todo.status === 'done' ? 'pending' : 'done'
    showToast('更新成功')
  } catch (error) {
    showToast('更新失败')
  }
}

// 显示待办详情
const showTodoDetail = (todo) => {
  currentTodo.value = todo
  showDetailPopup.value = true
}

// 新建待办
const handleAddTodo = async () => {
  try {
    await store.dispatch('todo/createTodo', newTodo)
    showToast('创建成功')
    showAddDialog.value = false
    onRefresh()
  } catch (error) {
    showToast('创建失败')
  }
}

// 编辑待办
const handleEditTodo = () => {
  // TODO: 实现编辑功能
  showDetailPopup.value = false
}

// 删除待办
const handleDeleteTodo = async () => {
  try {
    await showDialog({
      title: '确认删除',
      message: '确定要删除这个待办事项吗？'
    })
    
    await store.dispatch('todo/deleteTodo', currentTodo.value.id)
    showToast('删除成功')
    showDetailPopup.value = false
    onRefresh()
  } catch (error) {
    if (error) {
      showToast('删除失败')
    }
  }
}
</script>

<style scoped>
.todo-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.todo-header {
  padding: 10px;
  background-color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.todo-item {
  margin-bottom: 8px;
  background-color: #fff;
}

.todo-item-done {
  opacity: 0.6;
}

.todo-status {
  font-size: 20px;
  color: #969799;
}

.todo-status-done {
  color: #07c160;
}

.todo-detail {
  padding: 20px;
}

.todo-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.todo-detail-header h3 {
  margin: 0;
  font-size: 18px;
}

.todo-detail-content {
  margin-bottom: 20px;
}

.description {
  color: #666;
  margin-bottom: 15px;
}

.meta-info {
  display: flex;
  gap: 15px;
  color: #999;
  font-size: 14px;
}

.priority {
  padding: 2px 8px;
  border-radius: 4px;
}

.priority.high {
  background-color: #ffebee;
  color: #f44336;
}

.priority.medium {
  background-color: #fff3e0;
  color: #ff9800;
}

.priority.low {
  background-color: #e8f5e9;
  color: #4caf50;
}

.todo-detail-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style> 