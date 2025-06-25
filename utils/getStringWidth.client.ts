/**
 * @param text 需要测量的字符串
 * @param style 可选，CSS样式对象，如 { fontSize: '16px', fontFamily: 'Arial', fontWeight: 'bold' }
 * @returns 字符串宽度（像素）
 */
export function getStringWidth(text: string, style: Partial<CSSStyleDeclaration> = {}): number {
  // 创建隐藏的span元素
  const span = document.createElement('span')
  span.innerText = text || ''
  // 设置基础样式，防止影响布局
  span.style.visibility = 'hidden'
  span.style.position = 'absolute'
  span.style.whiteSpace = 'pre'
  span.style.left = '-9999px'
  // 应用自定义样式
  Object.assign(span.style, style)

  document.body.appendChild(span)
  const width = span.offsetWidth
  document.body.removeChild(span)

  return width
}
