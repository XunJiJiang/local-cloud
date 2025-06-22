<script setup lang="ts">
const props = defineProps<{
  root: string
  path: string[]
}>()
const src = `/api/preview-images?root=${encodeURIComponent(props.root)}&path=${encodeURIComponent(props.path.join('/'))}`
</script>
<template>
  <img :src="src" style="max-width: 100%; max-height: 100%; object-fit: contain" />
</template>
