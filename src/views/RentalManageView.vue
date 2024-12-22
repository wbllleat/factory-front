<template>
  <div class="space-y-6">
    <!-- 搜索和操作区域 -->
    <div class="flex justify-between">
      <div class="flex gap-4">
        <a-input-search
          v-model="searchParams.code"
          placeholder="请输入订单编号"
          style="width: 200px"
          @search="handleSearch"
        />
        <a-input
          v-model="searchParams.userName"
          placeholder="请输入租赁人"
          style="width: 200px"
          @change="handleSearch"
        />
        <a-select
          v-model="searchParams.orderStatus"
          placeholder="请选择订单状态"
          style="width: 200px"
          @change="handleSearch"
        >
          <a-option value="">全部状态</a-option>
          <a-option :value="0">待支付</a-option>
          <a-option :value="1">租赁中</a-option>
          <a-option :value="2">已归还</a-option>
          <a-option :value="3">已取消</a-option>
        </a-select>
      </div>
      <a-button type="primary" @click="createOrder">
        <template #icon><icon-plus /></template>
        新建租赁
      </a-button>
    </div>

    <!-- 租赁订单列表 -->
    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
      stripe
    >
      <template #columns>
        <a-table-column title="订单编号" data-index="code" />
        <a-table-column title="租赁人" data-index="userName" />
        <a-table-column title="设备名称" data-index="equipmentName" />
        <a-table-column title="开始时间" data-index="startTime" />
        <a-table-column title="预计归还时间" data-index="expectedReturnTime" />
        <a-table-column title="实际归还时间" data-index="actualReturnTime">
          <template #cell="{ record }">
            {{ record.actualReturnTime || '-' }}
          </template>
        </a-table-column>
        <a-table-column title="租赁费用" data-index="leaseFee">
          <template #cell="{ record }">
            ¥{{ record.leaseFee.toFixed(2) }}
          </template>
        </a-table-column>
        <a-table-column title="押金" data-index="deposit">
          <template #cell="{ record }">
            ¥{{ record.deposit.toFixed(2) }}
          </template>
        </a-table-column>
        <a-table-column title="订单状态" data-index="orderStatus">
          <template #cell="{ record }">
            <a-tag :color="getOrderStatusColor(record.orderStatus)">
              {{ getOrderStatusLabel(record.orderStatus) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="押金状态" data-index="depositStatus">
          <template #cell="{ record }">
            <a-tag 
              :color="getDepositStatusColor(record.depositStatus)"
              class="font-medium"
            >
              {{ getDepositStatusLabel(record.depositStatus) }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作" width="280" fixed="right">
          <template #cell="{ record }">
            <a-space>
              <a-popconfirm
                content="确认设备已归还？此操作将退还押金"
                @ok="handleReturn(record)"
              >
                <a-button 
                  type="text" 
                  size="small"
                  :loading="record.returning"
                  status="success"
                >
                  <template #icon><icon-check /></template>
                  确认归还
                </a-button>
              </a-popconfirm>
              <a-popconfirm
                content="确定要取消此订单吗？"
                @ok="handleCancel(record)"
              >
                <a-button 
                  type="text" 
                  status="danger"
                  size="small"
                >
                  <template #icon><icon-close /></template>
                  取消
                </a-button>
              </a-popconfirm>
              <a-button 
                type="text" 
                size="small"
                @click="viewDetail(record)"
              >
                <template #icon><icon-eye /></template>
                详情
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconCheck, 
  IconClose, 
  IconEye 
} from '@arco-design/web-vue/es/icon'

// 搜索参数
const searchParams = reactive({
  code: '',
  userName: '',
  orderStatus: '',
})

// 表格相关
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
})

// 状态工具函数
const getOrderStatusLabel = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待支付',
    1: '租赁中',
    2: '已归还',
    3: '已取消'
  }
  return statusMap[status] || '未知状态'
}

const getOrderStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'orange',
    1: 'blue',
    2: 'green',
    3: 'red'
  }
  return colorMap[status] || 'default'
}

const getDepositStatusLabel = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '未退还',
    1: '已退还'
  }
  return statusMap[status] || '未知状态'
}

const getDepositStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'rgb(var(--orange-6))',
    1: 'rgb(var(--green-6))'
  }
  return colorMap[status] || 'default'
}

// 模拟获取租赁订单列表
const fetchRentalList = async () => {
  loading.value = true
  try {
    // 模拟订单数据
    const mockOrders = Array(10).fill(0).map((_, index) => ({
      orderId: index + 1,
      code: `L2024032000${index + 1}`,
      userName: ['张三', '李四', '王五'][index % 3],
      equipmentName: ['数控机床', '车床', '铣床'][index % 3],
      startTime: '2024-03-21 09:00:00',
      expectedReturnTime: '2024-03-28 09:00:00',
      actualReturnTime: index % 3 === 2 ? '2024-03-25 10:00:00' : null,
      leaseFee: 700.00 + index * 100,
      deposit: 1000.00,
      orderStatus: index % 4, // 0:待支付 1:租赁中 2:已归还 3:已取消
      depositStatus: index % 2 // 0:未退还 1:已退还
    }))

    // 搜索过滤
    let filteredData = [...mockOrders]
    if (searchParams.code) {
      filteredData = filteredData.filter(item => 
        item.code.toLowerCase().includes(searchParams.code.toLowerCase())
      )
    }
    if (searchParams.userName) {
      filteredData = filteredData.filter(item => 
        item.userName.includes(searchParams.userName)
      )
    }
    if (searchParams.orderStatus !== '') {
      filteredData = filteredData.filter(item => 
        item.orderStatus === Number(searchParams.orderStatus)
      )
    }

    // 分页处理
    pagination.total = filteredData.length
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)
  } catch (error) {
    Message.error('获取租赁订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchRentalList()
}

// 分页
const onPageChange = (page: number) => {
  pagination.current = page
  fetchRentalList()
}

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  fetchRentalList()
}

// 操作函数
const createOrder = () => {
  Message.info('新建租赁功能开发中...')
}

const handleReturn = async (record: any) => {
  try {
    record.returning = true
    // 这里应该调用后端API
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    // 更新订单状态和押金状态
    record.orderStatus = 2      // 已归还
    record.depositStatus = 1    // 已退还
    record.actualReturnTime = new Date().toLocaleString()
    
    Message.success({
      content: `设备 ${record.equipmentName} 归还成功，押金已退还`,
      duration: 2000
    })
    await fetchRentalList() // 刷新列表
  } catch (error) {
    Message.error('设备归还处理失败')
  } finally {
    record.returning = false
  }
}

const handleCancel = async (record: any) => {
  try {
    // 这里应该调用后端API
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    record.orderStatus = 3  // 已取消
    Message.success(`订单 ${record.code} 取消成功`)
    await fetchRentalList()
  } catch (error) {
    Message.error('订单取消失败')
  }
}

const viewDetail = (record: any) => {
  Message.info({
    content: `查看订单 ${record.code} 的详细信息`,
    duration: 2000
  })
  // 这里可以跳转到详情页或打开详情弹窗
}

onMounted(() => {
  fetchRentalList()
})
</script>

<style scoped>
/* 可以添加一些自定义样式来增强视觉效果 */
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