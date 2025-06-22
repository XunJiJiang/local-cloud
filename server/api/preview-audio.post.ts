import { checkIgnore } from '../utils/ignore-check'
import { supportedAudioTypes } from '../utils/extension'
import tryCatch from '~/utils/tryCatch'
import { openSync, statSync, readSync, closeSync } from 'fs'

/** 音频流式加载，支持 start/end 字节区间 */
export default defineEventHandler(async (event) => {
  const { root, path, start, end, totalChunks } = await readBody<{
    root: string
    path: string
    start?: number
    end?: number
    totalChunks?: number
  }>(event)

  if (!root || !path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters'
    })
  }

  const { fullPath } = await checkIgnore(root, path.split('/'))
  const fileExtension = fullPath.split('.').pop()?.toLowerCase() || ''

  if (!supportedAudioTypes.includes(fileExtension)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported audio type'
    })
  }

  const fd = openSync(fullPath, 'r')
  const [buffer, error] = tryCatch(() => {
    const stats = statSync(fullPath)
    // totalChunks为1时直接返回完整音频
    if (totalChunks === 1 || (typeof start !== 'number' && typeof end !== 'number')) {
      setHeader(event, 'Content-Type', `audio/${fileExtension}`)
      setHeader(event, 'Content-Length', stats.size)
      const buffer = Buffer.alloc(stats.size)
      readSync(fd, buffer, 0, stats.size, 0)
      return buffer
    }
    // 计算区间
    const realStart = Math.max(0, start ?? 0)
    const realEnd = typeof end === 'number' ? Math.min(end, stats.size) : stats.size
    if (realStart >= stats.size || realStart >= realEnd) {
      throw createError({
        statusCode: 416,
        statusMessage: 'Requested range not satisfiable'
      })
    }
    const length = realEnd - realStart
    const buffer = Buffer.alloc(length)
    readSync(fd, buffer, 0, length, realStart)
    setHeader(event, 'Content-Type', `audio/${fileExtension}`)
    setHeader(event, 'Content-Length', length)
    setHeader(event, 'Accept-Ranges', 'bytes')
    return buffer
  })
  closeSync(fd)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read audio file'
    })
  }

  return buffer
})
