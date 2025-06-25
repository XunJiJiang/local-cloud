export const useLiquidGlass = () =>
  useState('liquid-glass-size', () => {
    const width = 0
    const height = 0
    return { width, height }
  })
