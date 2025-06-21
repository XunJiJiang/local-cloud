<script setup lang="ts">
definePageMeta({ layout: 'preview' })
useHead({
  title: '文件预览'
})
const route = useRoute()
console.log('当前路由参数:', route)
</script>

<template>
  <div>
    <h1>文件预览</h1>
    <!-- 这里可以引入预览组件或实现 -->
    <div>这里是文件预览页面内容</div>
  </div>
</template>
