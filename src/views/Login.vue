<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-container">
          <div class="check-logo">
            <div class="check-mark"></div>
          </div>
        </div>
        <h2 class="login-title">欢迎登录</h2>
        <p class="login-subtitle">签到系统 - 开启你的目标之旅</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <div class="input-with-label">
            <span class="label-text">邮箱</span>
            <el-input
              v-model="loginForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
              clearable
              size="large"
            />
          </div>
        </el-form-item>

        <el-form-item prop="password">
          <div class="input-with-label">
            <span class="label-text">密码</span>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              size="large"
              @keyup.enter="handleLogin"
            />
          </div>
        </el-form-item>

        <el-form-item>
          <div class="form-footer">
            <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            size="large"
            class="login-button"
            native-type="submit"
          >
            {{ loading ? '登录中...' : '立即登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>还没有账号？</span>
        <router-link to="/register" class="register-link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.login({
          email: loginForm.email,
          password: loginForm.password
        })

        ElMessage.success('登录成功！')
        router.push('/')
      } catch (error: any) {
        console.error('Login error:', error)
        ElMessage.error(error.response?.data?.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  // 从 localStorage 加载记住的密码
  if (localStorage.getItem('rememberMe') === 'true') {
    rememberMe.value = true
    loginForm.email = localStorage.getItem('savedEmail') || ''
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 50px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.check-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #17a2b8 0%, #00bcd4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(23, 162, 184, 0.3);
  animation: pulse 2s ease-in-out infinite;
  position: relative;
}

.check-logo::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #17a2b8 0%, #00bcd4 100%);
  opacity: 0.3;
  animation: ripple 2s ease-out infinite;
}

.check-mark {
  width: 20px;
  height: 35px;
  border-right: 4px solid white;
  border-bottom: 4px solid white;
  transform: rotate(45deg) translate(-2px, -4px);
  animation: checkDraw 1s ease-out forwards;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 20px rgba(23, 162, 184, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 30px rgba(23, 162, 184, 0.5);
  }
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes checkDraw {
  0% {
    height: 0;
    width: 0;
  }
  50% {
    height: 35px;
    width: 0;
  }
  100% {
    height: 35px;
    width: 20px;
  }
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.login-subtitle {
  font-size: 14px;
  color: #7f8c8d;
  animation: fadeIn 0.6s ease-out 0.3s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.login-form {
  animation: fadeIn 0.6s ease-out 0.4s both;
}

.form-item-inline {
  display: flex;
  align-items: center;
  gap: 16px;
}

.input-with-label {
  display: flex;
  align-items: center;
  gap: 0;
  background-color: #f0f9ff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  width: 100%;
}

.input-with-label:hover {
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.2);
  background-color: #e0f2fe;
}

.input-with-label:focus-within {
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
  background-color: #e0f2fe;
}

.label-text {
  flex-shrink: 0;
  width: 80px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
  background-color: transparent;
  padding: 0 12px;
}

.input-label {
  flex-shrink: 0;
  width: 80px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-input) {
  flex: 1;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 0 12px 12px 0;
  box-shadow: none;
  border: none;
  background-color: transparent;
  transition: all 0.3s ease;
}

.login-button {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #17a2b8 0%, #00bcd4 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(23, 162, 184, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  color: #7f8c8d;
  font-size: 14px;
  animation: fadeIn 0.6s ease-out 0.5s both;
}

.register-link {
  color: #17a2b8;
  text-decoration: none;
  font-weight: 600;
  margin-left: 8px;
  transition: all 0.3s ease;
}

.register-link:hover {
  color: #00bcd4;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 26px;
  }

  .login-subtitle {
    font-size: 13px;
  }
}
</style>

