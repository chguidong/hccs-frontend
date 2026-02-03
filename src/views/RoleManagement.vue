<template>
  <div class="role-management">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="search-bar">
        <el-input
          v-model="searchForm.roleName"
          placeholder="搜索角色名称"
          clearable
          style="width: 300px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button type="primary" :icon="Search" style="margin-left: 10px" @click="handleSearch">
          搜索
        </el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>

      <div class="actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">添加角色</el-button>
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

    <!-- 角色表格 -->
    <el-table
      v-loading="loading"
      :data="roleList"
      stripe
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="roleId" label="角色ID" min-width="180" show-overflow-tooltip />
      <el-table-column prop="roleName" label="角色名称" min-width="150" />
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" min-width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" width="160" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" size="small" link :icon="Edit" @click="handleEdit(row)">
              编辑
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

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="roleForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入角色备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
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
import { Search, Refresh, Plus, Delete, Edit } from '@element-plus/icons-vue'
import {
  getRoleList,
  saveRole,
  deleteRole,
  batchDeleteRoles,
  type Role
} from '@/api/role'

// 搜索表单
const searchForm = reactive({
  roleName: '',
  pageIndex: 0,
  pageSize: 10
})

// 分页信息
const currentPage = ref(1)
const totalCount = ref(0)

// 表格数据
const loading = ref(false)
const roleList = ref<Role[]>([])
const selectedIds = ref<string[]>([])

// 对话框控制
const dialogVisible = ref(false)
const dialogTitle = ref('添加角色')
const isEdit = ref(false)
const submitLoading = ref(false)

// 角色表单
const roleFormRef = ref<FormInstance>()
const roleForm = reactive({
  roleId: '',
  roleName: '',
  remark: ''
})

const roleFormRules: FormRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
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

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const response = await getRoleList({
      roleName: searchForm.roleName || undefined,
      pageIndex: searchForm.pageIndex,
      pageSize: searchForm.pageSize
    })
    
    if (response.isSuccess && response.value) {
      roleList.value = response.value.result || []
      totalCount.value = response.value.totalCount || 0
    } else {
      ElMessage.error(response.message || '获取角色列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  searchForm.pageIndex = 0
  currentPage.value = 1
  fetchRoleList()
}

// 重置
const handleReset = () => {
  searchForm.roleName = ''
  searchForm.pageIndex = 0
  currentPage.value = 1
  fetchRoleList()
}

// 分页改变
const handlePageChange = (page: number) => {
  currentPage.value = page
  searchForm.pageIndex = page - 1
  fetchRoleList()
}

// 每页数量改变
const handleSizeChange = (size: number) => {
  searchForm.pageSize = size
  searchForm.pageIndex = 0
  currentPage.value = 1
  fetchRoleList()
}

// 表格选择改变
const handleSelectionChange = (selection: Role[]) => {
  selectedIds.value = selection.map(item => item.roleId)
}

// 添加角色
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加角色'
  roleForm.roleId = ''
  roleForm.roleName = ''
  roleForm.remark = ''
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row: Role) => {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  
  roleForm.roleId = row.roleId
  roleForm.roleName = row.roleName
  roleForm.remark = row.remark || ''
  
  dialogVisible.value = true
}

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${row.roleName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await deleteRole(row.roleId)
    if (response.isSuccess) {
      ElMessage.success('删除成功')
      fetchRoleList()
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
      `确定要删除选中的 ${selectedIds.value.length} 个角色吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await batchDeleteRoles(selectedIds.value)
    if (response.isSuccess) {
      ElMessage.success('删除成功')
      fetchRoleList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 对话框关闭
const handleDialogClose = () => {
  roleFormRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!roleFormRef.value) return
  
  await roleFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const submitData: any = {
        roleName: roleForm.roleName,
        remark: roleForm.remark
      }

      if (isEdit.value) {
        // 编辑角色
        submitData.roleId = roleForm.roleId
      }

      const response = await saveRole(submitData)
      if (response.isSuccess) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        dialogVisible.value = false
        fetchRoleList()
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
  fetchRoleList()
})
</script>

<style scoped>
.role-management {
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
