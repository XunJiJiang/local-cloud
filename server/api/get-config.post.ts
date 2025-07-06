import type { BaseConfig } from '~/types/config'

export default defineEventHandler<Promise<BaseConfig>>(async (event) => {
  const body = await readBody<{
    root: string
    path: string[]
  }>(event)

  const { fullPath } = await apiCheck(body.root, body.path)

  const config = getConfig(body.root, fullPath)

  return {
    ...config
  }
})
