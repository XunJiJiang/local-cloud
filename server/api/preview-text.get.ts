import { checkIgnore } from '../utils/ignore-check'
import { supportedTextTypes } from '../utils/extension'
import { readFileSync } from 'fs'
import tryCatch from '~/utils/tryCatch'

export default defineEventHandler<
  Promise<{
    text: string
    extension: string
  }>
>(async (event) => {
  let { root, path } = getQuery<{
    root: string
    path: string
  }>(event)

  if (!root || !path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters'
    })
  }

  // 修正：支持中文和多级路径
  root = decodeURIComponent(root)
  path = decodeURIComponent(path)

  const { fullPath } = await checkIgnore(root, path.split('/'))

  const fileExtension = fullPath.split('.').pop()?.toLowerCase() || ''

  if (!supportedTextTypes.includes(fileExtension)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported image type'
    })
  }

  const [text, error] = tryCatch(() =>
    readFileSync(fullPath, {
      encoding: 'utf-8'
    })
  )

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'api:preview-text.get' + (error.message ?? 'Failed to read image file')
    })
  }

  return {
    text,
    extension: fileExtension
  }
})
