import request from "./request";

export function fetchTodos() {
  return request.get("/api/get-todo");
}

export function addTodo(data) {
  return request.post("/api/add-todo", data);
}

export function updateTodoStatus(id) {
  return request.post(`/api/update-todo/${id}`);
}

export function deleteTodo(id) {
  return request.post(`/api/del-todo/${id}`);
} 