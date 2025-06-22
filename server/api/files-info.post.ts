import tryCatch from '~/utils/tryCatch'
import {
  supportedTextTypes,
  supportedImageTypes,
  supportedAudioTypes,
  supportedVideoTypes
} from '../utils/extension'
import { checkIgnore } from '../utils/ignore-check'
import { getCompressedFileSize } from '../utils/parsing-compressed-files'
import { statSync } from 'fs'
import { execSync } from 'child_process'

const getMediaDuration = (filePath: string): number | null => {
  try {
    const output = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    )
    return parseFloat(output.toString().trim())
  } catch (error) {
    console.error('Error getting media duration:', error)
    return null
  }
}

export default defineEventHandler<
  Promise<{
    type: 'text' | 'image' | 'audio' | 'video' | '[unknown type]'
    size?: number
    totalChunks: number
    duration?: number
  }>
>(async (event) => {
  const body = await readBody<{
    root: string
    path: string[]
  }>(event)

  const { fullPath } = await checkIgnore(body.root, body.path)

  const fileExtension = fullPath.split('.').pop()?.toLowerCase() || ''

  const fileType = (() => {
    if (supportedTextTypes.includes(fileExtension)) {
      return 'text'
    } else if (supportedImageTypes.includes(fileExtension)) {
      return 'image'
    } else if (supportedAudioTypes.includes(fileExtension)) {
      return 'audio'
    } else if (supportedVideoTypes.includes(fileExtension)) {
      return 'video'
    } else {
      return '[unknown type]'
    }
  })()

  if (inCompressedFile(fullPath) || isCompressedFile(fullPath)) {
    const { compressedFilePath, otherPath } = splitCompressedPath(fullPath)
    const size = getCompressedFileSize(compressedFilePath, otherPath)

    if (typeof size !== 'number') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get compressed file size'
      })
    }

    return {
      type: fileType,
      totalChunks: 1,
      size
    }
  }

  const [stats, error] = tryCatch(() => statSync(fullPath))

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get file stats'
    })
  }

  if (fileType === 'video' || fileType === 'audio') {
    const chunkSize = 1024 * 1024 // 1MB per chunk
    const totalChunks = Math.ceil(stats.size / chunkSize)
    // 获取总时长
    const duration = (() => {
      const duration = getMediaDuration(fullPath)
      if (typeof duration !== 'number') {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to get media duration'
        })
      }
      return duration
    })()
    return {
      type: fileType,
      size: stats.size,
      totalChunks,
      duration
    }
  }

  return {
    type: fileType,
    totalChunks: 1
  }
})
