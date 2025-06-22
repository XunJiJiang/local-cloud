import { join } from 'path'
import { readFileSync } from 'fs'
import ignore from 'ignore'

/** 检查当前路径是否合法, 并返回一些数据 */
export const checkIgnore = async (root: string, path: string[]) => {
  const configPath = join(process.cwd(), 'public/config.json')
  const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
    path?: Record<string, string>
    exclude?: string[]
  }

  if (!config.path || typeof config.path !== 'object') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid config format'
    })
  }

  let rootPath = ''
  for (const key in config.path) {
    if (key === root) {
      rootPath = config.path[key]
      break
    }
  }

  if (!rootPath) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Root path not found in config'
    })
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
