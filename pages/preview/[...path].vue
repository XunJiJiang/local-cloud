<script setup lang="ts">
definePageMeta({ layout: 'preview' })
useHead({
  title: '文件预览'
})
const route = useRoute()
const paramPath = Array.isArray(route.params.path) ? route.params.path : [route.params.path]

const isPreview = useState('isPreview', () => true)

onMounted(() => {
  isPreview.value = true
})
</script>

<template>
  <ThePreview :root="paramPath[0] ?? ''" :path="paramPath.slice(1)" />
</template>
