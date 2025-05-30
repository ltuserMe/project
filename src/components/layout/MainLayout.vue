<template>
  <div class="main-layout">
    <el-container>
      <el-header>
        <nav-header />
      </el-header>
      <el-container>
        <el-aside width="200px">
          <nav-menu />
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import NavHeader from './NavHeader.vue'
import NavMenu from './NavMenu.vue'
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style> 