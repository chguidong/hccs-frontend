import request from '@/utils/request'

// 后端统一响应格式
export interface ApiResponse<T = any> {
  value: T
  statusCode: number
  message: string
  trace: string
  isSuccess: boolean
}

// 角色类型定义
export interface Role {
  roleId: string  // UUID
  roleName: string
  remark?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

// 角色列表响应数据
export interface RoleListData {
  roleName: string | null
  result: Role[]
  pageIndex: number
  pageSize: number
  sortBy: string | null
  totalCount: number
}

// 创建/更新角色数据
export interface RoleFormData {
  roleId?: string
  roleName: string
  remark?: string
  description?: string
}

/**
 * 获取所有角色列表
 */
export const getRoleList = (params?: {
  roleName?: string
  pageIndex?: number
  pageSize?: number
}): Promise<ApiResponse<RoleListData>> => {
  return request({
    url: '/Role/GetRoleList',
    method: 'post',
    data: params || {}
  })
}

/**
 * 获取角色下拉列表
 */
export const getRoleDropdownList = (): Promise<ApiResponse<Role[]>> => {
  return request({
    url: '/Role/GetRoleDropdownList',
    method: 'post',
    data: {}
  })
}

/**
 * 获取单个角色详情
 */
export const getRoleDetail = (id: string): Promise<ApiResponse<Role>> => {
  return request({
    url: '/Role/GetRoleInfo',
    method: 'post',
    data: { ID: id }  // 后端GuidModel期望的参数名是ID
  })
}

/**
 * 保存角色（创建/更新）
 */
export const saveRole = (data: RoleFormData): Promise<ApiResponse<Role>> => {
  return request({
    url: '/Role/SaveRole',
    method: 'post',
    data
  })
}

/**
 * 创建角色（兼容接口）
 */
export const createRole = (data: RoleFormData): Promise<ApiResponse<Role>> => {
  return saveRole(data)
}

/**
 * 更新角色（兼容接口）
 */
export const updateRole = (id: string, data: RoleFormData): Promise<ApiResponse<Role>> => {
  return saveRole({ ...data, roleId: id })
}

/**
 * 删除角色
 */
export const deleteRole = (roleId: string): Promise<ApiResponse<null>> => {
  return request({
    url: '/Role/DeleteRole',
    method: 'post',
    data: { ID: roleId }  // 后端GuidModel期望的参数名是ID
  })
}

/**
 * 批量删除角色（如果后端支持）
 */
export const batchDeleteRoles = (roleIds: string[]): Promise<ApiResponse<null>> => {
  // 注意：这个接口可能需要根据后端实际情况调整
  return Promise.all(roleIds.map(id => deleteRole(id))) as any
}
