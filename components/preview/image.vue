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
  <div ref="container-ref" class="flex items-center justify-center overflow-hidden">
    <img
      :src="src"
      class="max-w-screen object-contain max-h-[calc(100vh-94px)] h-[calc(100vh-94px)]"
      @error="emits('error', $event)"
      @load="emits('load', $event)"
    />
  </div>
</template>
