type PreviewState = {
  isPreview: boolean
  previewType: 'image' | 'video' | 'audio' | 'text' | null
}

export const useGlobalState = defineStore('global-state', () => {
  const previewState = reactive<PreviewState>({
    isPreview: false,
    previewType: null // image, video, audio
  })

  return {
    previewState,
    setPreviewState(state: boolean, type: PreviewState['previewType']) {
      previewState.isPreview = state
      previewState.previewType = type
    },
    resetPreviewState() {
      previewState.isPreview = false
      previewState.previewType = null
    }
  }
})
