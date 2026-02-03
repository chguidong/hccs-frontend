<template>
  <div class="user-management">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="search-bar">
        <el-input
          v-model="searchForm.userName"
          placeholder="搜索用户名"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-input
          v-model="searchForm.email"
          placeholder="搜索邮箱"
          clearable
          style="width: 200px; margin-left: 10px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="searchForm.roleID"
          placeholder="角色筛选"
          clearable
          style="width: 150px; margin-left: 10px"
          @change="handleSearch"
        >
          <el-option
            v-for="role in roleList"
            :key="role.roleId"
            :label="role.roleName"
            :value="role.roleId"
          />
        </el-select>

        <el-button type="primary" :icon="Search" style="margin-left: 10px" @click="handleSearch">
          搜索
        </el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>

      <div class="actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">添加用户</el-button>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 用户表格 -->
    <el-table
      v-loading="loading"
      :data="userList"
      stripe
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="userId" label="用户ID" min-width="180" show-overflow-tooltip />
      <el-table-column prop="userName" label="用户名" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      
      <el-table-column label="角色" min-width="180">
        <template #default="{ row }">
          <template v-if="row.roleNames && row.roleNames.length > 0">
            <el-tag
              v-for="(name, index) in row.roleNames"
              :key="index"
              type="success"
              size="small"
              style="margin-right: 4px; margin-bottom: 2px;"
            >
              {{ name }}
            </el-tag>
          </template>
          <span v-else style="color: #999">
            未分配角色
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="创建时间" min-width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" width="240" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" size="small" link :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" size="small" link :icon="Setting" @click="handleAssignRoles(row)">
              角色
            </el-button>
            <el-button type="danger" size="small" link :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="userForm.userName" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="用户类型" prop="userType">
          <el-radio-group v-model="userForm.userType">
            <el-radio :label="0">普通用户</el-radio>
            <el-radio :label="1">管理员</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="userForm.roleIds"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleList"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="userForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="500px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          <span>{{ currentUser?.userName }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="assignRoleIds"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleList"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleRoleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus, Delete, Edit, Setting } from '@element-plus/icons-vue'
import {
  getUserList,
  saveUser,
  deleteUser,
  batchDeleteUsers,
  assignRoles,
  type User
} from '@/api/user'
import { getRoleDropdownList, type Role } from '@/api/role'

// 搜索表单
const searchForm = reactive({
  userName: '',
  email: '',
  roleID: undefined as string | undefined,
  pageIndex: 0,
  pageSize: 10
})

// 分页信息
const currentPage = ref(1)
const totalCount = ref(0)

// 表格数据
const loading = ref(false)
const userList = ref<User[]>([])
const selectedIds = ref<string[]>([])

// 角色列表
const roleList = ref<Role[]>([])

// 角色名称映射
const getRoleName = (roleId: string) => {
  if (!roleId) return '未知角色'
  const role = roleList.value.find(r => r.roleId === roleId)
  if (role && role.roleName) {
    return role.roleName
  }
  // 找不到时返回友好提示而不是UUID
  console.warn('未找到角色:', roleId, '当前角色列表:', roleList.value)
  return '未知角色'
}

// 日期格式化函数
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0] // 返回 YYYY-MM-DD 格式
  } catch {
    return dateString
  }
}

// 对话框控制
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const isEdit = ref(false)
const submitLoading = ref(false)

// 用户表单
const userFormRef = ref<FormInstance>()
const userForm = reactive({
  userId: '',
  userName: '',
  email: '',
  password: '',
  userType: 0,
  roleIds: [] as string[],
  remark: ''
})

