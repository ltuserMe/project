<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
    <div class="w-full max-w-md animate-fade-in">
      <!-- 登录卡片 -->
      <div class="glass-effect rounded-3xl p-8 shadow-soft border border-white/20 dark:border-gray-700/30 animate-slide-in">
        <!-- Logo 和标题 -->
        <div class="text-center mb-8">
          <div class="inline-block p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-light/10 mb-4">
            <svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            您的待办事项
          </h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            请使用手机号登录您的待办事项
          </p>
        </div>
        
        <div class="space-y-6">
          <!-- 手机号输入 -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              手机号
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                v-model="phone"
                type="tel"
                maxlength="11"
                placeholder="请输入手机号"
                class="input-primary pl-10"
                :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/20': phoneError }"
              >
            </div>
            <p v-if="phoneError" class="mt-1 text-xs text-red-500 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ phoneError }}
            </p>
          </div>

          <!-- 验证码输入 -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              验证码
            </label>
            <div class="flex gap-3">
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  v-model="code"
                  type="text"
                  maxlength="6"
                  placeholder="请输入验证码"
                  class="input-primary pl-10"
                  :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/20': codeError }"
                >
              </div>
              <button 
                @click="sendCode"
                :disabled="countdown > 0"
                class="btn-primary whitespace-nowrap min-w-[120px] hover-lift"
                :class="{ 'opacity-50 cursor-not-allowed': countdown > 0 }"
              >
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </button>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              提示：暂不支持发送手机短信，验证码将直接显示在输入框中
            </p>
            <p v-if="codeError" class="mt-1 text-xs text-red-500 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ codeError }}
            </p>
          </div>

          <!-- 登录按钮 -->
          <button 
            @click="login"
            class="w-full btn-primary py-3 text-lg font-medium hover-lift"
          >
            登录
          </button>

          <!-- 底部提示 -->
          <p class="text-center text-xs text-gray-500 dark:text-gray-400">
            登录即表示您同意
            <a href="#" class="text-primary hover:text-primary-dark">服务条款</a>
            和
            <a href="#" class="text-primary hover:text-primary-dark">隐私政策</a>
          </p>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <Transition 
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="error" 
        class="fixed inset-0 flex items-center justify-center px-4 z-50"
      >
        <div 
          class="glass-effect bg-gray-900/80 dark:bg-gray-800/80 
                 text-white px-6 py-4 rounded-xl max-w-md w-full
                 shadow-soft flex items-center justify-center gap-2
                 backdrop-blur-sm"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium">{{ error }}</span>
        </div>
      </div>
    </Transition>

    <!-- 加载状态 -->
    <div v-if="isLoading" 
         class="fixed inset-0 bg-black/10 dark:bg-white/10 
                backdrop-blur-sm flex items-center justify-center z-50">
      <div class="glass-effect p-8 rounded-2xl shadow-soft animate-pulse">
        <div class="animate-spin rounded-full h-12 w-12 border-4 
                    border-primary border-t-transparent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import request from '@/api/request';
const emit = defineEmits(['login-success']);

const phone = ref('');
const code = ref('');
const countdown = ref(0);
const isLoading = ref(false);
const error = ref(null);
const phoneError = ref('');
const codeError = ref('');

let errorTimer = null;

const showError = (message) => {
  error.value = message;
  if (errorTimer) clearTimeout(errorTimer);
  errorTimer = setTimeout(() => {
    error.value = null;
  }, 2000);
};

const validatePhone = () => {
  phoneError.value = '';
  if (!phone.value) {
    phoneError.value = '请输入手机号';
    return false;
  }
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    phoneError.value = '请输入正确的手机号';
    return false;
  }
  return true;
};

const validateCode = () => {
  codeError.value = '';
  if (!code.value) {
    codeError.value = '请输入验证码';
    return false;
  }
  if (!/^\d{6}$/.test(code.value)) {
    codeError.value = '请输入6位数字验证码';
    return false;
  }
  return true;
};

const sendCode = async () => {
  if (!validatePhone()) return;
  try {
    isLoading.value = true;
    const response = await request.post('/api/send-code', {
      phone: phone.value
    });
    if (response.success) {
      countdown.value = 60;
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      code.value = response.code || '';
      showError('验证码已自动填入输入框');
    } else {
      throw new Error(response.error);
    }
  } catch (err) {
    showError('获取验证码失败：' + (err.message || '未知错误'));
  } finally {
    isLoading.value = false;
  }
};

const login = async () => {
  if (!validatePhone() || !validateCode()) return;
  try {
    isLoading.value = true;
    const response = await request.post('/api/login', {
      phone: phone.value,
      code: code.value
    });
    if (response.success) {
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('phone', phone.value);
      emit('login-success');
    } else {
      throw new Error(response.error);
    }
  } catch (err) {
    showError('登录失败：' + (err.message || '未知错误'));
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.5s ease-out 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 