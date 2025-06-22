import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(() => {
  const configPath = join(process.cwd(), 'public/config.json')
  const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
    path: Record<string, string>
  }
  const alias: string[] = []
  for (const key in config.path) {
    alias.push(key)
  }
  return {
    alias
  }
})
