export default defineEventHandler(() => {
  const config = getFullConfig()
  const alias: string[] = []
  for (const key in config.path) {
    alias.push(key)
  }
  return {
    alias
  }
})
