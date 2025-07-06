<script setup lang="ts">
definePageMeta({ layout: 'preview' })
useHead({
  title: '文件预览'
})
const paramPath = useParamPath()

const pageConfig = await usePageConfig()

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

const direction = await usePreviewPageTurnDirection()

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
    ? `/${pageConfig.value.page.preview}/preview/${paramPath.value
        .slice(0, -1)
        .map((item) => encodeURIComponent(item))
        .join('/')}/${encodeURIComponent(data.value?.files[thisFileIdx - 1].name ?? '')}`
    : null,
  thisFileIdx < (data.value?.files.length ?? 0) - 1
    ? `/${pageConfig.value.page.preview}/preview/${paramPath.value
        .slice(0, -1)
        .map((item) => encodeURIComponent(item))
        .join('/')}/${encodeURIComponent(data.value?.files[thisFileIdx + 1].name ?? '')}`
    : null
]

const leftTo =
  direction.value === 'left2right'
    ? thisFileIdx > 0
      ? prevTo
      : null
    : thisFileIdx < (data.value?.files.length ?? 0) - 1
      ? nextTo
      : null

const rightTo =
  direction.value === 'left2right'
    ? thisFileIdx < (data.value?.files.length ?? 0) - 1
      ? nextTo
      : null
    : thisFileIdx > 0
      ? prevTo
      : null

useWindowEvent('keyup', async (e) => {
  // 当仅按下左、右键时，切换页面
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
    return
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    if (leftTo && e.key === 'ArrowLeft') {
      navigateTo(leftTo)
    } else if (rightTo && e.key === 'ArrowRight') {
      navigateTo(rightTo)
    }
  }
})

onMounted(async () => {
  headerNav.setHeaderNav([])

  headerNav.addHeaderNavItem({
    key: 'preview4index',
    type: 'label',
    label: `${thisFileIdx + 1} / ${data.value?.files.length ?? 0}`
  })

  if (leftTo)
    headerNav.addHeaderNavItem({
      key: 'preview2prev',
      label: '<',
      to: leftTo,
      type: 'link'
    })

  if (rightTo)
    headerNav.addHeaderNavItem({
      key: 'preview2next',
      label: '>',
      to: rightTo,
      type: 'link'
    })
})
</script>

<template>
  <ThePreview :root="encodeURIComponent(paramPath[0])" :path="paramPath.slice(1)" />
</template>
