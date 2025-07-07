import type { Config } from '~/types/config'

export const getConfig = async (root: string, path: string[]): Promise<Config> => {
  const [data, error] = await tryCatch(() =>
    $fetch<Config>('/api/get-config', {
      method: 'POST',
      body: {
        root: root,
        path: path
      }
    })
  )
  if (error) {
    throw createError(error)
  }
  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Config not found'
    })
  }
  return data
}
