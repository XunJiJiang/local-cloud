import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import type { Config } from '~/types/config'

export type ListFolderFilesRes = {
  files: {
    name: string
    type: string
    fileType: 'image' | 'video' | 'audio' | 'text' | '[unknown]'
  }[]
  folders: {
    name: string
    type: string
    config: Config
  }[]
}

export default defineEventHandler<Promise<ListFolderFilesRes>>(async (event) => {
  const body = await readBody<{
    root: string
    path: string[]
  }>(event)

  const { fullPath, ig } = await apiCheck(body.root, body.path)

  if (inCompressedFile(fullPath) || isCompressedFile(fullPath)) {
    const { compressedFilePath, otherPath } = splitCompressedPath(fullPath)
    const { entries } = await readCompressedEntries(compressedFilePath, otherPath)

    return {
      files: entries
        .filter((entry) => entry.type === 'file')
        .map((entry) => {
          const fileType: 'image' | 'video' | 'audio' | 'text' | '[unknown]' = getFileType(
            entry.name
          )
          return {
            name: entry.name,
            type: 'file',
            fileType
          }
        }),
      folders: entries
        .filter((entry) => entry.type === 'directory')
        .map((entry) => {
          const _config = getConfig(body.root)
          return {
            name: entry.name,
            type: 'directory',
            config: _config
          }
        })
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
    files: files.map((file) => {
      const fileType: 'image' | 'video' | 'audio' | 'text' | '[unknown]' = getFileType(file)
      return {
        name: file,
        type: 'file',
        fileType
      }
    }),
    folders: folders.map((folder) => {
      const _config = getConfig(body.root, join(fullPath, folder))
      return {
        name: folder,
        type: 'directory',
        config: _config
      }
    })
  }
})
