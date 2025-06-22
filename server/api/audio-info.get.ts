import { checkIgnore } from '../utils/ignore-check'
import { supportedAudioTypes } from '../utils/extension'
import { statSync } from 'fs'
import * as mm from 'music-metadata'

/** 获取音频文件的时长、大小等信息 */
export default defineEventHandler(async (event) => {
  const { root, path } = getQuery(event) as { root: string; path: string }
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
  const stats = statSync(fullPath)
  let duration = 0
  try {
    const meta = await mm.parseFile(fullPath)
    duration = meta.format.duration || 0
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read audio metadata'
    })
  }
  return {
    size: stats.size,
    duration,
    mime: `audio/${fileExtension}`
  }
})
