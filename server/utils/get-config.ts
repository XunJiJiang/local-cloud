/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync, statSync, existsSync } from 'fs'
import { join } from 'path'
import JSON5 from 'json5'
import type { BaseConfig, Config, PartialConfig } from '~/types/config'
import tryCatch from '~/utils/tryCatch'

const CONFIG_PATH = join(process.cwd(), 'public/config.json5')
const DEFAULT_CONFIG_PATH = join(process.cwd(), 'public/default-config.json5')

/**
 * 扁平配置解析
 */
function parseFlatConfig(config: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, any> = {}
  for (const key in config) {
    const keys = key.split('.')
    let current = result
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = config[key]
  }
  return result
}

/**
 * 深层合并配置
 * 当存在相同属性时, 使用源对象的值覆盖目标对象的值
 * @param target 目标对象
 * @param source 源对象
 */

function deepMerge<R = Record<string, unknown>>(
  target: Record<string, unknown>,
  ...sources: Record<string, unknown>[]
): R {
  function _deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    for (const key in source) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        if (!target[key]) {
          target[key] = {}
        }
        target[key] = deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        )
      } else {
        target[key] = source[key]
      }
    }

    return target
  }

  return sources.reduce((acc, source) => _deepMerge(acc, source), target) as R
}

export const getConfig = (root?: string, fullPath?: string): Config => {
  /** 默认配置 */
  const defaultConfig = JSON5.parse<BaseConfig>(readFileSync(DEFAULT_CONFIG_PATH, 'utf-8'))
  const config = JSON5.parse<Config>(readFileSync(CONFIG_PATH, 'utf-8'))
  /** 全局配置 */
  const globalConfig = parseFlatConfig(config.config || {})
  /** 根目录配置 */
  const rootDirConfig =
    typeof root === 'string' && root !== '' ? parseFlatConfig(config.path[root]?.config ?? {}) : {}
  /** 目标目录配置 */
  const dirConfig =
    typeof fullPath === 'string' && fullPath !== ''
      ? (tryCatch(() => {
          const stat = statSync(fullPath)
          const dir = stat.isDirectory() ? fullPath : join(fullPath, '..')
          const configFiles = [
            join(dir, '.local-cloud.config.json5'),
            join(dir, '.local-cloud.config.json')
          ]

          for (const file of configFiles) {
            if (existsSync(file)) {
              const content = readFileSync(file, 'utf-8')
              return parseFlatConfig(
                file.endsWith('.json5')
                  ? JSON5.parse<PartialConfig>(content)
                  : ((content) => {
                      const [parsed] = tryCatch(() => JSON.parse(content))
                      return (parsed ?? {}) as PartialConfig
                    })(content)
              )
            }
          }
        })[0] ?? {})
      : {}

  return deepMerge(defaultConfig, globalConfig, rootDirConfig, dirConfig)
}
