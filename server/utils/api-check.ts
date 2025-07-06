import { join } from 'path'
import { readFileSync } from 'fs'
import ignore from 'ignore'
import JSON5 from 'json5'
import type { Config } from '~/types/config'
import tryCatch from '~/utils/tryCatch'

const CONFIG_PATH = join(process.cwd(), 'public/config.json5')

/** 检查当前路径是否合法, 并返回一些数据 */
export const apiCheck = async (root: string, path: string[]) => {
  const config = JSON5.parse<Config>(readFileSync(CONFIG_PATH, 'utf-8'))

  if (!config.path || typeof config.path !== 'object') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid config format'
    })
  }

  const [rootPath, error] = tryCatch(() => {
    if (root === '') {
      return ''
    }

    for (const key in config.path) {
      if (key === root) {
        return config.path[key].path
      }
    }

    throw createError({
      statusCode: 404,
      statusMessage: 'Root path not found in config'
    })
  })

  if (error) {
    throw error
  }

  if (!rootPath) {
    return {
      fullPath: '',
      ig: ignore()
    }
  }

  const ignorePatterns: string[] = config.exclude ?? []
  const ig = ignore().add(ignorePatterns)
  const fullPath = join(rootPath, ...path)
  const relativePath = fullPath.replace(rootPath, '').slice(1)
  if (relativePath !== '' && ig.ignores(relativePath)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access to the specified path is forbidden'
    })
  }

  return {
    fullPath,
    ig
  }
}
