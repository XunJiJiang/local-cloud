<script setup lang="ts">
const props = defineProps<{
  root: string
  path: string[]
}>()

const audioUrl = computed(() => {
  const root = encodeURIComponent(props.root)
  const path = encodeURIComponent(props.path.join('/'))
  return `/api/preview-audio?root=${root}&path=${path}`
})
</script>
<template>
  <audio :src="audioUrl" controls style="width: 100%"></audio>
</template>
