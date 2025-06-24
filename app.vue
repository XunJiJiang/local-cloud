<script setup lang="ts">
useHead({
  titleTemplate: '本地云 - %s'
})
</script>

<template>
  <NuxtErrorBoundary @error="showError">
    <GlassSvg />
    <NuxtRouteAnnouncer />
    <NuxtLayout name="outer">
      <NuxtLayout class="layouts">
        <NuxtPage />
      </NuxtLayout>
    </NuxtLayout>
  </NuxtErrorBoundary>
</template>

<style>
html,
body,
#__nuxt {
  min-height: 100%;
  height: 100%;
}
</style>
