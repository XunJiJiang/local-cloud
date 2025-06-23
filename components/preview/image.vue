<script setup lang="ts">
const props = defineProps<{
  root: string
  path: string[]
}>()
const src = `/api/preview-images?root=${encodeURIComponent(props.root)}&path=${encodeURIComponent(props.path.join('/'))}`
</script>
<template>
  <div class="flex items-center justify-center overflow-hidden">
    <img :src="src" class="max-w-full object-contain max-h-[calc(100vh-94px)]" />
  </div>
</template>
