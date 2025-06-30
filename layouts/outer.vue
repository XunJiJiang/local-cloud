<script setup lang="ts">
import { useHeaderNav } from '~/stores/header-nav'
import { useGlobalState } from '~/stores/global-state'
const route = useRoute()

const paramPath = computed(() =>
  Array.isArray(route.params.path)
    ? [...route.params.path]
    : route.params.path
      ? [route.params.path]
      : []
)

const headerNav = useHeaderNav()

const globalState = useGlobalState()

const isImgPreview = computed(() => globalState.previewState.previewType === 'image')

const mainRef = useTemplateRef('main-ref')

watch(route, () => {
  if (mainRef.value) {
    mainRef.value.scrollTop = 0
  }
})

const prevLink = computed(() => {
  const prevPath = paramPath.value.slice(0, -1)
  return prevPath.length > 0 ? `/tree/${prevPath.map(encodeURIComponent).join('/')}` : '/'
})
</script>

<template>
  <div class="min-h-full min-w-[300px] w-full h-full relative">
    <header
      class="h-12 bg-gray-100 text-gray-600 items-center px-8 text-[13px] font-bold shadow flex whitespace-nowrap fixed top-0 left-0 w-full z-1001"
    >
      <h1>
        <NuxtLink
          :to="prevLink"
          class="px-2 py-1 rounded text-gray-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
          style="background: none; border: none"
          >本地云 · Local Cloud</NuxtLink
        >
      </h1>
      <client-only>
        <nav v-if="headerNav.headerNav.length > 0" class="ml-auto">
          <template v-for="item in headerNav.headerNav">
            <NuxtLink
              v-if="item.type === 'link'"
              :key="item.key + 'link'"
              :to="item.to ?? ''"
              class="bg-transparent border-none px-2 py-1 rounded text-gray-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors cursor-pointer"
              >{{ item.label }}</NuxtLink
            >
            <button
              v-else-if="item.type === 'button'"
              :key="item.key + 'button'"
              class="bg-transparent border-none px-2 py-1 rounded text-gray-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors cursor-pointer"
              @click="headerNav.triggerHeaderNavEvent(item.key)"
            >
              {{ item.label }}
            </button>
            <span
              v-else-if="item.type === 'label'"
              :key="item.key + 'label'"
              class="bg-transparent border-none px-2 py-1 rounded text-gray-600"
              >{{ item.label }}</span
            >
          </template>
        </nav>
      </client-only>
    </header>
    <main
      ref="main-ref"
      :class="['min-h-full', 'pb-11', 'pt-12', isImgPreview ? 'flex max-h-full' : '']"
    >
      <slot />
    </main>
    <footer
      class="h-11 text-gray-400 flex items-center justify-center text-[11px] flex-shrink-0 fixed bottom-0 left-0 bg-white w-full z-1001"
    >
      <span v-if="paramPath.length === 0">© 2025 本地云</span>
      <TheBreadcrumb
        v-else
        :path="paramPath.slice(0, route.meta.layout === 'preview' ? -1 : void 0)"
        root="tree"
      />
    </footer>
  </div>
</template>
