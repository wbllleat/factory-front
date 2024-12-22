<template>
  <div class="space-y-6">
    <h2>设备管理</h2>
    <a-table :columns="columns" :data="data">
    </a-table>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: '设备名称', dataIndex: 'name' },
  { title: '设备状态', dataIndex: 'status' }
]
const data = []
</script> 