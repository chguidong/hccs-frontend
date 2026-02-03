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
        <el-row :gutter="20">
          <el-col :span="24">
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
          </el-col>
        </el-row>

        <!-- 快速导航 -->
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="6">
            <el-card shadow="hover" class="nav-card" @click="navigateTo('/users')">
              <div class="nav-content">
                <el-icon :size="40" color="#409eff">
                  <User />
                </el-icon>
                <div class="nav-text">
                  <h3>用户管理</h3>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card shadow="hover" class="nav-card" @click="navigateTo('/roles')">
              <div class="nav-content">
                <el-icon :size="40" color="#67c23a">
                  <Setting />
                </el-icon>
                <div class="nav-text">
                  <h3>角色管理</h3>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Setting } from '@element-plus/icons-vue'
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

.nav-card {
  cursor: pointer;
  transition: all 0.3s;
}

.nav-card:hover {
  transform: translateY(-5px);
}

.nav-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.nav-card.disabled:hover {
  transform: none;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.nav-text p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}
}

.welcome-content strong {
  color: #409eff;
}
</style>
