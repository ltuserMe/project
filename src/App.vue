<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import axios from "axios";
import {
  SunIcon,
  MoonIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import LoginPage from "./components/LoginPage.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";

const isDark = useDark();
const toggleDark = useToggle(isDark);
const isLoading = ref(false);
const error = ref(null);

// const BASE_URL = "https://zqdflfawkqxt.sealoshzh.site";
const BASE_URL = "http://47.120.6.86:5000";
// const BASE_URL = 'https://ztdgmvcggyyl.sealoshzh.site'

const todos = ref([]);
const newTodo = ref("");
const currentFilter = ref("all");

const filters = [
  { label: "全部", value: "all" },
  { label: "未完成", value: "active" },
  { label: "已完成", value: "completed" },
];

// 添加消息自动消失的逻辑
let errorTimer = null;
const showError = (message) => {
  error.value = message;
  // 清除之前的定时器
  if (errorTimer) clearTimeout(errorTimer);
  // 设置新的定时器
  errorTimer = setTimeout(() => {
    error.value = null;
  }, 2000);
};

// 添加成功消息提示逻辑
let successTimer = null;
const success = ref(null);

const showSuccess = (message) => {
  success.value = message;
  // 清除之前的定时器
  if (successTimer) clearTimeout(successTimer);
  // 设置新的定时器
  successTimer = setTimeout(() => {
    success.value = null;
  }, 2000);
};

// 修改 axios 默认配置
// axios.defaults.baseURL = 'https://zqdflfawkqxt.sealoshzh.site';
axios.defaults.baseURL = "http://47.120.6.86:5000";

axios.defaults.headers.common["Content-Type"] = "application/json";

// 修改 axios 请求拦截器
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 修改 axios 响应拦截器
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token 过期或无效
      logout();
      showError("登录已过期，请重新登录");
    } else if (error.response?.status === 403) {
      showError("没有权限执行此操作");
    }
    return Promise.reject(error);
  }
);

// 获取所有待办事项
async function fetchTodos() {
  try {
    isLoading.value = true;
    const response = await axios.get("/api/get-todo");
    if (response.data.success) {
      todos.value = response.data.data.map((todo) => ({
        id: todo._id,
        text: todo.value,
        completed: todo.isCompleted,
        createdAt: new Date(todo.createdAt), // 添加创建时间
        updatedAt: new Date(todo.updatedAt), // 添加更新时间
      }));
    }
  } catch (err) {
    handleApiError(err, "获取待办事项失败");
  } finally {
    isLoading.value = false;
  }
}

// 添加新的待办事项
async function addTodo() {
  if (!newTodo.value.trim()) return;

  try {
    isLoading.value = true;
    const response = await axios.post("/api/add-todo", {
      value: newTodo.value.trim(),
      isCompleted: false,
    });

    if (response.data.success) {
      const { _id, value, isCompleted, createdAt, updatedAt } =
        response.data.data;
      todos.value.push({
        id: _id,
        text: value,
        completed: isCompleted,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      });
      newTodo.value = "";
      showSuccess("添加成功");
    }
  } catch (err) {
    handleApiError(err, "添加待办事项失败");
  } finally {
    isLoading.value = false;
  }
}

// 更新待办事项状态
async function toggleTodoStatus(todo) {
  try {
    isLoading.value = true;
    const response = await axios.post(`/api/update-todo/${todo.id}`);

    if (response.data.success) {
      const { isCompleted, updatedAt } = response.data.data;
      const index = todos.value.findIndex((t) => t.id === todo.id);
      if (index !== -1) {
        todos.value[index].completed = isCompleted;
        todos.value[index].updatedAt = new Date(updatedAt);
      }
    }
  } catch (err) {
    handleApiError(err, "更新待办事项失败");
    todo.completed = !todo.completed; // 回滚状态
  } finally {
    isLoading.value = false;
  }
}

// 删除待办事项
async function deleteTodo(id) {
  try {
    isLoading.value = true;
    const response = await axios.post(`${BASE_URL}/api/del-todo/${id}`);

    if (response.data.success) {
      todos.value = todos.value.filter((todo) => todo.id !== id);
      showSuccess("删除成功");
    } else {
      throw new Error(response.data.error);
    }
  } catch (err) {
    showError(
      "删除待办事项失败：" +
        (err.response?.data?.error || err.message || "未知错误")
    );
  } finally {
    isLoading.value = false;
  }
}

const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case "active":
      return todos.value.filter((todo) => !todo.completed);
    case "completed":
      return todos.value.filter((todo) => todo.completed);
    default:
      return todos.value;
  }
});

const completedCount = computed(() => {
  return todos.value.filter((todo) => todo.completed).length;
});

const completionRate = computed(() => {
  if (todos.value.length === 0) return 0;
  return Math.round((completedCount.value / todos.value.length) * 100);
});

// 修改页面加载时的初始化逻辑
onMounted(async () => {
  // 检查是否有token
  const token = localStorage.getItem("token");
  if (token) {
    isLoggedIn.value = true;
    phone.value = localStorage.getItem("phone");
    try {
      // 先获取用户信息
      await fetchUserInfo();
      // 再获取待办事项
      await fetchTodos();
    } catch (err) {
      // 如果获取失败（比如token过期），则退出登录
      if (err.response?.status === 401) {
        logout();
        showError("登录已过期，请重新登录");
      }
    }
  }
});

