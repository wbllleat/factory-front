<template>
  <div class="space-y-6">
    <!-- 搜索和操作区域 -->
    <div class="flex justify-between">
      <div class="flex gap-4">
        <a-input-search
          v-model="searchParams.code"
          placeholder="请输入巡检单号"
          style="width: 200px"
          @search="handleSearch"
        />
        <a-select
          v-model="searchParams.status"
          placeholder="巡检状态"
          style="width: 160px"
          @change="handleSearch"
        >
          <a-option value="">全部状态</a-option>
          <a-option :value="0">待巡检</a-option>
          <a-option :value="1">巡检中</a-option>
          <a-option :value="2">已完成</a-option>
        </a-select>
      </div>
      <a-button type="primary" @click="createInspection">
        <template #icon><icon-plus /></template>
        新建巡检
      </a-button>
    </div>

    <!-- 巡检列表 -->
    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
      stripe
    >
      <template #columns>
        <a-table-column title="巡检单号" data-index="code" />
        <a-table-column title="巡检名称" data-index="name" />
        <a-table-column title="巡检周期(天)" data-index="cycle" />
        <a-table-column title="巡检区域" data-index="area" />
        <a-table-column title="巡检人" data-index="inspectorName" />
        <a-table-column title="巡检状态" data-index="status">
          <template #cell="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="计划开始时间" data-index="planStartTime" />
        <a-table-column title="计划结束时间" data-index="planEndTime" />
        <a-table-column title="实际完成时间" data-index="actualEndTime">
          <template #cell="{ record }">
            {{ record.actualEndTime || '-' }}
          </template>
        </a-table-column>
        <a-table-column title="操作" width="200" fixed="right">
          <template #cell="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="viewDetail(record)">
                <template #icon><icon-eye /></template>
                详情
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- 添加新建巡检弹窗 -->
    <a-modal
      v-model:visible="createModalVisible"
      title="新建巡检"
      @ok="handleCreateOk"
      @cancel="handleCreateCancel"
      :ok-loading="createLoading"
    >
      <a-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-align="right"
        :style="{ width: '600px' }"
      >
        <a-form-item field="name" label="巡检名称" :rules="[{ required: true, message: '请输入巡检名称' }]">
          <a-input v-model="createForm.name" placeholder="请输入巡检名称" />
        </a-form-item>
        
        <a-form-item field="cycle" label="巡检周期" :rules="[{ required: true, message: '请输入巡检周期' }]">
          <a-input-number
            v-model="createForm.cycle"
            placeholder="请输入巡检周期(天)"
            :min="1"
            :max="365"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item field="area" label="巡检区域" :rules="[{ required: true, message: '请选择巡检区域' }]">
          <a-select v-model="createForm.area" placeholder="请选择巡检区域">
            <a-option value="A区">A区</a-option>
            <a-option value="B区">B区</a-option>
            <a-option value="C区">C区</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item field="inspectorId" label="巡检人" :rules="[{ required: true, message: '请选择巡检人' }]">
          <a-select v-model="createForm.inspectorId" placeholder="请选择巡检人">
            <a-option v-for="inspector in inspectors" :key="inspector.id" :value="inspector.id">
              {{ inspector.name }}
            </a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconEye } from '@arco-design/web-vue/es/icon'

// 搜索参数
const searchParams = reactive({
  code: '',
  status: ''
})

// 表格相关
const loading = ref(false)
const tableData = ref<InspectionPlan[]>([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})

// 新建巡检相关
const createModalVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<any>()
const createForm = reactive({
  name: '',
  cycle: 1,
  area: '',
  inspectorId: undefined
})

// 巡检人列表（模拟数据）
const inspectors = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

// 表单校验规则
const createRules = reactive({
  name: [
    { required: true, message: '请输入巡检名称' },
    { maxLength: 50, message: '巡检名称最多50个字符' }
  ],
  cycle: [
    { required: true, message: '请输入巡检周期' },
    { type: 'number', min: 1, max: 365, message: '巡检周期在1-365天之间' }
  ],
  area: [
    { required: true, message: '请选择巡检区域' }
  ],
  inspectorId: [
    { required: true, message: '请选择巡检人' }
  ]
})

// 状态工具函数
const getStatusLabel = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待巡检',
    1: '巡检中',
    2: '已完成'
  }
  return statusMap[status] || '未知状态'
}

const getStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'orange',
    1: 'blue',
    2: 'green'
  }
  return colorMap[status] || 'default'
}

// 获取巡检列表
const fetchInspectionList = async () => {
  loading.value = true
  try {
    // 模拟API响应数据
    const mockData = {
      code: 200,
      message: 'success',
      data: {
        total: 50,
        list: Array(10).fill(0).map((_, index) => ({
          planId: index + 1,
          code: `P202403200${String(index + 1).padStart(2, '0')}`,
          name: `设备日常巡检${index + 1}`,
          cycle: index % 2 ? 7 : 1,
          area: ['A区', 'B区', 'C区'][index % 3],
          inspectorName: ['张三', '李四', '王五'][index % 3],
          status: index % 3,
          planStartTime: '2024-03-20 09:00:00',
          planEndTime: '2024-03-20 17:00:00',
          actualEndTime: index % 3 === 2 ? '2024-03-20 16:30:00' : null
        }))
      }
    }

    if (mockData.code === 200) {
      tableData.value = mockData.data.list
      pagination.total = mockData.data.total
    }
  } catch (error) {
    Message.error('获取巡检列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchInspectionList()
}

// 分页
const onPageChange = (page: number) => {
  pagination.current = page
  fetchInspectionList()
}

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  fetchInspectionList()
}

// 新建巡检
const createInspection = () => {
  createModalVisible.value = true
  Object.assign(createForm, {
    name: '',
    cycle: 1,
    area: '',
    inspectorId: undefined
  })
}

// 处理新建巡检
const handleCreateOk = async () => {
  try {
    await createFormRef.value?.validate()
    createLoading.value = true
    
    // 这里应该调用后端API
    // const res = await fetch('/admin/inspection-plans', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(createForm)
    // })
    // const data = await res.json()

    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockData = {
      code: 201,
      message: 'success',
      data: {
        planId: Date.now(),
        code: `P${new Date().toISOString().slice(0,10).replace(/-/g,'')}001`,
        name: createForm.name,
        cycle: createForm.cycle
      }
    }

    if (mockData.code === 201) {
      Message.success('创建成功')
      createModalVisible.value = false
      // 刷新列表
      await fetchInspectionList()
    } else {
      Message.error(mockData.message)
    }
  } catch (error) {
    Message.error('创建失败')
  } finally {
    createLoading.value = false
  }
}

const handleCreateCancel = () => {
  createFormRef.value?.resetFields()
  createModalVisible.value = false
}

// 查看详情
const viewDetail = (record: any) => {
  Message.info(`查看巡检单 ${record.code} 的详细信息`)
}

onMounted(() => {
  fetchInspectionList()
})
</script>

<style scoped>
.arco-tag {
  padding: 4px 8px;
  font-size: 14px;
}

.arco-btn-text {
  padding: 4px 8px;
}

.arco-space {
  gap: 8px;
}
</style> 