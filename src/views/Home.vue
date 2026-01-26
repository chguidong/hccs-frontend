<template>
  <div class="home-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>签到系统</h1>
          <div class="user-info">
            <el-avatar :size="40">{{ userInitial }}</el-avatar>
            <span class="username">{{ userInfo?.userName }}</span>
            <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <el-card>
          <template #header>
            <div class="card-header">
              <span>欢迎使用签到系统</span>
            </div>
          </template>
          
          <div class="welcome-content">
            <p>你好，<strong>{{ userInfo?.userName }}</strong>！</p>
            <p>邮箱：{{ userInfo?.email }}</p>
            <p>账号 ID：{{ userInfo?.id }}</p>
            <p>创建时间：{{ formatDate(userInfo?.createdAt) }}</p>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
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

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f0f2f5;
}

.el-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 16px;
  color: #606266;
}

.el-main {
  padding: 40px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.welcome-content {
  font-size: 16px;
  line-height: 2;
}

.welcome-content strong {
  color: #409eff;
}
</style>
