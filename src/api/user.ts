import request from '@/utils/request'
import type { Role } from './role'

// 后端统一响应格式
export interface ApiResponse<T = any> {
  value: T
  statusCode: number
  message: string
  trace: string
  isSuccess: boolean
}

// 用户类型定义
export interface User {
  userId: string  // UUID
  userName: string
  email: string
  userType: number
  roleIds: string[]
  roleId: string
  roleNames: string[]  // 后端返回的角色名称数组
  roleName?: string | null  // 兼容单角色（可选）
  createdAt: string
  updatedAt: string
  lastLoginDate: string | null
  remark: string | null
  roles?: Role[]  // 前端使用
}

// 用户列表查询参数
export interface UserQueryParams {
  userName?: string
  email?: string
  roleID?: string
  pageIndex: number
  pageSize: number
}

// 用户列表响应数据
export interface UserListData {
  userName: string | null
  email: string | null
  roleID: string | null
  result: User[]
  pageIndex: number
  pageSize: number
  sortBy: string | null
  totalCount: number
}

// 创建/更新用户数据
export interface UserFormData {
  userId?: string
  userName: string
  email: string
  userType?: number
  roleIds: string[]
  remark?: string
}

/**
 * 获取用户列表
 */
export const getUserList = (params: UserQueryParams): Promise<ApiResponse<UserListData>> => {
  return request({
    url: '/User/GetUserList',
    method: 'post',
    data: params
  })
}

/**
 * 获取单个用户详情
 */
export const getUserDetail = (id: string): Promise<ApiResponse<User>> => {
  return request({
    url: '/User/GetUserByID',
    method: 'post',
    data: { ID: id }  // 后端GuidModel期望的参数名是ID
  })
}

/**
 * 创建/更新用户
 */
export const saveUser = (data: UserFormData): Promise<ApiResponse<User>> => {
  return request({
    url: '/User/SaveUser',
    method: 'post',
    data
  })
}

/**
 * 创建用户（兼容接口）
 */
export const createUser = (data: UserFormData): Promise<ApiResponse<User>> => {
  return saveUser(data)
}

/**
 * 更新用户（兼容接口）
 */
export const updateUser = (id: string, data: Partial<UserFormData>): Promise<ApiResponse<User>> => {
  return saveUser({ ...data, userId: id } as UserFormData)
}

/**
 * 删除用户
 */
export const deleteUser = (userId: string): Promise<ApiResponse<null>> => {
  return request({
    url: '/User/DeleteUser',
    method: 'post',
    data: { ID: userId }  // 后端GuidModel期望的参数名是ID
  })
}

/**
 * 批量删除用户（如果后端支持）
 */
export const batchDeleteUsers = (userIds: string[]): Promise<ApiResponse<null>> => {
  // 注意：这个接口可能需要根据后端实际情况调整
  return Promise.all(userIds.map(id => deleteUser(id))) as any
}

/**
 * 更新用户状态（如果后端支持）
 */
export const updateUserStatus = (
  _id: string,
  _status: 'active' | 'inactive'
): Promise<ApiResponse<null>> => {
  // 注意：这个接口可能需要根据后端实际情况调整
  console.warn('updateUserStatus not implemented in backend')
  return Promise.resolve({
    value: null,
    statusCode: 200,
    message: 'Not implemented',
    trace: '',
    isSuccess: true
  })
}

/**
 * 为用户分配角色
 * 注意：后端没有单独的AssignRoles接口，通过SaveUser实现角色分配
 */
export const assignRoles = (userId: string, roleIds: string[]): Promise<ApiResponse<null>> => {
  return request({
    url: '/User/SaveUser',
    method: 'post',
    data: { userId, roleIds }  // SaveUser接口支持只更新roleIds
  })
}

/**
 * 重置用户密码（如果后端支持）
 */
export const resetUserPassword = (_id: string, _newPassword: string): Promise<ApiResponse<null>> => {
  console.warn('resetUserPassword not implemented in backend')
  return Promise.resolve({
    value: null,
    statusCode: 200,
    message: 'Not implemented',
    trace: '',
    isSuccess: true
  })
}
