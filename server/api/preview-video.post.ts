import { checkIgnore } from '../utils/ignore-check'
import { supportedVideoTypes } from '../utils/extension'
import tryCatch from '~/utils/tryCatch'
import { openSync, statSync, readSync, closeSync } from 'fs'

/** 通过 img.src 调用 */
export default defineEventHandler(async (event) => {
  const { root, path, index } = await readBody<{
    root: string
    path: string
    /** 块的索引, 每块固定 1024x1024 */
    index: number
  }>(event)

  if (!root || !path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters'
    })
  }

  const { fullPath } = await checkIgnore(root, path.split('/'))

  const fileExtension = fullPath.split('.').pop()?.toLowerCase() || ''

  if (!supportedVideoTypes.includes(fileExtension)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported image type'
    })
  }

  const BLOCK_SIZE = 1024 * 1024

  const fd = openSync(fullPath, 'r')

  const [buffer, error] = tryCatch(() => {
    const stats = statSync(fullPath)
    const start = index * BLOCK_SIZE
    const end = Math.min(start + BLOCK_SIZE, stats.size)
    if (start >= stats.size) {
      throw createError({
        statusCode: 416,
        statusMessage: 'Requested block out of range'
      })
    }
    const buffer = Buffer.alloc(end - start)
    readSync(fd, buffer, 0, end - start, start)
    setHeader(event, 'Content-Type', `video/${fileExtension}`)
    setHeader(event, 'Content-Length', end - start)
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
