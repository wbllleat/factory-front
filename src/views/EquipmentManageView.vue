<template>
  <div class="space-y-6">
    <!-- 搜索和添加区域 -->
    <div class="flex justify-between">
      <div class="flex gap-4">
        <a-input-search
          v-model="searchParams.code"
          placeholder="请输入设备编号搜索"
          style="width: 200px"
          @search="handleSearch"
        />
        <a-input
          v-model="searchParams.name"
          placeholder="请输入设备名称"
          style="width: 200px"
          @change="handleSearch"
        />
        <a-select
          v-model="searchParams.categoryId"
          placeholder="请选择设备类型"
          style="width: 200px"
          @change="handleSearch"
        >
          <a-option value="">全部类型</a-option>
          <a-option :value="1">工床</a-option>
          <a-option :value="2">车床</a-option>
          <a-option :value="3">铣床</a-option>
        </a-select>
      </div>
      <a-button type="primary" @click="openAddModal">
        <template #icon><icon-plus /></template>
        添加设备
      </a-button>
    </div>

    <!-- 设备列表��格 -->
    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
      stripe
    >
      <template #columns>
        <a-table-column title="设备编号" data-index="code" />
        <a-table-column title="设备名称" data-index="name" />
        <a-table-column title="设备类型" data-index="categoryId">
          <template #cell="{ record }">
            {{ getCategoryLabel(record.categoryId) }}
          </template>
        </a-table-column>
        <a-table-column title="品牌" data-index="brand" />
        <a-table-column title="型号" data-index="model" />
        <a-table-column title="设备价值" data-index="value">
          <template #cell="{ record }">
            ¥{{ record.value.toFixed(2) }}
          </template>
        </a-table-column>
        <a-table-column title="规格" data-index="specifications" />
        <a-table-column title="位置" data-index="location" />
        <a-table-column title="供应商" data-index="supplier" />
        <a-table-column title="状态" data-index="status">
          <template #cell="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column-number title="操作" width="300">
          <template #cell="{ record }">
            <a-space>
              <a-button
                type="text"
                size="small"
                :status="record.status === 'running' ? 'danger' : 'success'"
                :loading="record.operating"
                @click="togglePower(record)"
              >
                <template #icon>
                  <icon-poweroff />
                </template>
                {{ record.status === 'running' ? '关机' : '开机' }}
              </a-button>
              <a-button type="text" size="small" @click="editEquipment(record)">
                <template #icon><icon-edit /></template>
                编辑
              </a-button>
              <a-popconfirm
                content="确定要删除该设备吗？"
                @ok="deleteEquipment(record)"
              >
                <a-button type="text" status="danger" size="small">
                  <template #icon><icon-delete /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table-column-number>
      </template>
    </a-table>

    <!-- 添加/编辑设备弹窗 -->
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
        <a-form-item field="code" label="设备编号" :rules="[{required: true, message: '请输入设备编号'}]">
          <a-input v-model="formData.code" placeholder="请输入设备编号" />
        </a-form-item>
        <a-form-item field="name" label="��备名称" :rules="[{required: true, message: '请输入设备名称'}]">
          <a-input v-model="formData.name" placeholder="请输入设备名称" />
        </a-form-item>
        <a-form-item field="categoryId" label="设备类型" :rules="[{required: true, message: '请选择设备类型'}]">
          <a-select v-model="formData.categoryId" placeholder="请选择设备类型">
            <a-option :value="1">工床</a-option>
            <a-option :value="2">车床</a-option>
            <a-option :value="3">铣床</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="brand" label="品牌" :rules="[{required: true, message: '请输入品牌'}]">
          <a-input v-model="formData.brand" placeholder="请输入品牌" />
        </a-form-item>
        <a-form-item field="model" label="型号" :rules="[{required: true, message: '请输入型号'}]">
          <a-input v-model="formData.model" placeholder="请输入型号" />
        </a-form-item>
        <a-form-item field="value" label="设备价值" :rules="[{required: true, message: '请输入设备价值'}]">
          <a-input-number
            v-model="formData.value"
            placeholder="请输入设备价值"
            :precision="2"
            :min="0"
            :step="1000"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item field="specifications" label="规格" :rules="[{required: true, message: '请输入规格'}]">
          <a-input v-model="formData.specifications" placeholder="请输入规格" />
        </a-form-item>
        <a-form-item field="location" label="位置" :rules="[{required: true, message: '请输入位置'}]">
          <a-input v-model="formData.location" placeholder="请输入位置" />
        </a-form-item>
        <a-form-item field="supplier" label="供应商" :rules="[{required: true, message: '请输入供应商'}]">
          <a-input v-model="formData.supplier" placeholder="请输入供应商" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconEdit, 
  IconDelete, 
  IconPoweroff 
} from '@arco-design/web-vue/es/icon'

