<script setup lang="ts">
const { data, error } = await useFetch('/api/config')

if (error.value) {
  console.error('Error fetching config:', error.value)
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

const aliasList = computed(() => {
  if (!data.value?.alias) return []
  return data.value.alias.map((item: string) => ({
    label: item,
    to: `/tree/${item}`
  }))
})
</script>

<template>
  <div class="justify-center max-w-[800px] mx-auto bg-blue px-0 py-10">
    <TreeList :items="aliasList" />
  </div>
</template>
