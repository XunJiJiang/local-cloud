<script setup lang="ts">
const props = defineProps<{
  root: string
  path: string[]
  totalChunks: number
  size: number
}>()
const src = computed(
  () =>
    `/api/preview-video?root=${encodeURIComponent(props.root)}&path=${encodeURIComponent(props.path.join('/'))}&index=0`
)
</script>
<template>
  <video :src="src" controls style="max-width: 100%; max-height: 100%; object-fit: contain"></video>
</template>
