<script setup lang="ts"></script>

<template>
  <div class="min-h-screen min-w-[300px] max-w-screen flex flex-col">
    <header class="h-14 bg-gray-100 text-gray-600 flex items-center px-8 text-lg font-bold shadow">
      本地云 · Local Cloud
    </header>
    <main class="flex-1 py-8">
      <slot />
    </main>
    <footer class="h-11 text-gray-400 flex items-center justify-center text-[11px] bg-transparent">
      © 2025 本地云
    </footer>
  </div>
</template>
