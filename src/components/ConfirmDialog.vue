<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" @click="cancel"></div>
      
      <!-- 弹窗内容 -->
      <div class="relative glass-effect rounded-2xl shadow-soft max-w-sm w-full 
                  bg-white/90 dark:bg-gray-800/90 overflow-hidden">
        <!-- 标题 -->
        <div class="p-6 pb-4 text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ title }}
          </h3>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {{ message }}
          </p>
        </div>

        <!-- 按钮 -->
        <div class="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/50 flex gap-3">
          <button 
            @click="cancel"
            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                   bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {{ cancelText }}
          </button>
          <button 
            @click="confirm"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500
                   rounded-lg hover:bg-red-600 transition-colors"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    default: '确定要执行此操作吗？'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const confirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}

const cancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script> 