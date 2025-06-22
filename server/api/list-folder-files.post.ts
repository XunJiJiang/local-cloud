import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { checkIgnore } from '../utils/ignore-check'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    root: string
    path: string[]
  }>(event)

  const { fullPath, ig } = await checkIgnore(body.root, body.path)

  if (inCompressedFile(fullPath) || isCompressedFile(fullPath)) {
    const { compressedFilePath, otherPath } = splitCompressedPath(fullPath)
    const { entries } = await readCompressedEntries(compressedFilePath, otherPath)

    return {
      files: entries
        .filter((entry) => entry.type === 'file')
        .map((entry) => ({
          name: entry.name,
          type: 'file'
        })),
      folders: entries
        .filter((entry) => entry.type === 'directory')
        .map((entry) => ({
          name: entry.name,
          type: 'directory'
        }))
    }
  }

  const entries = readdirSync(fullPath)
  let files = []
  let folders = []

  for (const entry of entries) {
    const entryPath = join(fullPath, entry)
    const stats = statSync(entryPath)
    if (stats.isDirectory() || isCompressedFile(entryPath)) {
      folders.push(entry)
    } else if (stats.isFile()) {
      files.push(entry)
    }
  }

  // 排除 config.exclude 中的文件和文件夹，匹配规则与 gitignore 相同

  folders = ig.filter(folders)
  files = ig.filter(files)

  return {
    files: files.map((file) => ({
      name: file,
      type: 'file'
    })),
    folders: folders.map((folder) => ({
      name: folder,
      type: 'directory'
    }))
  }
})
