<script setup lang="ts">
useHead({
  titleTemplate: '本地云 - %s'
})
</script>

<template>
  <div>
    <GlassSvg />
    <NuxtRouteAnnouncer />
    <NuxtLayout name="outer">
      <NuxtLayout class="layouts">
        <NuxtPage />
      </NuxtLayout>
    </NuxtLayout>
  </div>
</template>
