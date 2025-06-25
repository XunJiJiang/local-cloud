import { getFilterKey } from '~/components/GlassSvg.vue'

let overlay: HTMLDivElement | null = null

/** 是否是 safari 浏览器 */
const enableLiquidGlass =
  typeof navigator !== 'undefined' &&
  (/safari/i.test(navigator.userAgent) || /firefox/i.test(navigator.userAgent)) &&
  !/chrome/i.test(navigator.userAgent)

function createOverlay() {
  if (!overlay) {
    lastPosition.x = null
    lastPosition.y = null
    lastChangePosition.x = null
    lastChangePosition.y = null
    overlay = document.createElement('div')
    overlay.id = 'liquid-glass-overlay'
    overlay.style.cssText = `
      position: fixed;
      pointer-events: none;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid transparent;
      box-shadow: 0 0 0 0.3px rgba(255, 255, 255, 0.6), 0 16px 32px rgba(0, 0, 0, 0.12);
      border-radius: 12px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center center;
      opacity: 0;
      z-index: 999;`
    document.body.appendChild(overlay)
  }
}

type OverlayOptions = {
  margin: number
  borderRadius: number
}

let moveTimeoutId: number | null = null
const lastPosition: {
  x: number | null
  y: number | null
} = { x: null, y: null }

/** 启动、上次转向的位置 */
const lastChangePosition: {
  x: number | null
  y: number | null
} = {
  x: null,
  y: null
}

function moveOverlayTo(el: HTMLElement, { margin, borderRadius }: OverlayOptions) {
  if (!overlay) {
    createOverlay()
  }

  if (moveTimeoutId) clearTimeout(moveTimeoutId)
  if (hideTimeoutId) clearTimeout(hideTimeoutId)

  const rect = el.getBoundingClientRect()
  const targetX = rect.left + margin
  const targetY = rect.top + margin
  const targetWidth = rect.width - margin * 2
  const targetHeight = rect.height - margin * 2

  if (lastChangePosition.x === null || lastChangePosition.y === null) {
    lastChangePosition.x = targetX
    lastChangePosition.y = targetY
  } else {
    const realLastPosition = {
      x: parseFloat(getComputedStyle(overlay!).left),
      y: parseFloat(getComputedStyle(overlay!).top)
    }

    const dx1 = targetX - (realLastPosition.x ?? targetX)
    const dx2 = (realLastPosition.x ?? targetX) - lastChangePosition.x
    const dy1 = targetY - (realLastPosition.y ?? targetY)
    const dy2 = (realLastPosition.y ?? targetY) - lastChangePosition.y
    if (
      (dx1 !== 0 && dx2 !== 0 && Math.sign(dx1) !== Math.sign(dx2)) ||
      (dy1 !== 0 && dy2 !== 0 && Math.sign(dy1) !== Math.sign(dy2))
    ) {
      lastChangePosition.x = realLastPosition.x
      lastChangePosition.y = realLastPosition.y

      lastPosition.x = realLastPosition.x
      lastPosition.y = realLastPosition.y
    }
  }

  const filterKey = getFilterKey(targetWidth, targetHeight)

  const size = useLiquidGlass()

  size.value.width = targetWidth
  size.value.height = targetHeight

  if (overlay) {
    overlay.style.backdropFilter = `${enableLiquidGlass ? '' : `url(#${filterKey})`} blur(${enableLiquidGlass ? '5px' : '0.25px'}) contrast(1.2) brightness(1.01) saturate(1.1)`
  }
  // 计算原位置和新位置的距离
  const distance = Math.sqrt(
    Math.pow((lastPosition.x ?? targetX) - targetX, 2) +
      Math.pow((lastPosition.y ?? targetY) - targetY, 2)
  )

  // 计算移动方向
  const direction = {
    x: targetX > (lastPosition.x ?? targetX) ? 1 : targetX < (lastPosition.x ?? targetX) ? -1 : 1,
    y: targetY > (lastPosition.y ?? targetY) ? 1 : targetY < (lastPosition.y ?? targetY) ? -1 : 1
  }

  // 计算窗口对角尺寸
  const windowDiagonal = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2)

  // 计算当前rect对角尺寸
  const rectDiagonal = Math.sqrt(rect.width ** 2 + rect.height ** 2)

  // 计算回弹因子
  const bounceFactor = Math.max(((distance / windowDiagonal) * rectDiagonal) / 10, 4)

  // 计算是横向移动为主或纵向移动为主
  const isHorizontal =
    Math.abs((lastPosition.x ?? targetX) - targetX) >
    Math.abs((lastPosition.y ?? targetY) - targetY)

  // 计算是否超过上次位置
  if (
    lastPosition.x !== null &&
    lastPosition.y !== null &&
    (Math.abs(lastPosition.x - targetX) > 10 || Math.abs(lastPosition.y - targetY) > 10)
  ) {
    // 先直接设置到目标位置和尺寸
    overlay!.style.transition = 'all 0.25s cubic-bezier(0.42,1.01,0.83,1.00)'
    overlay!.style.left = targetX + 'px'
    overlay!.style.top = targetY + 'px'
    overlay!.style.width = targetWidth + 'px'
    overlay!.style.height = targetHeight + 'px'
    overlay!.style.opacity = '1'
    overlay!.style.borderRadius = borderRadius + 'px'

    // 应用回弹的transform
    const [translateX, translateY, scaleX, scaleY] = (() => {
      if (isHorizontal) {
        const translateX = Math.min(bounceFactor, targetWidth / 2) * direction.x
        // const translateY = Math.min(bounceFactor, targetHeight / 2) / 2
        const scaleX = 1 + Math.min(bounceFactor, targetWidth / 1.5) / (2 * targetWidth)
        const scaleY = 1 - Math.min(bounceFactor, targetHeight / 2) / targetHeight
        return [translateX, 1, scaleX, scaleY]
      } else {
        // const translateX = Math.min(bounceFactor, targetWidth / 2) / 2
        const translateY = Math.min(bounceFactor, targetHeight / 2) * direction.y
        const scaleX = 1 - Math.min(bounceFactor, targetWidth / 2) / targetWidth
        const scaleY = 1 + Math.min(bounceFactor, targetHeight / 1.5) / (2 * targetHeight)
        return [1, translateY, scaleX, scaleY]
      }
    })()

    overlay!.style.transform = `scale(${scaleX}, ${scaleY}) translate(${translateX}px, ${translateY}px)`

    // 回弹
    moveTimeoutId = window.setTimeout(() => {
      if (!overlay) return
      overlay!.style.transition = 'all 0.45s cubic-bezier(0.37,0.01,0.1,1.8)'
      overlay!.style.transform = 'translate(0, 0) scale(1, 1)'
      lastPosition.x = targetX
      lastPosition.y = targetY
    }, 250)
  } else {
    overlay!.style.left = targetX + 'px'
    overlay!.style.top = targetY + 'px'
    overlay!.style.width = targetWidth + 'px'
    overlay!.style.height = targetHeight + 'px'
    overlay!.style.opacity = '1'
    overlay!.style.borderRadius = borderRadius + 'px'

    lastPosition.x = targetX
    lastPosition.y = targetY
  }
}

