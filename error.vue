<script setup lang="ts">
import type { NuxtError } from '#app'

const { error } = defineProps({
  error: {
    type: Object as () => NuxtError,
    required: true
  }
})

console.error(error)

function goBack() {
  if (window && window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/')
  }
}

function goHome() {
  navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-10">
    <div
      class="bg-white rounded-lg shadow-lg p-8 w-full border border-gray-200 max-w-[800px] min-w-[300px] mx-auto bg-blue px-10 py-10"
    >
      <h1 class="text-2xl font-bold text-red-600 mb-2">出错了</h1>
      <div v-if="'url' in error" class="mb-2 text-gray-700">
        <b>URL:</b> <span class="break-all">{{ error?.url ?? $route?.fullPath ?? '-' }}</span>
      </div>
      <div class="mb-2 text-gray-700">
        <b>Status:</b> <span>{{ error.statusCode || '-' }}</span>
      </div>
      <div class="mb-2 text-gray-700">
        <b>Message:</b> <span>{{ error.message || error.statusMessage || '-' }}</span>
      </div>
      <div
        v-if="error.stack"
        class="mb-4 text-xs text-gray-400 whitespace-pre-wrap bg-gray-100 rounded p-2 overflow-x-auto"
      >
        <b>Stack:</b>\n{{ error.stack }}
      </div>
      <button
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        @click="goBack"
      >
        返回上一页
      </button>
      <button
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ms-2"
        @click="goHome"
      >
        返回首页
      </button>
    </div>
  </div>
</template>
