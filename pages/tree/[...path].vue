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

/** 当前目录只有一个子文件夹，且这个子文件夹内都是图片 */
const [isSingleFolderWithImages, childFiles] = await (async () => {
  if (data.value?.folders.length !== 1 || data.value?.files.length !== 0) return [false, []]

  const [childData, error] = await tryCatch(
    async () =>
      await $fetch('/api/list-folder-files', {
        method: 'POST',
        body: {
          root: paramPath.value[0] ?? '',
          path: paramPath.value
            .slice(1)
            .concat(data.value?.folders[0].name ?? '')
            .filter(Boolean)
        }
      })
  )
  if (error) return [false, []]
  if (childData.folders.length !== 0) return [false, []]

  return [
    childData.files.every((file: { name: string }) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
    ),
    childData.files.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name))
  ]
})()

const headerNav = useHeaderNav()

const previewImages = useTemplateRef('preview-image')

const scrollToFirstImage = debounce(() => {
  if (isSingleFolderWithImages && previewImages.value) {
    previewImages.value[0]?.scrollIntoView()
  }
}, 100)

onMounted(() => {
  if (isSingleFolderWithImages) {
    // 如果是单个文件夹且里面都是图片，使用 store 保存滚动位置
    headerNav.setHeaderNav([
      {
        key: 'preview-in-tree',
        label: '>',
        type: 'button'
      }
    ])
    scrollToFirstImage()
  } else {
    headerNav.setHeaderNav([])
  }
})

if (isSingleFolderWithImages) {
  watch(
    () => headerNav.headerNavEmit?.get('preview-in-tree'),
    (v) => {
      if (typeof v === 'number') scrollToFirstImage()
    }
  )
}

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
    <div v-if="isSingleFolderWithImages" class="my-6 overflow-x-auto max-w-full">
      <div class="inline-flex flex-row-reverse overflow-x-auto">
        <PreviewImage
          v-for="item in childFiles"
          ref="preview-image"
          :key="item.name"
          :root="encodeURIComponent(paramPath[0])"
          :path="paramPath.slice(1).concat([data?.folders[0].name ?? '', item.name])"
          @load="scrollToFirstImage"
        />
      </div>
    </div>
  </div>
</template>
