<script setup lang="ts">
import previewImage from './preview/image.vue'
import previewAudio from './preview/audio.vue'
import previewVideo from './preview/video.vue'
import previewText from './preview/text.vue'
const props = defineProps<{
  root: string
  path: string[]
}>()

const { data, error } = await useFetch('/api/files-info', {
  method: 'post',
  body: {
    root: props.root,
    path: props.path
  }
})

const type = data.value?.type

const isUnknownFileType = data.value?.type === '[unknown type]'

if (error.value) {
  nextTick(() => navigateTo('/'))
  console.error('Error fetching file content:', error.value)
}
</script>

<template>
  <div>
    <component
      :is="
        type === 'image'
          ? previewImage
          : type === 'audio'
            ? previewAudio
            : type === 'video'
              ? previewVideo
              : type === 'text'
                ? previewText
                : null
      "
      v-if="!isUnknownFileType && type"
      :root="props.root"
      :path="props.path"
    />
    <div v-else-if="isUnknownFileType">暂不支持该类型预览</div>
  </div>
</template>
