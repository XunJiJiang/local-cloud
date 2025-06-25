<script lang="ts">
const ITEM_MIN_WIDTH = 64
/** > 符号的宽度 */
const SPLIT_SYMBOL_WIDTH = 15
/** 跟元素padding宽度 */
const PADDING_WIDTH = 20
</script>

<script setup lang="ts">
const { path, root = '' } = defineProps<{ path: string[]; root?: string }>()

const containerRef = useTemplateRef('container-ref')

const visibleBreadcrumbs = computed(() => {
  return path.length > 0
})

const pathInfo = computed(() => {
  return path
    .map((seg) => {
      return {
        segPath: seg,
        width: getStringWidth(seg, {
          fontFamily:
            'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          fontSize: '11px',
          fontWeight: '400',
          fontStyle: 'normal'
        })
      }
    })
    .filter(({ segPath }) => segPath !== '')
})

const realIndexes = ref<
  {
    type: 'segment' | 'ellipsis'
    segPath: string
    path: string
    width: number
    isFullDisplay: boolean
  }[]
>([])

function calcVisible() {
  if (!containerRef.value || !visibleBreadcrumbs.value) return
  const containerWidth = parseFloat(getComputedStyle(containerRef.value).width) - PADDING_WIDTH

  // 每个 segment 的最小宽度
  const minWidths = pathInfo.value.map((item) => Math.min(ITEM_MIN_WIDTH, item.width))
  // 每个项的实际宽度
  const realWidths = pathInfo.value.map(({ width }) => width)
  const totalMinWidth = minWidths.reduce((a, b) => a + b + SPLIT_SYMBOL_WIDTH, 0)
  const segCount = pathInfo.value.length

  // 全部最小宽度能显示时, 尝试均分剩余宽度
  if (totalMinWidth <= containerWidth) {
    const widths = Array<number>(segCount).fill(0)
    let remainWidth = containerWidth

    function distributeWidth() {
      /** 第一个未分配项的索引 */
      let firstUnassignedIndex = 0
      /** 未分配项的数量 */
      const noWidthCount = widths.filter((w, i) => {
        if (firstUnassignedIndex === 0 && w === 0) {
          firstUnassignedIndex = i
        }
        return w === 0
      }).length
      /** 除第一个未分配的项外，其余项的预计平均宽度，向下取整 */
      const avgWidth = Math.floor(remainWidth / noWidthCount)
      /** 第一个未分配的项的预计宽度 */
      const firstWidth = containerWidth - avgWidth * (noWidthCount - 1)
      /** 是否有某项的实际宽度小于预计宽度 */
      let hasSomeItemWidthWiderThanMin = false
      // 为未分配且实际宽度小于预计宽度的项分配实际宽度
      for (let i = 0; i < segCount; i++) {
        if (widths[i] === 0 && realWidths[i] < (i === 0 ? firstWidth : avgWidth)) {
          widths[i] = realWidths[i]
          hasSomeItemWidthWiderThanMin = true
        }
      }

      if (!hasSomeItemWidthWiderThanMin) {
        // 如果没有任何一个项的实际宽度大于平局预计宽度，则未分配的项使用平均宽度
        for (let i = 0; i < segCount; i++) {
          if (widths[i] === 0) {
            widths[i] = i === 0 ? firstWidth : avgWidth
          }
        }
      } else if (widths.some((item) => item === 0)) {
        // 如果有未分配的项，继续分配剩余宽度
        const usedWidth = widths.reduce((sum, w) => sum + w + SPLIT_SYMBOL_WIDTH, 0)
        const newRemainWidth = containerWidth - usedWidth
        if (newRemainWidth > 0) {
          remainWidth = newRemainWidth
          distributeWidth()
        }
      }
    }

    distributeWidth()

    realIndexes.value = pathInfo.value.map((item, i) => ({
      type: 'segment' as const,
      segPath: item.segPath,
      path: path
        .slice(0, i + 1)
        .map(encodeURIComponent)
        .join('/'),
      width: widths[i],
      isFullDisplay: widths[i] >= item.width
    }))

    return
  }

  // 无法全部显示，省略中间项
  // 根必须显示，最后一项必须显示
  const widths = Array<number>(segCount).fill(0)
  widths[0] = minWidths[0]

  /** 省略号宽度 */
  const ELLIPSIS_WIDTH = 36

  /** 当前已分配项的总宽度 */
  let usedWidth = widths[0] + ELLIPSIS_WIDTH

  // 从后往前分配最小宽度, 直到已经无法分配更多项
  for (let i = segCount - 1; i >= 1; i--) {
    if (usedWidth + minWidths[i] > containerWidth) {
      break
    }

    widths[i] = minWidths[i]
    usedWidth += widths[i] + SPLIT_SYMBOL_WIDTH
  }

  /** 余下的未分配宽度 */
  const remainWidth = containerWidth - usedWidth

  if (remainWidth > 0) {
    // 如果还有剩余宽度，则从后往前，尝试将这个宽度分配给某个已经确认显示的项
    // 这个项在获取这个宽度后，不能大于实际宽度
    for (let i = segCount - 1; i >= 1; i--) {
      if (widths[i] + remainWidth <= realWidths[i] && widths[i] !== 0) {
        widths[i] += remainWidth
        break
      }
    }
  }

  realIndexes.value = pathInfo.value
    .map((item, i) => ({
      type: 'segment' as 'segment' | 'ellipsis',
      segPath: item.segPath,
      path: path
        .slice(0, i + 1)
        .map(encodeURIComponent)
        .join('/'),
      width: widths[i],
      isFullDisplay: widths[i] >= item.width
    }))
    .filter((item) => item.width > 0)
    .toSpliced(1, 0, {
      type: 'ellipsis',
      segPath: '...',
      path: '',
      width: 32,
      isFullDisplay: true
    })
}

onMounted(() => {
  calcVisible()
  window.addEventListener('resize', calcVisible)
})
onUnmounted(() => {
  window.removeEventListener('resize', calcVisible)
})
watch([() => path], calcVisible)
</script>
<template>
  <div
    ref="container-ref"
    class="flex text-[11px] items-center min-w-[300px] w-full whitespace-nowrap relative select-text px-[10px]"
  >
    <template v-for="(seg, idx) in realIndexes">
      <template v-if="seg.type === 'segment'">
        <NuxtLink
          :key="'seg-' + idx"
          :to="'/' + encodeURIComponent(root) + '/' + seg.path"
          :style="{
            width: seg.width + 'px'
          }"
          class="text-gray-700 hover:text-blue-500 overflow-hidden relative"
        >
          <span
            :style="{
              width: seg.width + 'px'
            }"
            class="inline-block h-full"
            >{{ seg.segPath }}</span
          >
          <div
            v-if="!seg.isFullDisplay"
            class="absolute right-0 top-0 h-full w-8 pointer-events-none bg-gradient-to-r from-transparent to-white"
          ></div>
        </NuxtLink>
        <span
          v-if="idx < realIndexes.length - 1"
          :key="'seg-' + idx"
          class="mx-1 text-gray-400 select-none"
          >></span
        >
      </template>
      <template v-else>
        <span :key="'ellipsis' + idx" class="inline-block text-center text-gray-400 select-none"
          >...</span
        >
        <span :key="'ellipsis' + idx" class="mx-1 text-gray-400 select-none">></span>
      </template>
    </template>
  </div>
</template>
