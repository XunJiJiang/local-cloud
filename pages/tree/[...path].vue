<script setup lang="ts">
definePageMeta({ layout: 'tree' })
useHead({
  title: '文件树'
})
const route = useRoute()
const paramPath = Array.isArray(route.params.path) ? route.params.path : [route.params.path]
const { data, error } = await useFetch('/api/list-folder-files', {
  method: 'POST',
  body: {
    root: paramPath[0] ?? '',
    path: paramPath.slice(1)
  }
})

const hasReadme = ref(false)

const sortedItems = [
  ...(data.value?.folders ?? [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name }) => ({
      label: name,
      to: `/tree/${[...paramPath.map((item) => encodeURIComponent(item)), encodeURIComponent(name)].join('/')}`
    })),
  ...(data.value?.files ?? [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name }) => {
      if (name === 'README.md') {
        hasReadme.value = true
      }

      return {
        label: name,
        to: `/preview/${[...paramPath.map((item) => encodeURIComponent(item)), encodeURIComponent(name)].join('/')}`
      }
    })
]

if (error.value) {
  nextTick(() => navigateTo('/'))
  console.error('Error fetching folder files:', error.value)
}
</script>

<template>
  <div class="justify-center max-w-[800px] mx-auto bg-blue px-0 py-10">
    <TreeList :items="sortedItems" />
    <PreviewText
      v-if="hasReadme"
      :root="encodeURIComponent(paramPath[0])"
      :path="[...paramPath.slice(1).map((item) => encodeURIComponent(item)), 'README.md']"
    />
  </div>
</template>
