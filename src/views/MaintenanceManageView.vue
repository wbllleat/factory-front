<template>
  <div class="space-y-6">
    <h2>维修管理</h2>
    <a-table :columns="columns" :data="data">
    </a-table>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: '维修单号', dataIndex: 'id' },
  { title: '设备名称', dataIndex: 'equipmentName' },
  { title: '维修状态', dataIndex: 'status' }
]
const data = []
</script> 