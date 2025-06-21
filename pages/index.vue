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
  <div class="items-center min-h-[60vh] justify-center max-w-[800px] flex mx-auto bg-blue">
    <TreeList :items="aliasList" />
  </div>
</template>
