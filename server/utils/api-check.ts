import { join } from 'path'
import ignore from 'ignore'
import tryCatch from '~/utils/tryCatch'

/** 检查当前路径是否合法, 并返回一些数据 */
export const apiCheck = async (root: string, path: string[]) => {
  const config = getFullConfig()

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
      if (key === decodeURI(root)) {
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
  const fullPath = join(rootPath, ...path.map(decodeURI))
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
