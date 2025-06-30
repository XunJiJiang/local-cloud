export type HeaderNavItem = {
  key: string
  type: 'link' | 'button' | 'label'
  label: string
  icon?: string
  to?: string
  // onClick?: () => void
  // dropdownItems?: HeaderNavItem[]
  isDisabled?: boolean
}

/** 顶部工具栏状态类型 */
export type HeaderNavState = HeaderNavItem[]

export const useHeaderNav = defineStore('header-nav', () => {
  const headerNav = ref<HeaderNavState>([])

  watch(headerNav, (newVal, oldVal) => {
    // 获取删除的项的key和新增的项的key
    const deletedKeys = oldVal
      .filter((item) => !newVal.some((newItem) => newItem.key === item.key))
      .map((item) => item.key)
    const addedKeys = newVal
      .filter((item) => !oldVal.some((oldItem) => oldItem.key === item.key))
      .map((item) => item.key)

    for (const key of deletedKeys) {
      headerNavState.delete(key)
    }
    for (const key of addedKeys) {
      headerNavState.set(key, Date.now())
    }
  })

  /** 修改此处的值以触发事件 */
  const headerNavState = reactive<Map<string, number>>(new Map())

  /** 触发某个事件 */
  function triggerHeaderNavEvent(key: string) {
    if (headerNavState.has(key)) {
      headerNavState.set(key, Date.now())
    }
  }

  /** 监听此处以触发事件 */
  const headerNavEmit = computed<Map<string, number> | undefined>((old) => {
    if (!old) return headerNavState

    let hasChange = false

    for (const [_, item] of headerNav.value.entries()) {
      const key = item.key
      if (headerNavState.has(key)) {
        const nowTime = headerNavState.get(key)
        const lastTime = old.has(key) ? old.get(key) : null
        if (nowTime !== lastTime) {
          hasChange = true
        }
      }
    }

    if (hasChange) {
      return headerNavState
    } else {
      return old
    }
  })

  function setHeaderNav(items: HeaderNavState) {
    headerNav.value = items
  }

  function addHeaderNavItem(item: HeaderNavItem) {
    headerNav.value.push(item)
  }

  function removeHeaderNavItem(key: string) {
    headerNav.value = headerNav.value.filter((item) => item.key !== key)
  }

  return {
    headerNav,
    setHeaderNav,
    addHeaderNavItem,
    removeHeaderNavItem,
    triggerHeaderNavEvent,
    headerNavEmit
  }
})
