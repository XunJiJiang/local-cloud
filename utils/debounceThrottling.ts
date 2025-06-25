/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 在一段时间没有执行(timer === null)后首次执行时先执行一次
 * 设置timer并在delay时间后执行
 * 如果在这段时间内没有再次执行, 则不会在delay时间后执行
 * 若在这段时间内再次执行则在delay时间后执行
 * @param fn 执行函数
 * @param delay 延迟时间
 * @param config 配置项
 * @param config.immediate 是否在执行生命周期开始时立即执行一次
 */
export const debounce = <T extends (...args: any[]) => unknown>(
  fn: T,
  delay: number = 300,
  config: { immediate?: boolean } = {}
) => {
  const { immediate = true } = config

  let timer: number | null = null

  /** 在首次执行后, delay 结束前是否再次调用 */
  let isAgain = false

  return (...args: Parameters<T>) => {
    if (!immediate) isAgain = true

    if (timer) {
      isAgain = true
      clearTimeout(timer)
    } else if (immediate) {
      fn(...args)
    }
    timer = window.setTimeout(() => {
      if (isAgain) {
        fn(...args)
        isAgain = false
      }
      timer = null
    }, delay)
  }
}

export const throttle = <T extends (...args: any[]) => unknown>(fn: T, delay: number = 300) => {
  let timer: number | null = null
  return (...args: Parameters<T>) => {
    if (timer) {
      return
    }
    timer = window.setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}