// 表单验证规则
const rules = reactive({
  code: [{ required: true, message: '请输入设备编号' }],
  name: [{ required: true, message: '请输入设备名称' }],
  categoryId: [{ required: true, message: '请选择设备类型' }],
  brand: [{ required: true, message: '请输入品牌' }],
  model: [{ required: true, message: '请输入型号' }],
  value: [{ required: true, message: '请输入设备价值' }],
  specifications: [{ required: true, message: '请输入规格' }],
  location: [{ required: true, message: '请输入位置' }],
  supplier: [{ required: true, message: '请输入供应商' }]
})

// 搜索参数
const searchParams = reactive({
  code: '',
  name: '',
  categoryId: '',
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
const modalTitle = ref('添加设备')
const formRef = ref()
const formData = reactive({
  id: '',
  code: '',
  name: '',
  categoryId: undefined,
  brand: '',
  model: '',
  value: 0,
  specifications: '',
  location: '',
  supplier: '',
})

// 设备类型工具函数
const getCategoryLabel = (categoryId: number) => {
  const categoryMap: Record<number, string> = {
    1: '工床',
    2: '车床',
    3: '铣床'
  }
  return categoryMap[categoryId] || '未知类型'
}

// 设备状态工具函数
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'running': '运行中',
    'stopped': '已关机',
    'error': '故障'
  }
  return statusMap[status] || '未知状态'
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'running': 'green',
    'stopped': 'gray',
    'error': 'red'
  }
  return colorMap[status] || 'default'
}

// 模拟获取设备列表数据
const fetchEquipmentList = async () => {
  loading.value = true
  try {
    const mockData = Array(pagination.total || 100).fill(0).map((_, index) => ({
      id: index + 1,
      code: `EQ${String(index + 1).padStart(3, '0')}`,
      name: `设备${index + 1}`,
      categoryId: (index % 3) + 1,
      brand: ['松下', '西门子', '三菱'][index % 3],
      model: String(index % 5 + 1),
      value: 10000 + index * 1000,
      specifications: ['标准型', '加强型', '特殊型'][index % 3],
      location: `${String.fromCharCode(65 + index % 3)}区`,
      supplier: ['松下公司', '西门子公司', '三菱公司'][index % 3],
      status: ['running', 'stopped', 'error'][index % 3], // 添加状态
      operating: false // 添加操作中状态
    }))
    
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = mockData.slice(start, end)
    pagination.total = mockData.length
  } catch (error) {
    Message.error('获取设备列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchEquipmentList()
}

// 分页
const onPageChange = (page: number) => {
  pagination.current = page
  fetchEquipmentList()
}

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  fetchEquipmentList()
}

// 添加设备
const openAddModal = () => {
  modalTitle.value = '添加设备'
  modalVisible.value = true
  Object.assign(formData, {
    id: '',
    code: '',
    name: '',
    categoryId: undefined,
    brand: '',
    model: '',
    value: 0,
    specifications: '',
    location: '',
    supplier: '',
  })
}

// 编辑设备
const editEquipment = (record: any) => {
  modalTitle.value = '编辑设备'
  modalVisible.value = true
  Object.assign(formData, record)
}

// 删除设备
const deleteEquipment = async (record: any) => {
  try {
    // 这里应该调用后端API
    Message.success('删除成功')
    fetchEquipmentList()
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
    fetchEquipmentList()
  } catch (error) {
    // 表单验证失败
  }
}

const handleModalCancel = () => {
  formRef.value.resetFields()
  modalVisible.value = false
}

// 开关机操作
const togglePower = async (record: any) => {
  const action = record.status === 'running' ? '关机' : '开机'; // 定义 action
  try {
    record.operating = true; // 添加 loading 状态
    // 这里应该调用后端 API
    await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟 API 调用延迟
    
    record.status = record.status === 'running' ? 'stopped' : 'running';
    Message.success(`${record.name}${action}成功`);
  } catch (error) {
    Message.error(`${record.name}${action}失败`);
  } finally {
    record.operating = false;
  }
}

onMounted(() => {
  fetchEquipmentList()
})
</script> 