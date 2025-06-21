// import { execSync } from 'child_process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  // devServer: {
  //   port: 3000,
  //   host: execSync('ipconfig getifaddr en0').toString().trim()
  // },

  app: {
    head: {
      title: 'Nuxt',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxt/scripts',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ]
})
