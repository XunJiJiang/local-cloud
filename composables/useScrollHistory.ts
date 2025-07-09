export const useScrollHistory = () => {
  const paramPath = useParamPath()

  const currentScroll = ref<[number, number]>([0, 0])

  const scrollHistories = computed<[number, number][]>((o) => {
    if (currentScroll.value) {
      // 为了确保对 currentScroll 的响应式依赖
    }
    if (!o) {
      const def = Array.from<[number, number]>({ length: paramPath.value.length + 1 }).fill([0, 0])
      def[paramPath.value.length] = [currentScroll.value[0], currentScroll.value[1]]
      return def
    }
    const prevDepth = o.length
    const currentDepth = paramPath.value.length + 1

    if (prevDepth < currentDepth) {
      currentScroll.value = [0, 0]
      return [
        ...o,
        ...Array.from<[number, number]>({ length: currentDepth - prevDepth }).fill([0, 0])
      ]
    } else if (prevDepth > currentDepth) {
      return o.slice(0, currentDepth)
    } else {
      return [...o.slice(0, -1), [currentScroll.value[0], currentScroll.value[1]]]
    }
  })

  watch(scrollHistories, (scrollHistories, o) => {
    if (!o) return
    const prevDepth = o.length
    const currentDepth = scrollHistories.length

    if (prevDepth > currentDepth) {
      // 这是一个可有有点邪道的方式
      // 确保能滚动到指定位置
      function trySetScroll() {
        window.scrollTo({
          top: o[currentDepth - 1][0],
          left: o[currentDepth - 1][1]
        })
        setTimeout(() => {
          if (
            window.scrollY !== o[currentDepth - 1][0] ||
            window.scrollX !== o[currentDepth - 1][1]
          ) {
            trySetScroll()
          }
        }, 10)
      }
      trySetScroll()
    }
  })

  watch(paramPath, (v, o) => {
    const prevDepth = o.length + 1
    const currentDepth = v.length + 1
    nextTick(() => {
      if (prevDepth < currentDepth) {
        window.scrollTo({ top: 0, left: 0 })
      } else if (prevDepth > currentDepth) {
        const scrollHistory = scrollHistories.value[currentDepth - 1]
        if (scrollHistory)
          window.scrollTo({
            top: scrollHistory[0],
            left: scrollHistory[1]
          })
      }
    })
  })

  const scrollEventType = useState<'scrollend' | 'scroll'>('scroll-event-type', () => {
    if (window) return 'onscrollend' in window ? 'scrollend' : 'scroll'
    return 'scroll'
  })

  onMounted(() => {
    scrollEventType.value = 'onscrollend' in window ? 'scrollend' : 'scroll'
  })

  useWindowEvent(scrollEventType, () => {
    const currentScrollY = window.scrollY
    const currentScrollX = window.scrollX

    currentScroll.value = [currentScrollY, currentScrollX]
  })
}
