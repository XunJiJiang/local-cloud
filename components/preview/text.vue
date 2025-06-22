<script setup lang="ts">
const props = defineProps<{
  root: string
  path: string[]
}>()
const text = ref('')

const { data, error } = await useFetch('/api/preview-text', {
  method: 'get',
  params: {
    root: encodeURIComponent(props.root),
    path: encodeURIComponent(props.path.join('/'))
  }
})

if (error.value) {
  console.error('Error fetching text content:', error.value)
  nextTick(() => navigateTo('/'))
} else {
  text.value = data.value.text || ''
}
</script>
<template>
  <pre v-if="!error">{{ text }}</pre>
  <div v-else style="color: red">{{ error }}</div>
</template>
