<template>
  <div class="space-y-6">
    <!-- 搜索和操作区域 -->
    <div class="flex justify-between">
      <div class="flex gap-4">
        <a-input-search
          v-model="searchParams.code"
          placeholder="请输入维修单号"
          style="width: 200px"
          @search="handleSearch"
        />
        <a-select
          v-model="searchParams.status"
          placeholder="维修状态"
          style="width: 160px"
          @change="handleSearch"
        >
          <a-option value="">全部状态</a-option>
          <a-option :value="0">待维修</a-option>
          <a-option :value="1">维修中</a-option>
          <a-option :value="2">已完成</a-option>
        </a-select>
        <a-select
          v-model="searchParams.priority"
          placeholder="优先级"
          style="width: 160px"
          @change="handleSearch"
        >
          <a-option value="">全部优先级</a-option>
          <a-option :value="0">低</a-option>
          <a-option :value="1">中</a-option>
          <a-option :value="2">高</a-option>
        </a-select>
        <a-select
          v-model="searchParams.equipmentId"
          placeholder="请选择设备"
          style="width: 200px"
          @change="handleSearch"
        >
          <a-option value="">全部设备</a-option>
          <a-option v-for="item in equipmentOptions" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-option>
        </a-select>
      </div>
      <a-button type="primary" @click="createOrder">
        <template #icon><icon-plus /></template>
        新建维修单
      </a-button>
    </div>

    <!-- 维修订单列表 -->
    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
      stripe
    >
      <template #columns>
        <a-table-column title="维修单号" data-index="code" />
        <a-table-column title="设备名称" data-index="equipmentName" />
        <a-table-column title="故障描述" data-index="faultDescription" />
        <a-table-column title="报修人" data-index="reportUserName" />
        <a-table-column title="维修人" data-index="repairUserName" />
        <a-table-column title="优先级" data-index="priority">
          <template #cell="{ record }">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityLabel(record.priority) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="维修状态" data-index="status">
          <template #cell="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="开始时间" data-index="startTime" />
        <a-table-column title="完成时间" data-index="finishTime">
          <template #cell="{ record }">
            {{ record.finishTime || '-' }}
          </template>
        </a-table-column>
        <a-table-column title="操作" width="320" fixed="right">
          <template #cell="{ record }">
            <a-space>
              <a-button 
                v-if="record.status === 0"
                type="text" 
                size="small"
                status="success"
                :loading="record.assigning"
                @click="openAssignModal(record)"
              >
                <template #icon><icon-user-add /></template>
                分配
              </a-button>
              <a-popconfirm
                v-if="record.status === 1"
                content="确认维修已完成？"
                @ok="handleUpdateProgress(record)"
              >
                <a-button 
                  type="text" 
                  size="small"
                  status="warning"
                  :loading="record.updating"
                >
                  <template #icon><icon-check-circle /></template>
                  完成维修
                </a-button>
              </a-popconfirm>
              <a-button type="text" size="small" @click="viewDetail(record)">
                <template #icon><icon-eye /></template>
                详情
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- 添加分配维修工弹窗 -->
    <a-modal
      v-model:visible="assignModalVisible"
      title="分配维修工"
      @ok="handleAssign"
      @cancel="cancelAssign"
      :ok-loading="assignLoading"
    >
      <a-form :model="assignForm" ref="assignFormRef">
        <a-form-item field="repairUserId" label="维修工" :rules="[{ required: true, message: '请选择维修工' }]">
          <a-select
            v-model="assignForm.repairUserId"
            placeholder="请选择维修工"
          >
            <a-option 
              v-for="worker in repairWorkers" 
              :key="worker.id" 
              :value="worker.id"
            >
              {{ worker.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <div class="mt-2 text-gray-600">
          分配后订单状态将变更为"维修中"
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconEye, 
  IconUserAdd,
  IconCheckCircle 
} from '@arco-design/web-vue/es/icon'

// 搜索参数
const searchParams = reactive({
  code: '',
  status: '',
  priority: '',
  equipmentId: ''
})

// 表格相关
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})

// 设备选项（模拟数据）
const equipmentOptions = ref([
  { id: 1, name: '数控机床A' },
  { id: 2, name: '数控机床B' },
  { id: 3, name: '车床C' }
])

// 状态工具函数
const getStatusLabel = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待维修',
    1: '维修中',
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

// 优先级工具函数
const getPriorityLabel = (priority: number) => {
  const priorityMap: Record<number, string> = {
    0: '低',
    1: '中',
    2: '高'
  }
  return priorityMap[priority] || '未知'
}

const getPriorityColor = (priority: number) => {
  const colorMap: Record<number, string> = {
    0: 'blue',
    1: 'orange',
    2: 'red'
  }
  return colorMap[priority] || 'default'
}

