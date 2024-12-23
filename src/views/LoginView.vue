<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-lg">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">工厂设备管理系统</h2>
        <p class="mt-2 text-gray-600">请登录您的账号</p>
      </div>
      
      <a-form
        ref="formRef"
        :model="formData"
        class="mt-8 space-y-6"
        @submit="handleSubmit"
      >
        <a-form-item
          field="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
          hide-label
        >
          <a-input
            v-model="formData.username"
            placeholder="用户名"
            :style="{ width: '100%' }"
          >
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>
        
        <a-form-item
          field="password"
          :rules="[{ required: true, message: '请输入密码' }]"
          hide-label
        >
          <a-input-password
            v-model="formData.password"
            placeholder="密码"
            :style="{ width: '100%' }"
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>

        <div>
          <a-button
            type="primary"
            html-type="submit"
            long
            :loading="loading"
          >
            登录
          </a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 这里应该调用后端登录 API
    // const res = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(formData)
    // })
    // const data = await res.json()

    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockData = {
      code: 200,
      message: 'success',
      data: {
        token: 'mock_token',
        user: {
          id: '1',
          username: formData.username,
          name: 'admin',
          role: 'admin'
        }
      }
    }

    if (mockData.code === 200) {
      // 保存 token 和用户信息
      localStorage.setItem('token', mockData.data.token)
      localStorage.setItem('user', JSON.stringify(mockData.data.user))
      
      Message.success('登录成功')
      router.push('/')
    } else {
      Message.error(mockData.message)
    }
  } catch (error) {
    Message.error('用户名或密码错误')
  } finally {
    loading.value = false
  }
}
</script> 