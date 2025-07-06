<script setup lang="ts">
const pageConfig = await usePageConfig()

const { data, error } = await useFetch('/api/dir-alias')

if (error.value) {
  throw createError(error.value)
}

const aliasList = computed(() => {
  if (!data.value?.alias) return []
  return data.value.alias.map((item: string) => ({
    label: item,
    to: `/${pageConfig.value.page.tree}/tree/${item}`
  }))
})
</script>

<template>
  <div class="justify-center max-w-[800px] mx-auto bg-blue px-0 py-10">
    <TreeList :items="aliasList" />
  </div>
</template>
