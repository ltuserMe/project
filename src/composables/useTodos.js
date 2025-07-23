import { ref } from "vue";
import { fetchTodos, addTodo, updateTodoStatus, deleteTodo } from "@/api/todo";

export function useTodos() {
  const todos = ref([]);
  const isLoading = ref(false);

  async function loadTodos() {
    isLoading.value = true;
    const res = await fetchTodos();
    if (res.success) {
      todos.value = res.data.map(todo => ({
        id: todo._id,
        text: todo.value,
        completed: todo.isCompleted
      }));
    }
    isLoading.value = false;
  }

  // 其他 add、update、delete 方法可继续补充

  return { todos, isLoading, loadTodos };
} 