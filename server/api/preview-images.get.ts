import { checkIgnore } from '../utils/ignore-check'
import { supportedImageTypes } from '../utils/extension'
import { readFileSync } from 'fs'
import tryCatch from '~/utils/tryCatch'
import { readCompressedFile, splitCompressedPath } from '../utils/parsing-compressed-files'

/** 通过 img.src 调用 */
export default defineEventHandler(async (event) => {
  const { root, path } = getQuery<{
    root: string
    path: string
  }>(event)

  if (!root || !path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters'
    })
  }

  const { fullPath } = await checkIgnore(root, path.split('/'))

  const fileExtension = fullPath.split('.').pop()?.toLowerCase() || ''

  if (!supportedImageTypes.includes(fileExtension)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported image type'
    })
  }

  let buffer: Buffer

  if (inCompressedFile(fullPath)) {
    const { compressedFilePath, otherPath } = splitCompressedPath(fullPath)
    const [content, error] = await readCompressedFile(compressedFilePath, otherPath)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to read compressed image file'
      })
    }

    buffer = content
  } else {
    const [imageBuffer, error] = tryCatch(() =>
      readFileSync(fullPath, {
        encoding: 'binary'
      })
    )

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to read image file'
      })
    }

    if (!imageBuffer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Image file not found'
      })
    }

    buffer = Buffer.from(imageBuffer, 'binary')
  }

  setHeader(event, 'Content-Type', `image/${fileExtension}`)

  return buffer
})
