<script setup lang="ts">
const props = defineProps<{
  root: string
  path: string[]
}>()
const text = ref('')

const { data, error } = await useFetch('/api/preview-text', {
  method: 'get',
  params: {
    root: props.root,
    path: props.path.join('/')
  }
})

if (error.value) {
  throw createError(error.value)
} else {
  console.log('Text content fetched successfully:', data.value?.extension)
  text.value = data.value?.text || ''
}
</script>
<template>
  <pre v-if="!error">{{ text }}</pre>
  <div v-else style="color: red">{{ error }}</div>
</template>
