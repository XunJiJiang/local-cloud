<script setup lang="ts">
const route = useRoute()

const paramPath = computed(() =>
  Array.isArray(route.params.path) ? [...route.params.path] : [route.params.path]
)

const isPreview = useState('isPreview', () => false)

const nav = reactive({
  root: paramPath.value[0] ?? '',
  path: paramPath.value.slice(1).join('/'),
  left: {
    label: '',
    to: ''
  },
  right: {
    label: '',
    to: ''
  }
})

const mainRef = useTemplateRef('main-ref')

watch(route, () => {
  if (mainRef.value) {
    mainRef.value.scrollTop = 0
  }
})

watch([isPreview, route], async ([isPreview, route]) => {
  const paramPath = Array.isArray(route.params.path) ? [...route.params.path] : [route.params.path]

  if (!isPreview) return
  const [data, error] = await tryCatch(
    async () =>
      await $fetch('/api/list-folder-files', {
        method: 'POST',
        body: {
          root: paramPath[0] ?? '',
          path: paramPath.slice(1, paramPath.length - 1)
        }
      })
  )

  if (error) {
    console.error('Error fetching folder files:', error)
    return
  }

  nav.root = paramPath[0] ?? ''
  nav.path = paramPath.slice(1).join('/')

  data.files.sort((a, b) => a.name.localeCompare(b.name))

  for (let i = 0; i < data.files.length; i++) {
    const { name } = data.files[i]
    if (paramPath[paramPath.length - 1] === name) {
      nav.left.label = i > 0 ? data.files[i - 1].name : ''
      nav.left.to =
        i > 0
          ? `/preview/${[...paramPath.slice(0, -1), encodeURIComponent(data.files[i - 1].name)].join('/')}`
          : ''
      nav.right.label = i < data.files.length - 1 ? data.files[i + 1].name : ''
      nav.right.to =
        i < data.files.length - 1
          ? `/preview/${[...paramPath.slice(0, -1), encodeURIComponent(data.files[i + 1].name)].join('/')}`
          : ''
    }
  }
})
</script>

<template>
  <div class="min-h-screen min-w-[300px] w-screen h-screen flex flex-col">
    <header
      class="h-12 bg-gray-100 text-gray-600 items-center px-8 text-[13px] font-bold shadow flex-shrink-0 flex whitespace-nowrap"
    >
      <h1>
        <NuxtLink
          :to="'/tree/' + paramPath.slice(0, -1).join('/')"
          class="px-2 py-1 rounded text-gray-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
          style="background: none; border: none"
          >本地云 · Local Cloud</NuxtLink
        >
      </h1>
      <nav v-if="isPreview" class="ml-auto">
        <NuxtLink
          v-if="nav.left.label"
          :to="nav.left.to"
          class="px-2 py-1 rounded text-gray-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
          style="background: none; border: none"
        >
          &lt; {{ nav.left.label }}
        </NuxtLink>
        |
        <NuxtLink
          v-if="nav.right.label"
          :to="nav.right.to"
          class="px-2 py-1 rounded text-gray-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
          style="background: none; border: none"
        >
          {{ nav.right.label }} &gt;
        </NuxtLink>
      </nav>
    </header>
    <main ref="main-ref" class="flex-1 min-h-0 overflow-auto">
      <slot />
    </main>
    <footer
      class="h-11 text-gray-400 flex items-center justify-center text-[11px] bg-transparent flex-shrink-0"
    >
      © 2025 本地云
    </footer>
  </div>
</template>
