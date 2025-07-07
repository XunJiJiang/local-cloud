import type { Config } from '~/types/config'

export const usePageConfig = async () => {
  const paramPath = useParamPath()
  const { data, error } = await useFetch<Config>('/api/get-config', {
    method: 'POST',
    body: {
      root: paramPath.value[0] ?? '',
      path: paramPath.value.slice(1)
    }
  })
  if (error.value) {
    throw createError(error.value)
  }
  if (!data.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Config not found'
    })
  }
  return computed(() => {
    return data.value!
  })
}

export const usePreviewPageTurnDirection = async () => {
  const paramPath = useParamPath()

  const [pageConfig, { data, error }] = await Promise.all([
    usePageConfig(),
    useFetch('/api/list-folder-files', {
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

  return computed(() => {
    if (data.value?.files.every((file) => file.fileType === 'image')) {
      return pageConfig.value.pageTurnDirection4ImagesOnly
    }

    return 'left2right'
  })
}
