export default function <T>(callback: () => T): [T, undefined] | [undefined, Error] {
  try {
    const result = callback()
    return [result, void 0]
  } catch (error) {
    if (error instanceof Error) {
      return [void 0, error]
    } else {
      return [void 0, new Error('Unknown error')]
    }
  }
}