// 获取维修订单列表
const fetchMaintenanceList = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      ...searchParams
    }

    // 这里应该调用后端API
    // const res = await fetch(`/admin/repair-orders?${new URLSearchParams(params)}`)
    // const data = await res.json()

    // 模拟API响应数据
    const mockData = {
      code: 200,
      message: 'success',
      data: {
        total: 50,
        list: Array(10).fill(0).map((_, index) => ({
          orderId: index + 1,
          code: `R202403200${String(index + 1).padStart(2, '0')}`,
          equipmentName: ['数控机床A', '数控机床B', '车床C'][index % 3],
          faultDescription: '设备运行异常，需要维修',
          reportUserName: ['张三', '李四', '王五'][index % 3],
          repairUserName: ['维修工A', '维修工B', '维修工C'][index % 3],
          priority: index % 3,
          status: index % 3,
          startTime: '2024-03-20 10:00:00',
          finishTime: index % 3 === 2 ? '2024-03-21 10:00:00' : null
        }))
      }
    }

    // 更新表格数据
    if (mockData.code === 200) {
      tableData.value = mockData.data.list
      pagination.total = mockData.data.total
    } else {
      Message.error(mockData.message)
    }
  } catch (error) {
    Message.error('获取维修订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchMaintenanceList()
}

// 分页
const onPageChange = (page: number) => {
  pagination.current = page
  fetchMaintenanceList()
}

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  fetchMaintenanceList()
}

// 新建维修单
const createOrder = () => {
  Message.info('新建维修单功能开发中...')
}

// 查看详情
const viewDetail = (record: any) => {
  Message.info(`查看维修单 ${record.code} 的详细信息`)
}

// 分配相关
const assignModalVisible = ref(false)
const assignLoading = ref(false)
const currentOrder = ref<any>(null)
const assignFormRef = ref()
const assignForm = reactive({
  repairUserId: undefined
})

// 维修工列表（模拟数据）
const repairWorkers = ref([
  { id: 1, name: '维修工A' },
  { id: 2, name: '维修工B' },
  { id: 3, name: '维修工C' }
])

// 打开分配弹窗
const openAssignModal = (record: any) => {
  currentOrder.value = record
  assignModalVisible.value = true
  assignForm.repairUserId = undefined
}

// 取消分配
const cancelAssign = () => {
  assignModalVisible.value = false
  assignFormRef.value?.resetFields()
}

// 确认分配
const handleAssign = async () => {
  if (!currentOrder.value) return
  
  try {
    await assignFormRef.value?.validate()
    assignLoading.value = true
    
    // 获取选中的维修工信息
    const worker = repairWorkers.value.find(w => w.id === assignForm.repairUserId)
    if (!worker) {
      Message.error('维修工信息不存在')
      return
    }

    // 这里应该调用后端API
    // const res = await fetch(`/admin/repair-orders/${currentOrder.value.orderId}/assign`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ repairUserId: assignForm.repairUserId })
    // })
    // const data = await res.json()

    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockData = {
      code: 200,
      message: 'success',
      data: {
        orderId: currentOrder.value.orderId,
        repairUserName: worker.name,
        status: 1
      }
    }

    if (mockData.code === 200) {
      Message.success('分配成功')
      // 更新本地数据
      currentOrder.value.repairUserName = worker.name
      currentOrder.value.status = 1
      assignModalVisible.value = false
      // 刷新列表
      await fetchMaintenanceList()
    } else {
      Message.error(mockData.message)
    }
  } catch (error) {
    Message.error('分配失败')
  } finally {
    assignLoading.value = false
  }
}

// 更新维修进度
const handleUpdateProgress = async (record: any) => {
  try {
    record.updating = true
    
    // 这里应该调用后端API
    // const res = await fetch(`/admin/repair-orders/${record.orderId}/progress`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ status: 2 }) // 更新为已完成状态
    // })
    // const data = await res.json()

    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockData = {
      code: 200,
      message: 'success',
      data: {
        orderId: record.orderId,
        status: 2,
        finishTime: new Date().toLocaleString()
      }
    }

    if (mockData.code === 200) {
      // 更新本地数据
      record.status = mockData.data.status
      record.finishTime = mockData.data.finishTime
      
      Message.success({
        content: '维修完成',
        duration: 2000
      })
      
      // 刷新列表
      await fetchMaintenanceList()
    } else {
      Message.error(mockData.message)
    }
  } catch (error) {
    Message.error('更新维修进度失败')
  } finally {
    record.updating = false
  }
}

onMounted(() => {
  fetchMaintenanceList()
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

/* 添加一些新的样式 */
.arco-btn-text.arco-btn-status-warning {
  color: var(--warning-6);
}

.arco-btn-text.arco-btn-status-warning:hover {
  color: var(--warning-5);
}
</style> 