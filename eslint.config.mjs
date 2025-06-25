// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import skipPrettier from 'eslint-config-prettier'

export default withNuxt(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue,js,jsx}']
  },

  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-electron/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/build/**',
      '**/release/**',
      '**/resources/**',
      '**/.output/**',
      '**/.nuxt/**',
      '**/.nuxt-dev/**',
      '**/.nuxt-ssr/**'
    ]
  },

  // 规则：组件名大驼峰
  {
    name: 'vue-naming-rules',
    files: ['**/*.vue'],
    rules: {
      'vue/component-definition-name-casing': ['error', 'PascalCase']
    }
  },

  skipPrettier
)