const userFormRules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 角色分配对话框
const roleDialogVisible = ref(false)
const currentUser = ref<User | null>(null)
const assignRoleIds = ref<string[]>([])

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    // 构建请求参数，过滤掉空值
    const params: any = {
      pageIndex: searchForm.pageIndex,
      pageSize: searchForm.pageSize
    }
    
    // 只添加有值的参数
    if (searchForm.userName?.trim()) {
      params.userName = searchForm.userName.trim()
    }
    if (searchForm.email?.trim()) {
      params.email = searchForm.email.trim()
    }
    if (searchForm.roleID) {
      params.roleID = searchForm.roleID
    }
    
    const response = await getUserList(params)
    
    if (response.isSuccess && response.value) {
      userList.value = response.value.result || []
      totalCount.value = response.value.totalCount || 0
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 获取角色列表
const fetchRoleList = async () => {
  try {
    const response = await getRoleDropdownList()
    if (response.isSuccess && response.value) {
      roleList.value = response.value
    } else {
      ElMessage.error(response.message || '获取角色列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取角色列表失败')
  }
}

// 搜索
const handleSearch = () => {
  searchForm.pageIndex = 0
  currentPage.value = 1
  fetchUserList()
}

// 重置
const handleReset = () => {
  searchForm.userName = ''
  searchForm.email = ''
  searchForm.roleID = undefined
  searchForm.pageIndex = 0
  currentPage.value = 1
  fetchUserList()
}

// 分页改变
const handlePageChange = (page: number) => {
  currentPage.value = page
  searchForm.pageIndex = page - 1
  fetchUserList()
}

// 每页数量改变
const handleSizeChange = (size: number) => {
  searchForm.pageSize = size
  searchForm.pageIndex = 0
  currentPage.value = 1
  fetchUserList()
}

// 表格选择改变
const handleSelectionChange = (selection: User[]) => {
  selectedIds.value = selection.map(item => item.userId)
}

// 添加用户
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加用户'
  userForm.userId = ''
  userForm.userName = ''
  userForm.email = ''
  userForm.password = ''
  userForm.userType = 0
  userForm.roleIds = []
  userForm.remark = ''
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: User) => {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  
  userForm.userId = row.userId
  userForm.userName = row.userName
  userForm.email = row.email
  userForm.password = ''
  userForm.userType = row.userType || 0
  userForm.roleIds = row.roleIds || []
  userForm.remark = row.remark || ''
  
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.userName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await deleteUser(row.userId)
    if (response.isSuccess) {
      ElMessage.success('删除成功')
      fetchUserList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个用户吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await batchDeleteUsers(selectedIds.value)
    if (response.isSuccess) {
      ElMessage.success('删除成功')
      fetchUserList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 分配角色
const handleAssignRoles = (row: User) => {
  currentUser.value = row
  assignRoleIds.value = [...(row.roleIds || [])]
  roleDialogVisible.value = true
}

// 角色分配提交
const handleRoleSubmit = async () => {
  if (!currentUser.value) return
  
  submitLoading.value = true
  try {
    const response = await assignRoles(currentUser.value.userId, assignRoleIds.value)
    if (response.isSuccess) {
      ElMessage.success('角色分配成功')
      roleDialogVisible.value = false
      fetchUserList()
    } else {
      ElMessage.error(response.message || '角色分配失败')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '角色分配失败')
  } finally {
    submitLoading.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  userFormRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const submitData: any = {
        userName: userForm.userName,
        email: userForm.email,
        userType: userForm.userType,
        roleIds: userForm.roleIds,
        remark: userForm.remark
      }

      if (isEdit.value) {
        // 编辑用户
        submitData.userId = userForm.userId
        if (userForm.password) {
          submitData.password = userForm.password
        }
      } else {
        // 创建用户
        submitData.password = userForm.password
      }

      const response = await saveUser(submitData)
      if (response.isSuccess) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        dialogVisible.value = false
        fetchUserList()
      } else {
        ElMessage.error(response.message || '操作失败')
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 初始化
onMounted(() => {
  fetchUserList()
  fetchRoleList()
})
</script>

<style scoped>
.user-management {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

.toolbar {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.actions {
  display: flex;
  gap: 10px;
}

.el-table {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
  overflow: auto;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  margin: 0;
  padding: 4px 8px;
}
</style>
