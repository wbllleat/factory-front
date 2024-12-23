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
        
        <a-menu-item key="users" @click="router.push('/users')">
          <template #icon><icon-user /></template>
          用户管理
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
        
        <a-menu-item key="inspection" @click="router.push('/inspection')">
          <template #icon><icon-scan /></template>
          巡检管理
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
          <a-dropdown>
            <div class="flex items-center gap-2 cursor-pointer">
              <a-avatar>
                <icon-user />
              </a-avatar>
              <span>{{ userInfo.name }}</span>
              <icon-down />
            </div>
            <template #content>
              <a-doption @click="handleLogout">
                <template #icon><icon-export /></template>
                退出登录
              </a-doption>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      
      <a-layout-content class="p-6">
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconHome,
  IconUser,
  IconComputer,
  IconTool,
  IconCalendar,
  IconScan,
  IconMenuFold,
  IconMenuUnfold,
  IconDown,
  IconExport
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const userInfo = ref({
  name: '管理员'
})

// 获取用户信息
onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    userInfo.value = JSON.parse(user)
  }
})

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  Message.success('已退出登录')
  router.push('/login')
}
</script> 