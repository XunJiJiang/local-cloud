/** 支持预览的文本类型 */
export const supportedTextTypes = [
  'txt',
  'md',
  'json',
  'html',
  'css',
  'js',
  'ts',
  'vue',
  'jsx',
  'tsx',
  'xml'
]

/** 支持预览的图片类型 */
export const supportedImageTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff']

/** 支持预览的音频类型 */
export const supportedAudioTypes = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a']

/** 支持预览的视频类型 */
export const supportedVideoTypes = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'flv']

/** 在非压缩包支持预览的类型 */
// export const supportedPreviewTypes = [
//   ...supportedTextTypes,
//   ...supportedImageTypes,
//   ...supportedAudioTypes,
//   ...supportedVideoTypes
// ]

// /** 在压缩包支持预览的类型 */
// export const supportedCompressedPreviewTypes = [
//   ...supportedTextTypes,
//   ...supportedImageTypes,
//   ...supportedAudioTypes,
//   ...supportedVideoTypes
// ]

export const getFileType = (
  fileName: string
): 'image' | 'video' | 'audio' | 'text' | '[unknown]' => {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (supportedImageTypes.includes(ext)) return 'image'
  if (supportedVideoTypes.includes(ext)) return 'video'
  if (supportedAudioTypes.includes(ext)) return 'audio'
  if (supportedTextTypes.includes(ext)) return 'text'
  return '[unknown]'
}
