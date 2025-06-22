import { checkIgnore } from '../utils/ignore-check'
import { supportedAudioTypes } from '../utils/extension'
import { statSync, createReadStream } from 'fs'
import {
  inCompressedFile,
  splitCompressedPath,
  readCompressedFile
} from '../utils/parsing-compressed-files'

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as { root: string; path: string }
  const { root, path } = query
  if (!root || !path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters'
    })
  }
  const { fullPath } = await checkIgnore(root, path.split('/'))
  // 检查是否在压缩包内
  if (inCompressedFile(path)) {
    const { compressedFilePath, otherPath } = splitCompressedPath(path)
    const absCompressed = await checkIgnore(root, compressedFilePath.split('/'))
    const ext = otherPath[otherPath.length - 1]?.split('.').pop()?.toLowerCase() || ''
    if (!supportedAudioTypes.includes(ext)) {
      throw createError({ statusCode: 400, statusMessage: 'Unsupported audio type' })
    }
    // 只支持全量读取，不支持 Range
    const [content, error] = await readCompressedFile(absCompressed.fullPath, otherPath)
    if (error || !content) {
      throw createError({
        statusCode: 404,
        statusMessage: error?.message || 'File not found in archive'
      })
    }
    setHeader(event, 'Content-Type', `audio/${ext}`)
    setHeader(event, 'Content-Length', content.length)
    setHeader(event, 'Accept-Ranges', 'none')
    return content
  }
  // 普通文件，支持 Range
  const fileExtension = fullPath.split('.').pop()?.toLowerCase() || ''
  if (!supportedAudioTypes.includes(fileExtension)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported audio type'
    })
  }
  const stats = statSync(fullPath)
  const range = getHeader(event, 'range')
  if (range) {
    // 解析 Range: bytes=start-end
    const match = /bytes=(\d+)-(\d+)?/.exec(range)
    if (match) {
      const start = parseInt(match[1], 10)
      const end = match[2] ? Math.min(parseInt(match[2], 10), stats.size - 1) : stats.size - 1
      if (start > end || start >= stats.size) {
        setResponseStatus(event, 416)
        return ''
      }
      setHeader(event, 'Content-Range', `bytes ${start}-${end}/${stats.size}`)
      setHeader(event, 'Accept-Ranges', 'bytes')
      setHeader(event, 'Content-Length', end - start + 1)
      setHeader(event, 'Content-Type', `audio/${fileExtension}`)
      setResponseStatus(event, 206)
      return createReadStream(fullPath, { start, end })
    }
  }
  // 无 Range，返回完整文件
  setHeader(event, 'Content-Type', `audio/${fileExtension}`)
  setHeader(event, 'Content-Length', stats.size)
  setHeader(event, 'Accept-Ranges', 'bytes')
  return createReadStream(fullPath)
})
