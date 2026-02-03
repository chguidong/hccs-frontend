<template>
  <div class="dashboard">
    <!-- 欢迎卡片 -->
    <el-card class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>欢迎<span class="username">{{ userInfo?.userName }}</span>！</h2>
          <p class="welcome-desc">这是你的工作台，开始管理你的系统吧</p>
        </div>
        <div class="welcome-avatar">
          <el-avatar :size="80">{{ userInitial }}</el-avatar>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon :size="40"><User /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">用户总数</p>
              <h3 class="stat-value">--</h3>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon role-icon">
              <el-icon :size="40"><Setting /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">角色总数</p>
              <h3 class="stat-value">--</h3>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon success-icon">
              <el-icon :size="40"><Check /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">在线用户</p>
              <h3 class="stat-value">--</h3>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon warning-icon">
              <el-icon :size="40"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">待处理</p>
              <h3 class="stat-value">--</h3>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 内容区域 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <!-- 快速操作 -->
        <el-card class="quick-actions">
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          
          <div class="actions-grid">
            <div class="action-item" @click="navigateTo('/users')">
              <el-icon :size="30" color="#409eff"><User /></el-icon>
              <span>用户管理</span>
            </div>
            
            <div class="action-item" @click="navigateTo('/roles')">
              <el-icon :size="30" color="#67c23a"><Setting /></el-icon>
              <span>角色管理</span>
            </div>

            <div class="action-item">
              <el-icon :size="30" color="#e6a23c"><Document /></el-icon>
              <span>数据报表</span>
            </div>

            <div class="action-item">
              <el-icon :size="30" color="#f56c6c"><Tools /></el-icon>
              <span>系统设置</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <!-- 用户信息 -->
        <el-card class="user-info-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
            </div>
          </template>
          
          <div class="info-list">
            <div class="info-item">
              <span class="label">用户名：</span>
              <span class="value">{{ userInfo?.userName }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span class="value">{{ userInfo?.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">账号 ID：</span>
              <span class="value">{{ userInfo?.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">注册时间：</span>
              <span class="value">{{ formatDate(userInfo?.createdAt) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Setting, Check, Warning, Document, Tools } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userInfo = computed(() => authStore.userInfo)
const userInitial = computed(() => {
  return userInfo.value?.userName?.charAt(0).toUpperCase() || 'U'
})

onMounted(async () => {
  if (!userInfo.value) {
    try {
      await authStore.fetchUserInfo()
    } catch (error) {
      ElMessage.error('获取用户信息失败')
    }
  }
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
/* 欢迎卡片 */
.welcome-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.welcome-card :deep(.el-card__body) {
  padding: 30px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.welcome-text h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 500;
}

.welcome-text .username {
  color: #ffd700;
}

.welcome-desc {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.role-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.success-icon {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #fff;
}

.warning-icon {
  background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
  color: #fff;
}

.success-icon {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #fff;
}

.warning-icon {
  background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-label {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #909399;
}

.stat-value {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

/* 快速操作 */
.quick-actions {
  height: 100%;
  min-height: 300px;
}

.quick-actions :deep(.el-card__body) {
  height: calc(100% - 57px);
}

.card-header {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  border: 2px dashed #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
  transform: translateY(-3px);
}

.action-item span {
  font-size: 14px;
  color: #606266;
}

/* 用户信息卡片 */
.user-info-card {
  height: 100%;
  min-height: 300px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  width: 100px;
  font-size: 14px;
  color: #909399;
}

.info-item .value {
  flex: 1;
  font-size: 14px;
  color: #303133;
}
</style>