let hideTimeoutId: number | null = null

function hideOverlay() {
  hideTimeoutId = window.setTimeout(() => {
    if (overlay) {
      overlay.style.opacity = '0'
    }
  }, 700)
}

const elMap = new WeakMap<HTMLElement, () => void>()

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement, Partial<OverlayOptions> | undefined, string, string>(
    'liquid-glass',
    {
      mounted(el: HTMLElement, { value: { margin = 3, borderRadius = 3 } = {} }) {
        createOverlay()
        const bind = () => {
          const moveOverlay = () => moveOverlayTo(el, { margin, borderRadius })
          el.addEventListener('mouseenter', moveOverlay)
          el.addEventListener('mouseleave', hideOverlay)

          return () => {
            el.removeEventListener('mouseenter', moveOverlay)
            el.removeEventListener('mouseleave', hideOverlay)
          }
        }
        const unbind = bind()
        elMap.set(el, unbind)

        if (enableLiquidGlass) {
          if (getComputedStyle(el).position === 'static') {
            el.style.position = 'relative'
          }

          el.childNodes.forEach((child) => {
            if (child instanceof HTMLElement) {
              // 提高显示层级，显示在liquid-glass-overlay上方
              if (getComputedStyle(child).position === 'static') {
                child.style.position = 'relative'
              }
              child.style.zIndex = '1000'
            }
          })
        }
      },
      unmounted(el: HTMLElement) {
        const unbind = elMap.get(el)
        if (unbind) {
          unbind()
          elMap.delete(el)
        }
        if (overlay && document.body.contains(overlay)) {
          document.body.removeChild(overlay)
          overlay = null
        }
      }
    }
  )
})
