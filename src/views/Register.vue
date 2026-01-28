<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo-container">
          <div class="check-logo">
            <div class="check-mark"></div>
          </div>
        </div>
        <h2 class="register-title">创建账户</h2>
        <p class="register-subtitle">加入签到系统，开启你的目标之旅</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="userName">
          <div class="input-with-label">
            <span class="label-text">用户名</span>
            <el-input
              v-model="form.userName"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
              clearable
              autocomplete="off"
            />
          </div>
        </el-form-item>

        <el-form-item prop="email">
          <div class="input-with-label">
            <span class="label-text">邮箱</span>
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              size="large"
              prefix-icon="Message"
              clearable
              autocomplete="off"
            />
          </div>
        </el-form-item>

        <el-form-item prop="phone">
          <div class="input-with-label">
            <span class="label-text">手机号</span>
            <el-input
              v-model="form.phone"
              placeholder="请输入11位手机号"
              size="large"
              prefix-icon="Phone"
              clearable
              autocomplete="off"
            />
          </div>
        </el-form-item>

        <el-form-item prop="password">
          <div class="input-with-label">
            <span class="label-text">密码</span>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码（至少6位）"
              size="large"
              prefix-icon="Lock"
              show-password
              autocomplete="new-password"
            />
          </div>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <div class="input-with-label">
            <span class="label-text">确认密码</span>
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              autocomplete="new-password"
            />
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="register-btn"
            native-type="submit"
          >
            {{ loading ? '注册中...' : '立即注册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <span>已有账户？</span>
        <router-link to="/login" class="login-link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  userName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// 邮箱验证规则
const validateEmail = (_rule: any, value: string, callback: any) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

// 手机号验证规则
const validatePhone = (_rule: any, value: string, callback: any) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!phoneRegex.test(value)) {
    callback(new Error('请输入有效的11位手机号'))
  } else {
    callback()
  }
}

// 确认密码验证
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const { confirmPassword, ...registerData } = form
        await authStore.register(registerData)
        ElMessage.success('注册成功！请登录')
        router.push('/login')
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '注册失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 20px;
}

.register-card {
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

.register-header {
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

.register-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.register-subtitle {
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

.register-form {
  animation: fadeIn 0.6s ease-out 0.4s both;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
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

.register-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.register-form :deep(.el-input) {
  flex: 1;
}

.register-form :deep(.el-input__wrapper) {
  border-radius: 0 12px 12px 0;
  box-shadow: none;
  border: none;
  background-color: transparent;
  transition: all 0.3s ease;
}

.register-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #17a2b8 0%, #00bcd4 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(23, 162, 184, 0.4);
}

.register-btn:active {
  transform: translateY(0);
}

.register-footer {
  text-align: center;
  margin-top: 30px;
  color: #7f8c8d;
  font-size: 14px;
  animation: fadeIn 0.6s ease-out 0.5s both;
}

.login-link {
  color: #17a2b8;
  text-decoration: none;
  font-weight: 600;
  margin-left: 8px;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #00bcd4;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-card {
    padding: 30px 20px;
  }

  .register-title {
    font-size: 26px;
  }

  .register-subtitle {
    font-size: 13px;
  }
}
</style>
