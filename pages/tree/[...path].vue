<script setup lang="ts">
definePageMeta({ layout: 'tree' })
useHead({
  title: '文件树'
})
const route = useRoute()
console.log('Current route:', route.params.path)
const paramPath = Array.isArray(route.params.path) ? route.params.path : [route.params.path]
const { data, error } = await useFetch('/api/list-folder-files', {
  method: 'POST',
  body: {
    root: paramPath[0] ?? '',
    path: paramPath.slice(1)
  }
})

const sortedItems = [
  ...(data.value?.folders ?? [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name }) => ({
      label: name,
      to: `/tree/${[...paramPath, name].join('/')}`
    })),
  ...(data.value?.files ?? [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name }) => ({
      label: name,
      to: `/preview/${[...paramPath, name].join('/')}`
    }))
]

if (error.value) {
  nextTick(() => navigateTo('/'))
  console.error('Error fetching folder files:', error.value)
}
</script>

<template>
  <div>
    <TreeList :items="sortedItems" />
  </div>
</template>
