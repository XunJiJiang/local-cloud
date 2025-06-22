<script setup lang="ts">
const props = defineProps<{
  root: string
  path: string[]
  totalChunks: number
  size: number
  duration?: number
}>()

const audioRef = useTemplateRef('audio-ref')

console.log('Audio preview component initialized', props)
</script>
<template>
  <audio ref="audio-ref" controls style="width: 100%"></audio>
</template>
