<script setup lang="ts">
defineProps<{ items: { label: string; to: string }[] }>()
</script>

<template>
  <ul :class="`w-[80%] mx-auto shadow divide-gray-100 rounded-[18px]`">
    <span v-if="items.length === 0" class="text-gray-500 text-center block p-3"> 无数据 </span>
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
