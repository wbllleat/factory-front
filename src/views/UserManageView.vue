<template>
  <div class="space-y-6">
    <!-- 搜索和添加区域 -->
    <div class="flex justify-between">
      <div class="flex gap-4">
        <a-input-search
          v-model="searchParams.username"
          placeholder="请输入用户名搜索"
          style="width: 320px"
          @search="handleSearch"
        />
        <a-select
          v-model="searchParams.role"
          placeholder="请选择角色"
          style="width: 200px"
          @change="handleSearch"
        >
          <a-option value="">全部角色</a-option>
          <a-option value="admin">管理员</a-option>
          <a-option value="manufacturer">设备厂商</a-option>
          <a-option value="maintainer">维修工人</a-option>
        </a-select>
      </div>
      <a-button type="primary" @click="openAddModal">
        <template #icon><icon-plus /></template>
        添加用户
      </a-button>
    </div>

    <!-- 用户列表表格 -->
    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
      stripe
    >
      <template #columns>
        <a-table-column title="用户名" data-index="username" />
        <a-table-column title="姓名" data-index="name" />
        <a-table-column title="角色" data-index="role">
          <template #cell="{ record }">
            <a-tag :color="getRoleTagColor(record.role)">
              {{ getRoleLabel(record.role) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="邮箱" data-index="email" />
        <a-table-column title="电话" data-index="phone" />
        <a-table-column title="创建时间" data-index="createTime" />
        <a-table-column title="操作" width="200">
          <template #cell="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="editUser(record)">
                <template #icon><icon-edit /></template>
                编辑
              </a-button>
              <a-popconfirm
                content="确定要删除该用户吗？"
                @ok="deleteUser(record)"
              >
                <a-button type="text" status="danger" size="small">
                  <template #icon><icon-delete /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- 添加/编辑用户弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-align="right"
        :style="{ width: '600px' }"
      >
        <a-form-item field="username" label="用户名" :rules="[{required: true, message: '请输入用户名'}]">
          <a-input v-model="formData.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item field="name" label="姓名" :rules="[{required: true, message: '请输入姓名'}]">
          <a-input v-model="formData.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item field="role" label="角色" :rules="[{required: true, message: '请选择角色'}]">
          <a-select v-model="formData.role" placeholder="请选择角色">
            <a-option value="admin">管理员</a-option>
            <a-option value="manufacturer">设备厂商</a-option>
            <a-option value="maintainer">维修工人</a-option>
          </a-select>
        </a-form-item>
        <a-form-item 
          field="email" 
          label="邮箱" 
          :rules="[
            {required: true, message: '请输入邮箱'},
            {type: 'email', message: '请输入正确的邮箱格式'}
          ]"
        >
          <a-input v-model="formData.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item 
          field="phone" 
          label="电话" 
          :rules="[
            {required: true, message: '请输入电话'},
            {match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式'}
          ]"
        >
          <a-input v-model="formData.phone" placeholder="请输入电话" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon'

// 搜索参数
const searchParams = reactive({
  username: '',
  role: '',
})

// 表格相关
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
})

// 模态框相关
const modalVisible = ref(false)
const modalTitle = ref('添加用户')
const formRef = ref()
const formData = reactive({
  id: '',
  username: '',
  name: '',
  role: '',
  email: '',
  phone: '',
})

// 角色相关工具函数
const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    'admin': '管理员',
    'manufacturer': '设备厂商',
    'maintainer': '维修工人'
  }
  return roleMap[role] || role
}

const getRoleTagColor = (role: string) => {
  const colorMap: Record<string, string> = {
    'admin': 'blue',
    'manufacturer': 'green',
    'maintainer': 'orange'
  }
  return colorMap[role] || 'default'
}

// 模拟获取用户列表数据
const fetchUserList = async () => {
  loading.value = true
  try {
    // 这里应该调用后端API
    const mockData = Array(pagination.total).fill(0).map((_, index) => ({
      id: `${index + 1}`,
      username: `user${index + 1}`,
      name: `用户${index + 1}`,
      role: ['admin', 'manufacturer', 'maintainer'][index % 3],
      email: `user${index + 1}@example.com`,
      phone: `1381234${String(index).padStart(4, '0')}`,
      createTime: '2024-03-14 12:00:00'
    }))
    
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = mockData.slice(start, end)
    pagination.total = mockData.length
  } catch (error) {
    Message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

// 分页
const onPageChange = (page: number) => {
  pagination.current = page
  fetchUserList()
}

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  fetchUserList()
}

// 添加用户
const openAddModal = () => {
  modalTitle.value = '添加用户'
  modalVisible.value = true
  Object.assign(formData, {
    id: '',
    username: '',
    name: '',
    role: '',
    email: '',
    phone: '',
  })
}

// 编辑用户
const editUser = (record: any) => {
  modalTitle.value = '编辑用户'
  modalVisible.value = true
  Object.assign(formData, record)
}

// 删除用户
const deleteUser = async (record: any) => {
  try {
    // 这里应该调用后端API
    Message.success('删除成功')
    fetchUserList()
  } catch (error) {
    Message.error('删除失败')
  }
}

// 提交表单
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    // 这里应该调用后端API
    Message.success('保存成功')
    modalVisible.value = false
    fetchUserList()
  } catch (error) {
    // 表单验证失败
  }
}

const handleModalCancel = () => {
  formRef.value.resetFields()
  modalVisible.value = false
}

onMounted(() => {
  fetchUserList()
})
</script> 