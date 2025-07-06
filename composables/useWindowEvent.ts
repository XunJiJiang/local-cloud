/* eslint-disable @typescript-eslint/no-explicit-any */
import { windowEvent, type Type } from '~/utils/windowEvent'

export const useWindowEvent = <T extends Type>(
  type: T,
  listener: (this: Window, ev: WindowEventMap[T]) => any,
  options?: boolean | AddEventListenerOptions
) => {
  let unListen: ReturnType<typeof windowEvent> | undefined
  onMounted(() => {
    unListen = windowEvent(type, listener, options)
  })
  onUnmounted(() => {
    unListen?.()
  })
}
