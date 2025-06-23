<script setup lang="ts">
import img from '~/assets/images/flower.jpg?url'
defineProps<{ items: { label: string; to: string }[] }>()
</script>

<template>
  <ul
    :class="`w-[80%] mx-auto bg-white shadow divide-gray-100 rounded-[18px] flex`"
    :style="`background-image: url(${img}); background-size: cover; background-position: center`"
  >
    <li
      v-for="item in items"
      :key="item.to"
      v-liquid-glass="{
        margin: 3,
        borderRadius: 100
      }"
      class="whitespace-nowrap overflow-hidden text-ellipsis w-[100%] padding-0"
      :title="item.label"
    >
      <NuxtLink
        :to="item.to"
        class="whitespace-nowrap overflow-hidden text-ellipsis block px-3 py-2 text-gray-800 font-medium cursor-pointer select-none text-[13px] bg-transparent"
      >
        <span class="align-middle">{{ item.label }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>
