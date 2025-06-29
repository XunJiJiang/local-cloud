<script setup lang="ts">
const props = defineProps<{
  root: string
  path: string[]
}>()

const emits = defineEmits<{
  error: [Event]
  load: [Event]
}>()

const containerRef = useTemplateRef('container-ref')

defineExpose({
  scrollIntoView: (opt?: boolean | ScrollIntoViewOptions) => {
    containerRef.value?.scrollIntoView(opt)
  }
})

const src = `/api/preview-images?root=${encodeURIComponent(props.root)}&path=${props.path.map(encodeURIComponent).join('/')}`
</script>
<template>
  <div
    ref="container-ref"
    class="flex items-center justify-center overflow-hidden h-full w-full min-h-full"
  >
    <img
      :src="src"
      class="max-w-full object-contain max-h-full"
      @error="emits('error', $event)"
      @load="emits('load', $event)"
    />
  </div>
</template>
