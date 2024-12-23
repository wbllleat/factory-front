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
const tableData = ref<User[]>([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
})

// 模态框相关
const modalVisible = ref(false)
const modalTitle = ref('添加用户')
const formRef = ref<any>()
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
    // 模拟用户数据
    const mockUsers = [
      {
        id: '1',
        username: 'admin001',
        name: '张三',
        role: 'admin',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        createTime: '2024-03-14 10:00:00'
      },
      {
        id: '2',
        username: 'manufacturer001',
        name: '李四',
        role: 'manufacturer',
        email: 'lisi@example.com',
        phone: '13800138002',
        createTime: '2024-03-14 11:00:00'
      },
      {
        id: '3',
        username: 'maintainer001',
        name: '王五',
        role: 'maintainer',
        email: 'wangwu@example.com',
        phone: '13800138003',
        createTime: '2024-03-14 12:00:00'
      },
      {
        id: '4',
        username: 'admin002',
        name: '赵六',
        role: 'admin',
        email: 'zhaoliu@example.com',
        phone: '13800138004',
        createTime: '2024-03-14 13:00:00'
      },
      {
        id: '5',
        username: 'manufacturer002',
        name: '钱七',
        role: 'manufacturer',
        email: 'qianqi@example.com',
        phone: '13800138005',
        createTime: '2024-03-14 14:00:00'
      },
      {
        id: '6',
        username: 'maintainer002',
        name: '孙八',
        role: 'maintainer',
        email: 'sunba@example.com',
        phone: '13800138006',
        createTime: '2024-03-14 15:00:00'
      },
      {
        id: '7',
        username: 'admin003',
        name: '周九',
        role: 'admin',
        email: 'zhoujiu@example.com',
        phone: '13800138007',
        createTime: '2024-03-14 16:00:00'
      },
      {
        id: '8',
        username: 'manufacturer003',
        name: '吴十',
        role: 'manufacturer',
        email: 'wushi@example.com',
        phone: '13800138008',
        createTime: '2024-03-14 17:00:00'
      },
      {
        id: '9',
        username: 'maintainer003',
        name: '郑十一',
        role: 'maintainer',
        email: 'zhengshiyi@example.com',
        phone: '13800138009',
        createTime: '2024-03-14 18:00:00'
      },
      {
        id: '10',
        username: 'admin004',
        name: '王十二',
        role: 'admin',
        email: 'wangshier@example.com',
        phone: '13800138010',
        createTime: '2024-03-14 19:00:00'
      }
    ]

    // 搜索过滤
    let filteredData = [...mockUsers]
    if (searchParams.username) {
      filteredData = filteredData.filter(item => 
        item.username.toLowerCase().includes(searchParams.username.toLowerCase()) ||
        item.name.includes(searchParams.username)
      )
    }
    if (searchParams.role) {
      filteredData = filteredData.filter(item => item.role === searchParams.role)
    }

    // 分页处理
    pagination.total = filteredData.length
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)
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