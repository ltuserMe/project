<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" class="flex items-center gap-2 mb-2">
      <input type="checkbox" :checked="todo.completed" @change="$emit('toggle', todo)" />
      <span :class="{ 'line-through text-gray-400': todo.completed }">{{ todo.text }}</span>
      <button @click="$emit('delete', todo.id)">删除</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  todos: {
    type: Array,
    required: true
  }
});
</script> 