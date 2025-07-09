/* eslint-disable @typescript-eslint/no-explicit-any */
import { windowEvent, type Type } from '~/utils/windowEvent'

export const useWindowEvent = <T extends Type>(
  type: T | Ref<T>,
  listener: (this: Window, ev: WindowEventMap[T]) => any,
  options?: boolean | AddEventListenerOptions
) => {
  let unListen: ReturnType<typeof windowEvent> | undefined
  onMounted(() => {
    unListen = windowEvent(isRef(type) ? type.value : type, listener, options)
  })

  if (isRef(type)) {
    watch(type, (v) => {
      unListen?.()
      unListen = windowEvent(v, listener, options)
    })
  }

  onUnmounted(() => {
    unListen?.()
  })
}
