<template>
  <a-layout class="h-screen">
    <!-- 侧边栏 -->
    <a-layout-sider
      :collapsed="collapsed"
      collapsible
      class="h-full bg-[#001529]"
    >
      <div class="text-white p-4 text-xl">工厂设备管理平台</div>
      
      <a-menu
        :default-selected-keys="[route.name as string]"
        :style="{ width: '100%' }"
        mode="vertical"
        theme="dark"
      >
        <a-menu-item key="home" @click="router.push('/')">
          <template #icon><icon-home /></template>
          首页
        </a-menu-item>
        
        <a-menu-item key="equipment" @click="router.push('/equipment')">
          <template #icon><icon-computer /></template>
          设备管理
        </a-menu-item>
        
        <a-menu-item key="maintenance" @click="router.push('/maintenance')">
          <template #icon><icon-tool /></template>
          维修管理
        </a-menu-item>
        
        <a-menu-item key="rental" @click="router.push('/rental')">
          <template #icon><icon-calendar /></template>
          租赁管理
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout>
      <a-layout-header class="bg-white px-4 flex items-center justify-between">
        <a-button type="text" @click="collapsed = !collapsed">
          <template #icon>
            <icon-menu-fold v-if="collapsed" />
            <icon-menu-unfold v-else />
          </template>
        </a-button>
        
        <div class="flex items-center gap-4">
          <a-avatar>
            <icon-user />
          </a-avatar>
          <span>管理员</span>
        </div>
      </a-layout-header>
      
      <a-layout-content class="p-6">
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  IconHome,
  IconUser,
  IconComputer,
  IconTool,
  IconCalendar,
  IconMenuFold,
  IconMenuUnfold
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
</script> 