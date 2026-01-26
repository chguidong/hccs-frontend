import request from '@/utils/request'

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  userName: string
  email: string
  phone: string
  password: string
}

// 登录
export const login = (data: LoginParams) => {
  return request.post('/auth/login', data)
}

// 注册
export const register = (data: RegisterParams) => {
  return request.post('/auth/register', data)
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/auth/me')
}