const isLoggedIn = ref(!!localStorage.getItem("token"));
const phone = ref(localStorage.getItem("phone") || "");

// 添加用户信息相关的状态
const showUserProfile = ref(false);
const userInfo = ref({
  name: "",
  avatar: "",
  originalAvatar: "",
});
const avatarInput = ref(null);

// 上传头像
const uploadAvatar = () => {
  // 确保 input 元素已经挂载
  if (avatarInput.value) {
    avatarInput.value.click();
  }
};

const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith("image/")) {
    showError("只能上传图片文件");
    return;
  }

  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    showError("图片大小不能超过5MB");
    return;
  }

  const localPreview = URL.createObjectURL(file);
  userInfo.value.avatar = localPreview;

  try {
    isLoading.value = true;
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axios.post("/api/user/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      userInfo.value.avatar = response.data.data.avatar;
      showSuccess("头像上传成功");
      await saveUserInfo();
    }
  } catch (err) {
    handleApiError(err, "头像上传失败");
    userInfo.value.avatar = userInfo.value.originalAvatar;
  } finally {
    isLoading.value = false;
    URL.revokeObjectURL(localPreview);
    if (avatarInput.value) {
      avatarInput.value.value = "";
    }
  }
};

// 保存用户信息
const saveUserInfo = async () => {
  try {
    isLoading.value = true;
    const response = await axios.post("/api/user/update", {
      nickname: userInfo.value.nickname,
      avatar: userInfo.value.avatar,
    });

    if (response.data.success) {
      userInfo.value.originalAvatar = userInfo.value.avatar;
      showSuccess("保存成功");
      showUserProfile.value = false;
    }
  } catch (err) {
    handleApiError(err, "保存失败");
    userInfo.value.avatar = userInfo.value.originalAvatar;
  } finally {
    isLoading.value = false;
  }
};

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await axios.get("/api/user/info");
    if (response.data.success) {
      const { nickname, avatar, createdAt } = response.data.data;
      userInfo.value = {
        nickname,
        avatar,
        originalAvatar: avatar,
        createdAt: new Date(createdAt),
      };
    }
  } catch (err) {
    handleApiError(err, "获取用户信息失败");
    throw err;
  }
};

// 修改登录成功处理函数的顺序
const handleLoginSuccess = async () => {
  isLoggedIn.value = true;
  phone.value = localStorage.getItem("phone");
  try {
    // 先获取用户信息
    await fetchUserInfo();
    // 再获取待办事项
    await fetchTodos();
  } catch (err) {
    showError("获取用户信息失败");
  }
};

// 修改登出函数，清除用户信息
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("phone");
  isLoggedIn.value = false;
  todos.value = [];
  // 清除用户信息
  userInfo.value = {
    nickname: "",
    avatar: "",
    originalAvatar: "",
  };
};

// 格式化手机号
const formatPhone = (phone) => {
  if (!phone) return "";
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
};

// 添加确认弹窗状态
const showConfirmDialog = ref(false);

// 修改退出登录逻辑
const confirmLogout = () => {
  showConfirmDialog.value = true;
};

const handleLogout = () => {
  logout();
  showConfirmDialog.value = false;
};

// 添加列表动画效果
const onBeforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = "translateY(30px)";
};

const onEnter = (el, done) => {
  const delay = el.dataset.index * 100;
  setTimeout(() => {
    el.style.transition = "all 0.3s ease";
    el.style.opacity = 1;
    el.style.transform = "translateY(0)";
    done();
  }, delay);
};

const onLeave = (el, done) => {
  const delay = el.dataset.index * 50;
  setTimeout(() => {
    el.style.transition = "all 0.2s ease";
    el.style.opacity = 0;
    el.style.transform = "translateY(-30px)";
    done();
  }, delay);
};

// 监听列表变化，自动滚动到新添加的项
watch(
  todos,
  (newTodos, oldTodos) => {
    if (newTodos.length > oldTodos.length) {
      // 新增项时，等待动画完成后滚动到底部
      nextTick(() => {
        setTimeout(() => {
          const container = document.querySelector(".overflow-y-auto");
          if (container) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 100);
      });
    }
  },
  { deep: true }
);

// 统一的错误处理函数
function handleApiError(err, defaultMessage) {
  const errorMessage = err.response?.data?.error || err.message || "未知错误";
  showError(`${defaultMessage}：${errorMessage}`);
}
</script>

<template>
  <router-view />
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 更新淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}

.fade-move {
  transition: transform 0.3s ease;
}

/* 添加过渡动画样式 */
.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

.animate-slide-down {
  animation: slideDown 0.5s ease-out forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-30px);
    opacity: 0;
  }
}

/* 添加移动端滚动条样式 */
@media (max-width: 640px) {
  .container {
    @apply px-3;
  }

  .btn {
    @apply py-2 px-3;
  }

  .input-primary {
    @apply py-2;
  }
}

/* 优化消息提示动画 */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* 优化滚动条样式 */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.2);
}

/* 优化列表动画 */
.list-move {
  transition: transform 0.5s ease;
}

.list-enter-active {
  transition: all 0.3s ease-out;
}

.list-leave-active {
  transition: all 0.2s ease-in;
  position: absolute;
  width: 100%;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
