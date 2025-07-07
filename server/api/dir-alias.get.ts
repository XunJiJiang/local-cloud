import type { Config } from '~/types/config'

export type DirAliasRes = {
  alias: {
    label: string
    config: Config
  }[]
}

export default defineEventHandler<DirAliasRes>(() => {
  const config = getFullConfig()
  const alias: {
    label: string
    config: Config
  }[] = []
  for (const key in config.path) {
    const _config = getConfig(key, config.path[key].path)
    alias.push({
      label: key,
      config: _config
    })
  }
  return {
    alias
  }
})
