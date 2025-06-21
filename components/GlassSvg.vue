<script lang="ts">
import filter_640x36 from '~/assets/images/640x36-filter.png?url'
import filter_200x160 from '~/assets/images/200x160-filter.png?url'
import filter_128x128 from '~/assets/images/128x128-filter.png?url'

const filtersKey = [
  `liquid-glass-filter_${160 / 9}`,
  `liquid-glass-filter_${5 / 4}`,
  `liquid-glass-filter_${1}`
]

export const getFilterKey = (width: number, height: number) => {
  const ratio = width / height
  let closestKey = ''
  let minDiff = Infinity
  for (const key of filtersKey) {
    const keyRatio = parseFloat(key.split('_')[1])
    const diff = Math.abs(ratio - keyRatio)
    if (diff < minDiff) {
      minDiff = diff
      closestKey = key
    }
  }
  return closestKey
}
</script>

<script setup lang="ts">
const size = useLiquidGlass()

const filters = {
  [`liquid-glass-filter_${160 / 9}`]: [filter_640x36, '640', '36'],
  [`liquid-glass-filter_${5 / 4}`]: [filter_200x160, '200', '160'],
  [`liquid-glass-filter_${1}`]: [filter_128x128, '128', '128']
}
</script>

<template>
  <div class="fixed top-0 left-0 pointer-events-none" width="0" height="0">
    <svg v-for="key in Object.entries(filters)" :key="key[0]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter
          :id="key[0]"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
          x="0"
          y="0"
          :width="size.width"
          :height="size.height"
          preserveAspectRatio="none"
        >
          <feImage id="liquid-glass-map" :href="key[1][0]" preserveAspectRatio="none"></feImage>
          <feDisplacementMap
            in="SourceGraphic"
            in2="liquid-glass-map"
            xChannelSelector="R"
            yChannelSelector="G"
            scale="30"
            preserveAspectRatio="none"
          ></feDisplacementMap>
        </filter>
      </defs>
    </svg>
  </div>
</template>
