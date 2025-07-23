<template>
  <div>
    <div>昵称：{{ user.nickname }}</div>
    <div>手机号：{{ user.phone }}</div>
    <!-- 可扩展头像上传、编辑等功能 -->
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});
</script> 