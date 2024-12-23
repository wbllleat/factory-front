<template>
  <div class="space-y-6">
    <!-- 统计卡片区域 -->
    <div class="grid grid-cols-4 gap-4">
      <a-card class="bg-blue-50">
        <template #title>
          <div class="flex items-center gap-2">
            <icon-computer class="text-blue-600" />
            <span>设备总数</span>
          </div>
        </template>
        <div class="text-2xl font-bold text-blue-600">{{ statistics.totalEquipment }}</div>
        <div class="text-gray-500 text-sm">台设备</div>
      </a-card>

      <a-card class="bg-green-50">
        <template #title>
          <div class="flex items-center gap-2">
            <icon-play-circle class="text-green-600" />
            <span>使用中</span>
          </div>
        </template>
        <div class="text-2xl font-bold text-green-600">{{ statistics.inUseCount }}</div>
        <div class="text-gray-500 text-sm">台设备</div>
      </a-card>

      <a-card class="bg-orange-50">
        <template #title>
          <div class="flex items-center gap-2">
            <icon-tool class="text-orange-600" />
            <span>维修中</span>
          </div>
        </template>
        <div class="text-2xl font-bold text-orange-600">{{ statistics.maintenanceCount }}</div>
        <div class="text-gray-500 text-sm">台设备</div>
      </a-card>

      <a-card class="bg-gray-50">
        <template #title>
          <div class="flex items-center gap-2">
            <icon-pause-circle class="text-gray-600" />
            <span>空闲中</span>
          </div>
        </template>
        <div class="text-2xl font-bold text-gray-600">{{ statistics.idleCount }}</div>
        <div class="text-gray-500 text-sm">台设备</div>
      </a-card>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-2 gap-6">
      <!-- 设备使用率饼图 -->
      <a-card title="设备使用状态分布">
        <div ref="usageChartRef" style="height: 400px"></div>
      </a-card>

      <!-- 设备类型使用率柱状图 -->
      <a-card title="各类设备使用率">
        <div ref="categoryChartRef" style="height: 400px"></div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import * as echarts from 'echarts'
import { 
  IconComputer,
  IconPlayCircle,
  IconTool,
  IconPauseCircle 
} from '@arco-design/web-vue/es/icon'

// 图表实例
const usageChartRef = ref()
const categoryChartRef = ref()
let usageChart: echarts.ECharts
let categoryChart: echarts.ECharts

// 统计数据
const statistics = reactive({
  totalEquipment: 0,
  inUseCount: 0,
  maintenanceCount: 0,
  idleCount: 0,
  usageRate: 0,
  categoryUsage: [] as any[]
})

// 获取统计数据
const fetchStatistics = async () => {
  try {
    // 这里应该调用后端API
    // const res = await fetch('/admin/statistics/equipment-usage?startDate=2024-03-01&endDate=2024-03-20')
    // const data = await res.json()

    // 模拟数据
    const mockData = {
      code: 200,
      message: 'success',
      data: {
        totalEquipment: 100,
        inUseCount: 30,
        maintenanceCount: 10,
        idleCount: 60,
        usageRate: 0.3,
        categoryUsage: [
          { categoryName: '加工设备', count: 50, usageRate: 0.4 },
          { categoryName: '检测设备', count: 30, usageRate: 0.3 },
          { categoryName: '包装设备', count: 20, usageRate: 0.2 }
        ]
      }
    }

    if (mockData.code === 200) {
      Object.assign(statistics, mockData.data)
      initCharts()
    }
  } catch (error) {
    Message.error('获取统计数据失败')
  }
}

// 初始化图表
const initCharts = () => {
  // 初始化设备使用率饼图
  usageChart = echarts.init(usageChartRef.value)
  usageChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: statistics.inUseCount, name: '使用中', itemStyle: { color: '#10B981' } },
          { value: statistics.maintenanceCount, name: '维修中', itemStyle: { color: '#F97316' } },
          { value: statistics.idleCount, name: '空闲中', itemStyle: { color: '#6B7280' } }
        ]
      }
    ]
  })

  // 初始化设备类型使用率柱状图
  categoryChart = echarts.init(categoryChartRef.value)
  categoryChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: statistics.categoryUsage.map(item => item.categoryName)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '使用率',
        type: 'bar',
        data: statistics.categoryUsage.map(item => (item.usageRate * 100).toFixed(1)),
        itemStyle: {
          color: '#60A5FA'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }
    ]
  })
}

// 监听窗口大小变化
const handleResize = () => {
  usageChart?.resize()
  categoryChart?.resize()
}

onMounted(() => {
  fetchStatistics()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  usageChart?.dispose()
  categoryChart?.dispose()
})
</script>
