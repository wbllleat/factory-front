<template>
  <div class="space-y-6">
    <div class="flex justify-between">
      <a-input-search
        v-model="searchText"
        placeholder="请输入用户名搜索"
        style="width: 320px"
        @search="onSearch"
      />
      <a-button type="primary" @click="openAddModal">
        <template #icon><icon-plus /></template>
        添加用户
      </a-button>
    </div>

    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
    >
      <template #columns>
        <a-table-column title="用户名" data-index="username" />
        <a-table-column title="姓名" data-index="name" />
        <a-table-column title="角色" data-index="role" />
        <a-table-column title="部门" data-index="department" />
        <a-table-column title="操作">
          <template #cell="{ record }">
            <a-space>
              <a-button type="text" @click="editUser(record)">
                <template #icon><icon-edit /></template>
                编辑
              </a-button>
              <a-button type="text" status="danger" @click="deleteUser(record)">
                <template #icon><icon-delete /></template>
                删除
              </a-button>
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
      <a-form :model="formData" ref="formRef">
        <a-form-item field="username" label="用户名" :rules="[{required: true}]">
          <a-input v-model="formData.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item field="name" label="姓名" :rules="[{required: true}]">
          <a-input v-model="formData.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item field="role" label="角色" :rules="[{required: true}]">
          <a-select v-model="formData.role" placeholder="请选择角色">
            <a-option value="admin">管理员</a-option>
            <a-option value="user">普通用户</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="department" label="部门" :rules="[{required: true}]">
          <a-input v-model="formData.department" placeholder="请输入部门" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon'

const searchText = ref('')
const loading = ref(false)
const modalVisible = ref(false)
const modalTitle = ref('添加用户')
const formRef = ref()

const pagination = reactive({
  total: 100,
  current: 1,
  pageSize: 10,
})

const formData = reactive({
  username: '',
  name: '',
  role: '',
  department: '',
})

// 模拟的表格数据
const tableData = ref([
  {
    username: 'admin',
    name: '管理员',
    role: '管理员',
    department: '技术部',
  },
  // ... 更多数据
])

const onSearch = (value: string) => {
  console.log('搜索:', value)
  // 实现搜索逻辑
}

const onPageChange = (page: number) => {
  pagination.current = page
  // 加载对应页数据
}

const openAddModal = () => {
  modalTitle.value = '添加用户'
  modalVisible.value = true
  Object.assign(formData, {
    username: '',
    name: '',
    role: '',
    department: '',
  })
}

const editUser = (record: any) => {
  modalTitle.value = '编辑用户'
  modalVisible.value = true
  Object.assign(formData, record)
}

const deleteUser = (record: any) => {
  // 实现删除逻辑
  Message.success('删除成功')
}

const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    // 实现保存逻辑
    Message.success('保存成功')
    modalVisible.value = false
  } catch (error) {
    // 表单验证失败
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
}
</script> 