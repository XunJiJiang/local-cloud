import { readFileSync } from 'fs'
import { join } from 'path'
import JSON5 from 'json5'
import type { Config } from '~/types/config'

const CONFIG_PATH = join(process.cwd(), 'public/config.json5')

export default defineEventHandler(() => {
  const configPath = CONFIG_PATH
  const config = JSON5.parse<Config>(readFileSync(configPath, 'utf-8'))
  const alias: string[] = []
  for (const key in config.path) {
    alias.push(key)
  }
  return {
    alias
  }
})
