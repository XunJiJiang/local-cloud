<script setup lang="ts">
defineProps<{ items: { label: string; to: string }[] }>()
</script>

<template>
  <ul :class="`w-[80%] mx-auto bg-white shadow divide-gray-100 rounded-[18px]`">
    <li
      v-for="item in items"
      :key="item.to"
      v-liquid-glass="{
        margin: 3,
        borderRadius: 100
      }"
    >
      <NuxtLink
        :to="item.to"
        class="block px-3 py-2 text-gray-800 font-medium cursor-pointer select-none text-[13px] bg-transparent"
      >
        <span class="inline-block align-middle">{{ item.label }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>
