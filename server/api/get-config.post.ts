import type { Config } from '~/types/config'

export default defineEventHandler<Promise<Config>>(async (event) => {
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
