import {
  supportedTextTypes,
  supportedImageTypes,
  supportedAudioTypes,
  supportedVideoTypes
} from '../utils/extension'
import { checkIgnore } from '../utils/ignore-check'

export default defineEventHandler<
  Promise<{
    type: 'text' | 'image' | 'audio' | 'video' | '[unknown type]'
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
    return {
      type: fileType
    }
  }

  if (fileType === 'video' || fileType === 'audio') {
    return {
      type: fileType
    }
  }

  return {
    type: fileType
  }
})
