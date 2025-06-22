<script lang="ts">
import filter_640x36 from '~/assets/images/640x36-filter.png?url'
import filter_320x36 from '~/assets/images/320x36-filter.png?url'
import filter_160x36 from '~/assets/images/160x36-filter.png?url'
import filter_128x128 from '~/assets/images/128x128-filter.png?url'

const filtersKey = [
  `liquid-glass-filter_640x36`,
  `liquid-glass-filter_320x36`,
  `liquid-glass-filter_160x36`,
  `liquid-glass-filter_128x128`
]

export const getFilterKey = (width: number, height: number) => {
  const ratio = width / height
  let closestKey = ''
  let minDiff = Infinity
  for (const key of filtersKey) {
    const size = key.split('_')[1].split('x')

    const keyWidth = parseInt(size[0], 10)
    const keyHeight = parseInt(size[1], 10)
    const keyRatio = keyWidth / keyHeight

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
  [`liquid-glass-filter_640x36`]: [filter_640x36, '640', '36'],
  [`liquid-glass-filter_320x36`]: [filter_320x36, '320', '36'],
  [`liquid-glass-filter_160x36`]: [filter_160x36, '160', '36'],
  [`liquid-glass-filter_128x128`]: [filter_128x128, '128', '128']
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
