<script setup lang="ts">
import { useHeaderNav } from '~/stores/header-nav'
definePageMeta({ layout: 'tree' })
useHead({
  title: '文件树'
})
const route = useRoute()

const paramPath = computed(() =>
  Array.isArray(route.params.path)
    ? [...route.params.path]
    : route.params.path
      ? [route.params.path]
      : []
)

const { data, error } = await useFetch('/api/list-folder-files', {
  method: 'POST',
  body: {
    root: paramPath.value[0] ?? '',
    path: paramPath.value.slice(1)
  }
})

const isPreview = useState('isPreview', () => true)

onMounted(() => {
  isPreview.value = false
})

const hasReadme = ref(false)

// 由于每次切换路由时都会重新渲染组件，因此不需要使用 computed
const sortedItems = [
  ...(data.value?.folders ?? [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name }) => ({
      label: name,
      to: `/tree/${[...paramPath.value.map((item) => encodeURIComponent(item)), encodeURIComponent(name)].join('/')}`
    })),
  ...(data.value?.files ?? [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name }) => {
      if (name === 'README.md') {
        hasReadme.value = true
      }

      return {
        label: name,
        to: `/preview/${[...paramPath.value.map((item) => encodeURIComponent(item)), encodeURIComponent(name)].join('/')}`
      }
    })
]

const headerNav = useHeaderNav()

onMounted(() => {
    headerNav.setHeaderNav([])
})

if (error.value) {
  throw createError(error.value)
}
</script>

<template>
  <div class="justify-center max-w-[800px] mx-auto bg-blue px-0 py-10">
    <TreeList :items="sortedItems" />
    <PreviewText
      v-if="hasReadme"
      :root="encodeURIComponent(paramPath[0])"
      :path="[...paramPath.slice(1).map(encodeURIComponent), 'README.md']"
    />
  </div>
</template>
