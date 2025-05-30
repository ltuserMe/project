<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in cards" :key="card.title">
        <el-card shadow="hover" class="data-card">
          <div class="card-content">
            <el-icon :size="40" :color="card.color">
              <component :is="card.icon" />
            </el-icon>
            <div class="card-info">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-value">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="Node版本">v16.0.0</el-descriptions-item>
            <el-descriptions-item label="Vue版本">v3.3.4</el-descriptions-item>
            <el-descriptions-item label="Element Plus">v2.3.9</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { User, ShoppingCart, Money, View } from '@element-plus/icons-vue'

const cards = ref([
  {
    title: '用户总数',
    value: '1,234',
    icon: 'User',
    color: '#409EFF'
  },
  {
    title: '订单总数',
    value: '456',
    icon: 'ShoppingCart',
    color: '#67C23A'
  },
  {
    title: '总收入',
    value: '￥89,123',
    icon: 'Money',
    color: '#E6A23C'
  },
  {
    title: '访问量',
    value: '12,345',
    icon: 'View',
    color: '#F56C6C'
  }
])

const activities = ref([
  {
    content: '系统更新完成',
    timestamp: '2024-03-20 10:00:00',
    type: 'success'
  },
  {
    content: '新用户注册',
    timestamp: '2024-03-20 09:30:00',
    type: 'primary'
  },
  {
    content: '系统维护通知',
    timestamp: '2024-03-20 09:00:00',
    type: 'warning'
  }
])
</script>

<style scoped>
.home {
  padding: 20px;
}

.data-card {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-info {
  margin-left: 20px;
}

.card-title {
  font-size: 14px;
  color: #909399;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-top: 5px;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 