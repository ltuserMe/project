<template>
  <el-menu
    :default-active="activeMenu"
    class="nav-menu"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
  >
    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>
    
    <el-sub-menu index="1">
      <template #title>
        <el-icon><Document /></el-icon>
        <span>系统管理</span>
      </template>
      <el-menu-item index="/system/users">用户管理</el-menu-item>
      <el-menu-item index="/system/roles">角色管理</el-menu-item>
      <el-menu-item index="/system/permissions">权限管理</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="2">
      <template #title>
        <el-icon><Setting /></el-icon>
        <span>系统设置</span>
      </template>
      <el-menu-item index="/settings/basic">基本设置</el-menu-item>
      <el-menu-item index="/settings/security">安全设置</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Document, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.nav-menu {
  height: 100%;
  border-right: none;
}

.nav-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

.nav-menu :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}

.el-icon {
  margin-right: 8px;
  width: 24px;
  height: 24px;
}
</style> 