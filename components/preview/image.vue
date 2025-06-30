<script setup lang="ts">
const route = useRoute()
const paramPath = computed(() =>
  Array.isArray(route.params.path)
    ? [...route.params.path]
    : route.params.path
      ? [route.params.path]
      : []
)

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

const { data, error } = await useFetch('/api/list-folder-files', {
  method: 'POST',
  body: {
    root: paramPath.value[0] ?? '',
    path: paramPath.value.slice(1, -1)
  }
})

if (error.value) {
  throw createError(error.value)
}

const thisFileIdx =
  data.value?.files
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((acc, file, idx) => {
      if (file.name === paramPath.value[paramPath.value.length - 1]) {
        return idx
      }
      return acc
    }, -1) ?? -1

const [prevTo, nextTo] = [
  thisFileIdx > 0
    ? `/preview/${paramPath.value
        .slice(0, -1)
        .map((item) => encodeURIComponent(item))
        .join('/')}/${encodeURIComponent(data.value?.files[thisFileIdx - 1].name ?? '')}`
    : null,
  thisFileIdx < (data.value?.files.length ?? 0) - 1
    ? `/preview/${paramPath.value
        .slice(0, -1)
        .map((item) => encodeURIComponent(item))
        .join('/')}/${encodeURIComponent(data.value?.files[thisFileIdx + 1].name ?? '')}`
    : null
]

const clickHandler = (e: TouchEvent) => {
  console.log(e.touches.length)
  if (e.touches.length !== 1) return

  if (thisFileIdx > 0 && e.touches[0].clientX < window.innerWidth / 2) {
    navigateTo(prevTo)
  } else if (
    thisFileIdx < (data.value?.files.length ?? 0) - 1 &&
    e.touches[0].clientX >= window.innerWidth / 2
  ) {
    navigateTo(nextTo)
  }
}
</script>
<template>
  <div
    ref="container-ref"
    class="flex items-center justify-center overflow-hidden h-full w-full min-h-full"
  >
    <img
      :src="src"
      draggable="false"
      class="max-w-full object-contain max-h-full relative"
      @error="emits('error', $event)"
      @load="emits('load', $event)"
      @touchstart="clickHandler"
    />
  </div>
</template>
