const isPromiseLike = <T>(value: T | Promise<T>): value is Promise<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  )
}

export default function tryCatch<T>(
  callback: () => Promise<T>
): Promise<[T, undefined] | [undefined, Error]>
export default function tryCatch<T>(callback: () => T): [T, undefined] | [undefined, Error]
export default function tryCatch<T>(
  callback: () => T | Promise<T>
): Promise<[T, undefined] | [undefined, Error]> | [T, undefined] | [undefined, Error] {
  try {
    const result = callback()

    if (isPromiseLike(result)) {
      return result
        .then((res) => [res, undefined] as [T, undefined])
        .catch(
          (err) =>
            [undefined, err instanceof Error ? err : new Error('Unknown error')] as [
              undefined,
              Error
            ]
        )
    }

    return [result, void 0]
  } catch (error) {
    if (error instanceof Error) {
      return [void 0, error]
    } else {
      return [void 0, new Error('Unknown error')]
    }
  }
}
