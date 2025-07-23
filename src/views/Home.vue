<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import {
  SunIcon,
  MoonIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { useTodos } from "@/composables/useTodos";
import { useUser } from "@/composables/useUser";

const isDark = useDark();
const toggleDark = useToggle(isDark);
const isLoading = ref(false);
const error = ref(null);
const success = ref(null);

const { todos, loadTodos, addTodo, toggleTodoStatus, deleteTodo } = useTodos();
const { userInfo, loadUserInfo, saveUserInfo, uploadAvatar: uploadAvatarApi } = useUser();

const newTodo = ref("");
const currentFilter = ref("all");
const filters = [
  { label: "全部", value: "all" },
  { label: "未完成", value: "active" },
  { label: "已完成", value: "completed" },
];

let errorTimer = null;
const showError = (message) => {
  error.value = message;
  if (errorTimer) clearTimeout(errorTimer);
  errorTimer = setTimeout(() => {
    error.value = null;
  }, 2000);
};

let successTimer = null;
const showSuccess = (message) => {
  success.value = message;
  if (successTimer) clearTimeout(successTimer);
  successTimer = setTimeout(() => {
    success.value = null;
  }, 2000);
};

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

const isLoggedIn = ref(!!localStorage.getItem("token"));
const phone = ref(localStorage.getItem("phone") || "");
const showUserProfile = ref(false);
const avatarInput = ref(null);
const uploadAvatar = () => {
  nextTick(() => {
    if (avatarInput.value) {
      avatarInput.value.click();
    } else {
      console.warn('avatarInput is null');
    }
  });
};
const showConfirmDialog = ref(false);

const formatPhone = (phone) => {
  if (!phone) return "";
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
};

const confirmLogout = () => {
  showConfirmDialog.value = true;
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("phone");
  isLoggedIn.value = false;
  todos.value = [];
  userInfo.value = {
    nickname: "",
    avatar: "",
    originalAvatar: "",
  };
  showConfirmDialog.value = false;
};

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

watch(
  todos,
  (newTodos, oldTodos) => {
    if (newTodos.length > oldTodos.length) {
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

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    // 未登录自动跳转到登录页
    window.location.href = "/login";
    return;
  }
  phone.value = localStorage.getItem("phone");
  try {
    await loadUserInfo();
    await loadTodos();
  } catch (err) {
    handleLogout();
    showError("登录已过期，请重新登录");
  }
});

function handleApiError(err, defaultMessage) {
  const errorMessage = err.response?.data?.error || err.message || "未知错误";
  showError(`${defaultMessage}：${errorMessage}`);
}

const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showError("只能上传图片文件");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showError("图片大小不能超过5MB");
    return;
  }
  const localPreview = URL.createObjectURL(file);
  userInfo.value.avatar = localPreview;
  try {
    isLoading.value = true;
    await uploadAvatarApi(file);
    showSuccess("头像上传成功");
    await loadUserInfo(); // 上传后刷新用户信息
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
</script>

<template>
  <div class="min-h-screen">
    <div
      :class="[
        'min-h-screen transition-colors duration-500 bg-gradient-to-br',
        isDark
          ? 'dark from-gray-900 via-gray-800 to-gray-900 text-text-dark'
          : 'from-blue-50 via-indigo-50 to-blue-50 text-text-light',
      ]"
    >
      <div class="h-screen flex flex-col">
        <!-- 固定头部区域 -->
        <div class="flex-shrink-0">
          <div class="container mx-auto px-4 py-6 max-w-3xl">
            <!-- 头部内容 -->
            <header class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-3 min-w-0">
                <button
                  @click="showUserProfile = true"
                  class="relative group flex-shrink-0"
                >
                  <div class="relative group">
                    <img
                      :src="userInfo.avatar || '/default-avatar.png'"
                      class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md group-hover:shadow-lg transition-all duration-200"
                      :alt="userInfo.nickname || formatPhone(phone)"
                    />
                   
                    <div
                      class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors duration-200"
                    ></div>
                  </div>
                </button>

                <div class="min-w-0">
                  <h1
                    class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent truncate"
                  >
                    您的待办事项
                  </h1>
                  <button
                    @click="showUserProfile = true"
                    class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span class="truncate max-w-[120px] sm:max-w-[200px]">
                      {{ userInfo.nickname || formatPhone(phone) }}
                    </span>
                    <svg
                      class="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-2 sm:gap-3">
                <button
                  @click="confirmLogout"
                  class="p-2 sm:px-3 sm:py-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200"
                >
                  <span class="flex items-center gap-1">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span class="hidden sm:inline">退出</span>
                  </span>
                </button>

                <button
                  @click="toggleDark()"
                  class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hover-lift"
                >
                  <sun-icon v-if="isDark" class="w-5 h-5" />
                  <moon-icon v-else class="w-5 h-5" />
                </button>
              </div>
            </header>

            <!-- 待办事项输入框 -->
            <div class="mb-8">
              <div class="flex gap-2">
                <input
                  v-model="newTodo"
                  @keyup.enter="addTodo"
                  type="text"
                  placeholder="添加新的待办事项..."
                  class="input-primary"
                />
                <button @click="addTodo" class="btn-primary hover-lift">
                  <plus-icon class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="mb-6">
              <div class="glass-effect rounded-xl p-4 shadow-soft">
                <div class="flex items-center justify-between mb-2">
                  <span
                    class="text-sm font-medium text-gray-600 dark:text-gray-300"
                  >
                    完成进度
                  </span>
                  <span
                    class="text-sm font-medium"
                    :class="{
                      'text-red-500 dark:text-red-400': completionRate < 30,
                      'text-yellow-500 dark:text-yellow-400':
                        completionRate >= 30 && completionRate < 70,
                      'text-green-500 dark:text-green-400':
                        completionRate >= 70,
                    }"
                  >
                    {{ completionRate }}%
                  </span>
                </div>
                <div
                  class="relative h-2 bg-gray-200/30 dark:bg-gray-700/30 rounded-full overflow-hidden"
                >
                  <div
                    class="absolute inset-y-0 left-0 transition-all duration-500"
                    :class="{
                      'bg-gradient-to-r from-red-500 to-red-400':
                        completionRate < 30,
                      'bg-gradient-to-r from-yellow-500 to-yellow-400':
                        completionRate >= 30 && completionRate < 70,
                      'bg-gradient-to-r from-green-500 to-green-400':
                        completionRate >= 70,
                    }"
                    :style="{ width: `${completionRate}%` }"
                  ></div>
                </div>
                <div class="flex justify-center mt-2">
                  <span
                    class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="{
                        'bg-red-500': completionRate < 30,
                        'bg-yellow-500':
                          completionRate >= 30 && completionRate < 70,
                        'bg-green-500': completionRate >= 70,
                      }"
                    ></span>
                    已完成 {{ completedCount }} / {{ todos.length }} 项
                  </span>
                </div>
              </div>
            </div>

            <!-- 过滤器 -->
            <div
              class="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              <button
                v-for="filter in filters"
                :key="filter.value"
                @click="currentFilter = filter.value"
                :class="[
                  'btn hover-lift whitespace-nowrap flex-shrink-0',
                  currentFilter === filter.value
                    ? 'bg-primary text-white shadow-soft'
                    : 'glass-effect',
                ]"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 可滚动的待办事项列表区域 -->
        <div
          class="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
          style="scroll-behavior: smooth"
        >
          <div class="container mx-auto px-4 pb-6 max-w-3xl">
            <div class="space-y-3">
              <TransitionGroup
                name="list"
                tag="div"
                class="space-y-3"
                @before-enter="onBeforeEnter"
                @enter="onEnter"
                @leave="onLeave"
              >
                <div
                  v-for="(todo, index) in filteredTodos"
                  :key="todo.id"
                  :data-index="index"
                  class="flex items-center gap-3 p-4 glass-effect rounded-xl shadow-soft hover:shadow-lg transition-all duration-200 transform"
                >
                  <input
                    type="checkbox"
                    v-model="todo.completed"
                    @change="toggleTodoStatus(todo)"
                    class="w-5 h-5 rounded-full border-gray-300 text-primary focus:ring-primary/20 transition-all duration-200"
                  />
                  <span
                    :class="[
                      'flex-1 transition-all duration-200',
                      todo.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-700 dark:text-gray-200',
                    ]"
                  >
                    {{ todo.text }}
                  </span>
                  <button
                    @click="deleteTodo(todo.id)"
                    class="text-gray-400 hover:text-red-500 transition-colors hover-lift"
                  >
                    <trash-icon class="w-5 h-5" />
                  </button>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>

      <!-- 移除底部的进度条和统计信息 -->
      <div class="absolute bottom-0 left-0 right-0 px-4 py-6">
        <!-- 错误提示 -->
        <Transition name="fade">
          <div
            v-if="error"
            class="fixed inset-x-0 top-1/2 -translate-y-1/2 mx-auto max-w-md px-4 z-50"
          >
            <div
              class="glass-effect bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl shadow-soft flex items-center justify-center gap-2 border border-red-500/20"
            >
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-sm font-medium">{{ error }}</span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 加载状态 -->
      <div
        v-if="isLoading"
        class="fixed inset-0 bg-black/10 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="glass-effect p-8 rounded-2xl shadow-soft animate-pulse">
          <div
            class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"
          ></div>
        </div>
      </div>

      <!-- 添加个人信息侧边栏 -->
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        leave-active-class="transition-transform duration-200 ease-in"
        enter-from-class="translate-x-full"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="showUserProfile"
          class="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-hidden"
        >
          <div class="h-full flex flex-col">
            <!-- 侧边栏头部 -->
            <div
              class="relative h-48 bg-gradient-to-br from-primary/20 to-primary-light/20"
            >
              <button
                @click="showUserProfile = false"
                class="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <!-- 头像上传区域 -->
              <div class="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div class="relative group">
                  <img
                    :src="userInfo.avatar || '/default-avatar.png'"
                    class="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                    :class="{ 'opacity-50': isLoading }"
                    :alt="userInfo.nickname || formatPhone(phone)"
                  />
                  <button
                    @click="uploadAvatar"
                    class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    :disabled="isLoading"
                  >
                    <div v-if="isLoading" class="animate-spin">
                      <svg
                        class="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                    <svg
                      v-else
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 个人信息表单 -->
            <div class="flex-1 overflow-y-auto p-6 pt-16 space-y-6">
              <div class="space-y-4">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    昵称
                  </label>
                  <input
                    v-model="userInfo.nickname"
                    type="text"
                    placeholder="请输入昵称"
                    class="input-primary"
                  />
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    手机号
                  </label>
                  <input
                    :value="formatPhone(phone)"
                    type="text"
                    disabled
                    class="input-primary opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <!-- 侧边栏底部 -->
            <div class="p-6 border-t dark:border-gray-700">
              <button
                @click="saveUserInfo"
                class="w-full btn-primary py-3 hover-lift"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 添加遮罩层 -->
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        leave-active-class="transition-opacity duration-200 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showUserProfile"
          class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
          @click="showUserProfile = false"
        ></div>
      </Transition>

      <!-- 添加文件上传 input -->
      <input
        type="file"
        ref="avatarInput"
        class="hidden"
        accept="image/*"
        @change="handleAvatarChange"
      />

      <!-- 添加确认弹窗 -->
      <ConfirmDialog
        v-model="showConfirmDialog"
        title="退出登录"
        message="确定要退出登录吗？"
        confirm-text="退出"
        cancel-text="取消"
        @confirm="handleLogout"
      />

      <!-- 修改消息提示组件 -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        leave-active-class="transition duration-200 ease-in"
        enter-from-class="opacity-0 transform translate-y-2"
        leave-to-class="opacity-0 transform translate-y-2"
      >
        <div
          v-if="error || success"
          class="fixed inset-x-0 top-4 flex justify-center items-center z-50 px-4"
        >
          <div
            class="glass-effect px-6 py-3 rounded-xl shadow-soft max-w-md w-full flex items-center gap-2"
            :class="{
              'bg-red-500/90 text-white': error,
              'bg-green-500/90 text-white': success,
            }"
          >
            <!-- 错误图标 -->
            <svg
              v-if="error"
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <!-- 成功图标 -->
            <svg
              v-if="success"
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <span class="text-sm font-medium">{{ error || success }}</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
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
