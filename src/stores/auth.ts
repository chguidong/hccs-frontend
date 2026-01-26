import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, register as registerApi, getUserInfo } from '@/api/auth'
import type { LoginParams, RegisterParams } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<any>(null)
  const isAuthenticated = ref(!!token.value)

  // 登录
  const login = async (credentials: LoginParams) => {
    const res: any = await loginApi(credentials)
    token.value = res.data.token
    localStorage.setItem('token', res.data.token)
    isAuthenticated.value = true
    await fetchUserInfo()
  }

  // 注册
  const register = async (data: RegisterParams) => {
    const res: any = await registerApi(data)
    return res
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    const res: any = await getUserInfo()
    userInfo.value = res.data
  }

  // 登出
  const logout = () => {
    token.value = null
    userInfo.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    register,
    fetchUserInfo,
    logout
  }
})
