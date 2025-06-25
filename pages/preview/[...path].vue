<script setup lang="ts">
import { useHeaderNav } from '~/stores/header-nav'
definePageMeta({ layout: 'preview' })
useHead({
  title: '文件预览'
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
    path: paramPath.value.slice(1, -1)
  }
})

if (error.value) {
  throw createError(error.value)
}

const headerNav = useHeaderNav()

const thisFileIdx =
  data.value?.files
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((acc, file, idx) => {
      if (file.name === paramPath.value[paramPath.value.length - 1]) {
        return idx
      }
      return acc
    }, -1) ?? -1

onMounted(() => {
  headerNav.setHeaderNav([])

  if (thisFileIdx > 0)
    headerNav.addHeaderNavItem({
      key: 'preview2prev',
      label: '<',
      to: `/preview/${paramPath.value
        .slice(0, -1)
        .map((item) => encodeURIComponent(item))
        .join('/')}/${encodeURIComponent(data.value?.files[thisFileIdx - 1].name ?? '')}`,
      type: 'link'
    })

  if (thisFileIdx < (data.value?.files.length ?? 0) - 1)
    headerNav.addHeaderNavItem({
      key: 'preview2next',
      label: '>',
      to: `/preview/${paramPath.value
        .slice(0, -1)
        .map((item) => encodeURIComponent(item))
        .join('/')}/${encodeURIComponent(data.value?.files[thisFileIdx + 1].name ?? '')}`,
      type: 'link'
    })
})
</script>

<template>
  <ThePreview :root="paramPath[0] ?? ''" :path="paramPath.slice(1)" />
</template>
