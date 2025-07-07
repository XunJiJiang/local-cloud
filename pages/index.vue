<script setup lang="ts">
import type { DirAliasRes } from '~/server/api/dir-alias.get'

const { data, error } = await useFetch<DirAliasRes>('/api/dir-alias')

if (error.value) {
  throw createError(error.value)
}

const aliasList = computed(() => {
  if (!data.value?.alias) return []
  return data.value.alias.map(({ label, config }) => ({
    label: label,
    to: `/${config.page.tree}/tree/${label}`
  }))
})
</script>

<template>
  <div class="justify-center max-w-[800px] mx-auto bg-blue px-0 py-10">
    <TreeList :items="aliasList" />
  </div>
</template>
