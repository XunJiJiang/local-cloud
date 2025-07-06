export const useParamPath = () => {
  const route = useRoute()

  return computed(() =>
    Array.isArray(route.params.path)
      ? [...route.params.path]
      : route.params.path
        ? [route.params.path]
        : []
  )
}
