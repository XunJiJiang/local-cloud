import type { ListFolderFilesRes } from '~/server/api/list-folder-files.post'

export const usePageConfig = async () => {
  const paramPath = useParamPath()
  const data = await getConfig(paramPath.value[0] ?? '', paramPath.value.slice(1))
  return data
}

export const usePreviewPageTurnDirection = async () => {
  const paramPath = useParamPath()

  const [pageConfig, { data, error }] = await Promise.all([
    usePageConfig(),
    useFetch<ListFolderFilesRes>('/api/list-folder-files', {
      method: 'POST',
      body: {
        root: paramPath.value[0] ?? '',
        path: paramPath.value.slice(1, -1)
      }
    })
  ])

  if (error.value) {
    throw createError(error.value)
  }

  if (data.value?.folders.length ?? 0 > 0)
    return {
      value: 'no-preview'
    }

  if (data.value?.files.every((file) => file.fileType === 'image')) {
    return pageConfig.pageTurnDirection4ImagesOnly
  }

  return 'left2right'
}
