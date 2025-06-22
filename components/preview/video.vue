<script setup lang="ts">
const props = defineProps<{
  root: string
  path: string[]
}>()
const src = computed(
  () =>
    `/api/preview-video?root=${encodeURIComponent(props.root)}&path=${encodeURIComponent(props.path.join('/'))}`
)
</script>
<template>
  <video :src="src" controls style="max-width: 100%; max-height: 100%; object-fit: contain"></video>
</template>
