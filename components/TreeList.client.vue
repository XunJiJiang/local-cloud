<script setup lang="ts">
import bgImg from '~/assets/images/flower.jpg?url'
defineProps<{ items: { label: string; to: string }[] }>()
</script>

<template>
  <ul
    :class="`w-[150px] mx-auto bg-white shadow divide-gray-100 rounded-[18px]`"
    :style="`background-image: url('${bgImg}'); background-size: cover; background-position: center;`"
  >
    <li
      v-for="item in items"
      :key="item.to"
      v-liquid-glass="{
        margin: 3,
        borderRadius: 20
      }"
    >
      <NuxtLink
        :to="item.to"
        class="block px-3 py-2 text-gray-800 font-medium cursor-pointer select-none text-[13px] bg-transparent text-center"
      >
        <span class="inline-block align-middle">{{ item.label }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>
