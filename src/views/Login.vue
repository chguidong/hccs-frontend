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
        <el-form-item prop="account">
          <div class="input-with-label">
            <span class="label-text">账号</span>
            <el-input
              v-model="loginForm.account"
              placeholder="请输入邮箱或手机号"
              prefix-icon="User"
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

        <el-form-item v-if="showCaptcha" prop="captchaValue" class="captcha-form-item">
          <div class="captcha-container">
            <div class="input-with-label captcha-input">
              <span class="label-text">验证码</span>
              <el-input
                ref="captchaInputRef"
                v-model="loginForm.captchaValue"
                placeholder="请输入验证码"
                maxlength="4"
                size="large"
                @keyup.enter="handleLogin"
              />
            </div>
            <div class="captcha-image" @click="refreshCaptcha" title="点击刷新">
              <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
              <span v-else class="captcha-loading">加载中...</span>
            </div>
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
import { getCaptcha } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref<FormInstance>()
const captchaInputRef = ref()
const loading = ref(false)
const isSubmitting = ref(false)  // 独立的提交标志
const rememberMe = ref(false)
const showCaptcha = ref(false)
const captchaImage = ref('')
const captchaKey = ref('')
let currentMessageInstance: any = null  // 当前显示的消息实例

const loginForm = reactive({
  account: '',
  password: '',
  captchaValue: ''
})

const loginRules: FormRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, message: '账号至少3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  captchaValue: [
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (!showCaptcha.value) {
          callback()
          return
        }
        if (!value) {
          callback(new Error('请输入验证码'))
          return
        }
        if (value.length !== 4) {
          callback(new Error('验证码为4位'))
          return
        }
        callback()
      }, 
      trigger: 'blur' 
    }
  ]
}

// 获取验证码
const fetchCaptcha = async () => {
  try {
    const res: any = await getCaptcha()
    // 后端返回格式：{ success: true, data: { captchaKey, captchaImage } }
    const captchaData = res.data || res
    captchaKey.value = captchaData.captchaKey
    captchaImage.value = captchaData.captchaImage
  } catch (error) {
    console.error('Failed to fetch captcha:', error)
    ElMessage.error('获取验证码失败')
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  loginForm.captchaValue = ''
  fetchCaptcha()
}



const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  // 使用独立标志防止重复提交
  if (isSubmitting.value) {
    console.log('已在提交中，忽略重复点击')
    return
  }
  
  isSubmitting.value = true
  loading.value = true

  try {
    // 使用 Promise 方式验证表单
    const valid = await loginFormRef.value.validate().catch(() => false)
    
    if (!valid) {
      return
    }
    
    // 根据是否显示验证码来决定传递的参数
    const loginParams: any = {
      account: loginForm.account,
      password: loginForm.password
    }
    
    // 如果验证码显示，则传递验证码参数
    if (showCaptcha.value) {
      loginParams.captchaKey = captchaKey.value
      loginParams.captchaValue = loginForm.captchaValue
    }

    await authStore.login(loginParams)

    ElMessage.success('登录成功！')
    router.push('/')
  } catch (error: any) {
    console.error('Login error:', error)
    const errorData = error.response?.data
    
    // 关闭之前的消息
    if (currentMessageInstance) {
      currentMessageInstance.close()
    }
    
    // 检查后端是否要求验证码
    if (errorData?.requiresCaptcha && !showCaptcha.value) {
      showCaptcha.value = true
      await fetchCaptcha()
      // 等待DOM更新后聚焦验证码输入框
      setTimeout(() => {
        captchaInputRef.value?.focus()
      }, 300)
      currentMessageInstance = ElMessage.warning(errorData.message || '请输入验证码')
    } else {
      currentMessageInstance = ElMessage.error(errorData?.message || '登录失败')
    }
    
    // 刷新验证码
    if (showCaptcha.value) {
      refreshCaptcha()
    }
  } finally {
    loading.value = false
    isSubmitting.value = false
  }
}

onMounted(() => {
  // 从 localStorage 加载记住的密码
  if (localStorage.getItem('rememberMe') === 'true') {
    rememberMe.value = true
    loginForm.account = localStorage.getItem('savedAccount') || ''
  }
  // 不再默认加载验证码，改为登录失败后动态加载
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

.captcha-container {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

/* 验证码区域淡入动画 */
.captcha-form-item {
  animation: captchaSlideIn 0.4s ease-out;
}

@keyframes captchaSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 100px;
  }
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e0f2fe;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
}

.captcha-image:hover {
  border-color: #17a2b8;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.2);
  transform: scale(1.02);
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.captcha-loading {
  font-size: 12px;
  color: #7f8c8d;
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

