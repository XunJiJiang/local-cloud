<script setup lang="ts">
import type { NuxtError } from '#app'

const { error } = defineProps({
  error: {
    type: Object as () => NuxtError,
    required: true
  }
})
</script>

<template>
  <div>
    <h1>{{ error?.statusCode }}</h1>
    <NuxtLink to="/">Go back home</NuxtLink>
  </div>
</template>
